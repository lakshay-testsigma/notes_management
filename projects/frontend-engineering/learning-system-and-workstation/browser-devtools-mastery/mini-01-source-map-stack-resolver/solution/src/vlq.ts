// The 64 letters of base64. A letter's position in this string is its 6-bit value.
const BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const CONTINUATION_BIT = 32; // bit 6: "another letter follows"
const VALUE_MASK = 31; // low 5 bits: the payload

/** Decode a base64 VLQ string such as "AAAA" or "iB" into a list of signed integers. */
export function decodeVlq(segment: string): number[] {
  const values: number[] = [];
  let accumulated = 0;
  let shift = 0;

  for (const letter of segment) {
    const digit = BASE64.indexOf(letter);
    if (digit < 0) throw new Error(`Invalid base64 VLQ character: "${letter}"`);
    // The spec limits values to 32 bits, so more than 7 letters is invalid.
    if (shift > 30) throw new Error("VLQ value does not fit in 32 bits");

    // Least significant group comes first, so each new group is shifted higher.
    accumulated += (digit & VALUE_MASK) << shift;
    if (digit & CONTINUATION_BIT) {
      shift += 5;
      continue;
    }

    // The lowest bit is the sign; the rest is the size.
    const isNegative = (accumulated & 1) === 1;
    const magnitude = accumulated >> 1;
    // "0 - magnitude" avoids the value -0 when the input is "B".
    values.push(isNegative ? 0 - magnitude : magnitude);
    accumulated = 0;
    shift = 0;
  }

  if (shift !== 0) throw new Error("VLQ string ends in the middle of a number");
  return values;
}
