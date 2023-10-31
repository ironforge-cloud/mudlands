import bs58 from 'bs58'

export function decodeIxData(base58Str: string) {
  return Buffer.from(bs58.decode(base58Str))
}

export function bufMatchesIxDiscriminator(buf: Buffer, disc: Buffer) {
  return buf.subarray(0, 8).equals(disc)
}

export function ixDataMatchesDiscriminator(base58Str: string, disc: Buffer) {
  const buf = decodeIxData(base58Str)
  return bufMatchesIxDiscriminator(buf, disc)
}
