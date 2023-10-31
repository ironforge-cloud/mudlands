import { Amman, LOCALHOST } from '@metaplex-foundation/amman-client'
import { Connection, PublicKey } from '@solana/web3.js'

export const FOO_PROGRAM = '7w4ooixh9TFgfmcCUsDJzHd9QqDKyxz4Mq1Bke6PVXaY'
export const FOO_AUTH = 'FpZSvaqguQ2iqcJ8Xmc9AxTs4sUP7jJgJoFp8Hnj8a9P'

export const amman = Amman.instance({
  knownLabels: { [FOO_PROGRAM]: 'Foo' },
})

export async function airdropFooAuth() {
  const conn = new Connection(LOCALHOST, 'confirmed')
  await amman.airdrop(conn, new PublicKey(FOO_AUTH), 20)
}
