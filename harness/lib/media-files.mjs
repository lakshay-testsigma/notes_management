// Zero-dependency readers for the media files the video pipeline produces.
// They let the harness verify a render without FFmpeg/ffprobe on the host:
// an MP4 is parsed for its `ftyp`, `moov/mvhd` duration and video track size,
// a WAV for its sample rate and data length.

import fs from 'node:fs';

/** Iterate the ISO-BMFF boxes in buffer[start, end). */
function* boxes(buffer, start, end) {
  let offset = start;
  while (offset + 8 <= end) {
    let size = buffer.readUInt32BE(offset);
    const type = buffer.toString('latin1', offset + 4, offset + 8);
    let header = 8;
    if (size === 1) {
      if (offset + 16 > end) return;
      size = Number(buffer.readBigUInt64BE(offset + 8));
      header = 16;
    } else if (size === 0) {
      size = end - offset;
    }
    if (size < header || offset + size > end) return;
    yield { type, start: offset, body: offset + header, end: offset + size };
    offset += size;
  }
}

function child(buffer, parent, type) {
  for (const box of boxes(buffer, parent.body, parent.end)) if (box.type === type) return box;
  return null;
}

/**
 * Read an MP4 file. Returns { ok, brand, duration, width, height, hasVideo, hasAudio, problem }.
 * `duration` is in seconds. Only the box headers and the `moov` box are read.
 */
export function probeMp4(file) {
  let buffer;
  try {
    buffer = fs.readFileSync(file);
  } catch (error) {
    return { ok: false, problem: `cannot read ${file}: ${error.code ?? error.message}` };
  }
  const top = [...boxes(buffer, 0, buffer.length)];
  const ftyp = top.find((b) => b.type === 'ftyp');
  if (!ftyp) return { ok: false, problem: 'not an MP4 file (no ftyp box)' };
  const brand = buffer.toString('latin1', ftyp.body, ftyp.body + 4);
  const moov = top.find((b) => b.type === 'moov');
  if (!moov) return { ok: false, brand, problem: 'MP4 has no moov box (the render did not finish)' };
  const mvhd = child(buffer, moov, 'mvhd');
  if (!mvhd) return { ok: false, brand, problem: 'MP4 has no mvhd box' };
  const version = buffer.readUInt8(mvhd.body);
  const timescale = version === 1 ? buffer.readUInt32BE(mvhd.body + 20) : buffer.readUInt32BE(mvhd.body + 12);
  const units = version === 1 ? Number(buffer.readBigUInt64BE(mvhd.body + 24)) : buffer.readUInt32BE(mvhd.body + 16);
  const duration = timescale > 0 ? units / timescale : 0;

  let width = null, height = null, hasVideo = false, hasAudio = false;
  for (const trak of boxes(buffer, moov.body, moov.end)) {
    if (trak.type !== 'trak') continue;
    const mdia = child(buffer, trak, 'mdia');
    const hdlr = mdia && child(buffer, mdia, 'hdlr');
    const handler = hdlr ? buffer.toString('latin1', hdlr.body + 8, hdlr.body + 12) : '';
    if (handler === 'vide') {
      hasVideo = true;
      const tkhd = child(buffer, trak, 'tkhd');
      if (tkhd) {
        const v = buffer.readUInt8(tkhd.body);
        const at = tkhd.body + (v === 1 ? 88 : 76);
        width = buffer.readUInt32BE(at) / 65536;
        height = buffer.readUInt32BE(at + 4) / 65536;
      }
    }
    if (handler === 'soun') hasAudio = true;
  }
  return { ok: hasVideo && duration > 0, brand, duration, width, height, hasVideo, hasAudio, problem: hasVideo ? null : 'MP4 has no video track' };
}

/** Read a PCM WAV header. Returns { ok, duration, sampleRate, channels, problem }. */
export function probeWav(file) {
  let buffer;
  try {
    buffer = fs.readFileSync(file);
  } catch (error) {
    return { ok: false, problem: `cannot read ${file}: ${error.code ?? error.message}` };
  }
  if (buffer.toString('latin1', 0, 4) !== 'RIFF' || buffer.toString('latin1', 8, 12) !== 'WAVE') {
    return { ok: false, problem: 'not a RIFF/WAVE file' };
  }
  let offset = 12, sampleRate = 0, channels = 0, bytesPerSecond = 0, dataBytes = 0;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString('latin1', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (id === 'fmt ') {
      channels = buffer.readUInt16LE(offset + 10);
      sampleRate = buffer.readUInt32LE(offset + 12);
      bytesPerSecond = buffer.readUInt32LE(offset + 16);
    } else if (id === 'data') {
      dataBytes = Math.min(size, buffer.length - offset - 8);
      break;
    }
    offset += 8 + size + (size % 2);
  }
  if (!bytesPerSecond) return { ok: false, problem: 'WAV has no fmt chunk' };
  return { ok: dataBytes > 0, duration: dataBytes / bytesPerSecond, sampleRate, channels, problem: dataBytes > 0 ? null : 'WAV has no audio data' };
}

/** Parse a WebVTT file into cues: [{ start, end, text }] (seconds). */
export function parseVtt(text) {
  if (!/^WEBVTT/.test(text.replace(/^﻿/, ''))) return null;
  const toSeconds = (stamp) => {
    const parts = stamp.trim().split(':').map(Number);
    return parts.reduce((total, part) => total * 60 + part, 0);
  };
  const cues = [];
  for (const block of text.split(/\r?\n\r?\n/)) {
    const lines = block.split(/\r?\n/).filter(Boolean);
    const at = lines.findIndex((line) => line.includes('-->'));
    if (at === -1) continue;
    const [from, to] = lines[at].split('-->').map((part) => part.trim().split(/\s+/)[0]);
    cues.push({ start: toSeconds(from), end: toSeconds(to), text: lines.slice(at + 1).join('\n') });
  }
  return cues;
}

/** 75.5 -> "00:01:15.500" */
export function vttStamp(seconds) {
  const ms = Math.round(seconds * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const rest = ms % 1000;
  const pad = (n, w = 2) => String(n).padStart(w, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(rest, 3)}`;
}
