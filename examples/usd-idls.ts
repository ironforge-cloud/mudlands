import { findIdls } from '../src/mudlands'

// Helper to log IDLs
function parseWrites(writes: { idl: Buffer }[]) {
  return writes.map((w) => JSON.parse(w.idl.toString()))
}

// Find all IDLs created for CandyMachine
const USD_PROGRAM_ID = '1USDCmv8QmvZ9JaL7bmevGsNHn7ez8TNahJzCN551sb'

// May use different RPC provider to avoid getting rate limited
const SOLANA_MAINNET = 'https://api.mainnet-beta.solana.com'

async function main() {
  const idlWrites = await findIdls(USD_PROGRAM_ID, SOLANA_MAINNET)
  console.log(JSON.stringify(parseWrites(idlWrites), null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((err: any) => {
    console.error(err)
    process.exit(1)
  })
