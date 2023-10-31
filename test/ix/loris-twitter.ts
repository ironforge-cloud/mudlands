import assert from 'assert/strict'
import test from 'node:test'
import { IDL_SOURCE_ACCOUNT, findIdls } from '../../src/mudlands'
import spok from 'spok'
import { idlAddrForProgram } from '../../src/utils'

const LORIS_TWITTER_PROG = 'BNDCEb5uXCuWDxJW9BGmbfvR1JBMAKckfhYrEKW2Bv1W'

// This test ensures that IDLs whose init/upgrade transactions fell out of
// the archival time can still be retrieved by downloading it from the IDL
// account directly.
test('loris-twitter: load from devnet (where it exists)', async (t) => {
  const idls = await findIdls(
    LORIS_TWITTER_PROG,
    'https://api.devnet.solana.com'
  )
  assert.equal(idls.length, 1)
  const idl = idls[0]
  spok(t, idl, {
    $topic: 'idl-info',
    source: IDL_SOURCE_ACCOUNT,
    startSlot: 0,
    slot: 0,
    addr: await idlAddrForProgram(LORIS_TWITTER_PROG).then((a) => a.toBase58()),
  })
})

test('loris-twitter: load from mainnet (where it does not exist)', async () => {
  const idls = await findIdls(
    LORIS_TWITTER_PROG,
    'https://api.mainnet-beta.solana.com'
  )
  assert.equal(idls.length, 0)
})
