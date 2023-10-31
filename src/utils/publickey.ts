import BN from 'bn.js'
import bs58 from 'bs58'
import { sha256 } from '@noble/hashes/sha256'
import * as ed25519 from '@noble/ed25519'

export const MAX_SEED_LENGTH = 32
export const PUBLIC_KEY_LENGTH = 32

/**
 * Minimal implementation of `PublicKey` class so we don't have to pull in the entire
 * `web3.js` package.
 */
export class PublicKey {
  private _bn: BN
  constructor(value: string | Uint8Array) {
    if (typeof value === 'string') {
      const decoded = bs58.decode(value)
      if (decoded.length != PUBLIC_KEY_LENGTH) {
        throw new Error(`Invalid public key input`)
      }
      this._bn = new BN(decoded)
    } else {
      this._bn = new BN(value)
    }

    if (this._bn.byteLength() > PUBLIC_KEY_LENGTH) {
      throw new Error(`Invalid public key input`)
    }
  }

  /**
   * Find a valid program address
   *
   * Valid program addresses must fall off the ed25519 curve.  This function
   * iterates a nonce until it finds one that when combined with the seeds
   * results in a valid program address.
   */
  static findProgramAddressSync(
    seeds: Array<Buffer | Uint8Array>,
    programId: PublicKey
  ): [PublicKey, number] {
    let nonce = 255
    let address: PublicKey | undefined
    while (nonce != 0) {
      try {
        const seedsWithNonce = seeds.concat(Buffer.from([nonce]))
        address = this.createProgramAddressSync(seedsWithNonce, programId)
      } catch (err) {
        if (err instanceof TypeError) {
          throw err
        }
        nonce--
        continue
      }
      return [address, nonce]
    }
    throw new Error(`Unable to find a viable program address nonce`)
  }

  /**
   * Derive a program address from seeds and a program ID.
   */
  /* eslint-disable require-await */
  static createProgramAddressSync(
    seeds: Array<Buffer | Uint8Array>,
    programId: PublicKey
  ): PublicKey {
    let buffer = Buffer.alloc(0)
    seeds.forEach(function (seed) {
      if (seed.length > MAX_SEED_LENGTH) {
        throw new TypeError(`Max seed length exceeded`)
      }
      buffer = Buffer.concat([buffer, toBuffer(seed)])
    })
    buffer = Buffer.concat([
      buffer,
      programId.toBuffer(),
      Buffer.from('ProgramDerivedAddress'),
    ])
    const publicKeyBytes = sha256(buffer)
    if (isOnCurve(publicKeyBytes)) {
      throw new Error(`Invalid seeds, address must fall off the curve`)
    }
    return new PublicKey(publicKeyBytes)
  }

  /**
   * Derive a public key from another key, a seed, and a program ID.
   * The program ID will also serve as the owner of the public key, giving
   * it permission to write data to the account.
   */
  static async createWithSeed(
    fromPublicKey: PublicKey,
    seed: string,
    programId: PublicKey
  ): Promise<PublicKey> {
    const buffer = Buffer.concat([
      fromPublicKey.toBuffer(),
      Buffer.from(seed),
      programId.toBuffer(),
    ])
    const publicKeyBytes = sha256(buffer)
    return new PublicKey(publicKeyBytes)
  }

  toBase58(): string {
    return bs58.encode(this.toBytes())
  }

  toBytes(): Uint8Array {
    const buf = this.toBuffer()
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
  }

  toBuffer(): Buffer {
    const b = this._bn.toArrayLike(Buffer)
    if (b.length === PUBLIC_KEY_LENGTH) {
      return b
    }

    const zeroPad = Buffer.alloc(32)
    b.copy(zeroPad, 32 - b.length)
    return zeroPad
  }
}

// -----------------
// Helpers
// -----------------
function toBuffer(arr: Buffer | Uint8Array | Array<number>): Buffer {
  if (Buffer.isBuffer(arr)) {
    return arr
  } else if (arr instanceof Uint8Array) {
    return Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength)
  } else {
    return Buffer.from(arr)
  }
}

function isOnCurve(publicKey: Uint8Array): boolean {
  try {
    ed25519.Point.fromHex(publicKey, true /* strict */)
    return true
  } catch {
    return false
  }
}
