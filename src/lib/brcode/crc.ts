/** EMV BR Code CRC16-CCITT (polynomial 0x1021, init 0xFFFF). */
export function computeCrc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export type CrcValidation = {
  valid: boolean;
  expected: string;
  actual: string;
  present: boolean;
};

export function validateCrc(payload: string): CrcValidation {
  const marker = "6304";
  const idx = payload.lastIndexOf(marker);
  if (idx === -1 || payload.length < idx + 8) {
    return { valid: false, expected: "", actual: "", present: false };
  }
  const toHash = payload.slice(0, idx + 4);
  const actual = payload.slice(idx + 4, idx + 8).toUpperCase();
  const expected = computeCrc16(toHash);
  return {
    valid: expected === actual,
    expected,
    actual,
    present: true,
  };
}
