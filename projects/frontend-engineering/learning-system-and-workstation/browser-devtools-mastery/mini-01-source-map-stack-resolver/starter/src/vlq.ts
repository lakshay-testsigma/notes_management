// The 64 letters of base64. A letter's position in this string is its 6-bit value.
export const BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export const CONTINUATION_BIT = 32; // bit 6: "another letter follows"
export const VALUE_MASK = 31; // low 5 bits: the payload

// TODO(1): Decode a base64 VLQ string such as "AAAA" or "iB" into signed integers.
//   1. Loop over the letters. Look up each letter's value with BASE64.indexOf.
//      Throw `Invalid base64 VLQ character: "<letter>"` for a letter that is not found.
//   2. Add (digit & VALUE_MASK) << shift to an accumulator. If (digit & CONTINUATION_BIT)
//      is set, add 5 to shift and read the next letter.
//   3. When a letter has no continuation bit, the number is complete. The lowest bit is
//      the sign (1 means negative). The size is accumulator >> 1. Push it and reset.
//   4. Throw an error that contains the word "middle" if the string ends mid-number.
export function decodeVlq(segment: string): number[] {
  throw new Error("TODO(1): decodeVlq is not implemented yet");
}
