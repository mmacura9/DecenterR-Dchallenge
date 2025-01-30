import { Buffer } from 'buffer';

/**
 * @param hex {string}
 * @returns {string}
 */
export function bytesToString(hex: string): string {
    return Buffer.from(hex.replace(/^0x/, ''), 'hex')
      .toString()
      .replace(/\x00/g, '');
  }