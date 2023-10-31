import { findIdls } from '../src/mudlands'

// Helper to log IDLs
function parseWrites(writes: { idl: Buffer }[]) {
  return writes.map((w) => JSON.parse(w.idl.toString()))
}

// Find all IDLs created for CandyMachine
const CANDY_PROGRAM_ID = 'cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ'

// May use different RPC provider to avoid getting rate limited
const SOLANA_MAINNET = 'https://api.mainnet-beta.solana.com'
const RPC = process.env.RPC ?? SOLANA_MAINNET

async function main() {
  const idlWrites = await findIdls(CANDY_PROGRAM_ID, RPC)
  console.log(JSON.stringify(parseWrites(idlWrites), null, 2))
  console.log('Total of %d idls', idlWrites.length)
}

main()
  .then(() => process.exit(0))
  .catch((err: any) => {
    console.error(err)
    process.exit(1)
  })
