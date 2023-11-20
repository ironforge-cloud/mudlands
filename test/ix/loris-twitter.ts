import assert from 'assert/strict'
import test from 'node:test'
import { IDL_SOURCE_ACCOUNT, findIdls } from '../../src/mudlands'
import spok from 'spok'
import { idlAddrForProgram } from '../../src/utils'
import { checkFailures } from '../anchor/test/utils'

const LORIS_TWITTER_PROG = 'BNDCEb5uXCuWDxJW9BGmbfvR1JBMAKckfhYrEKW2Bv1W'
const LORIS_TWITTER_IDL = '6azdLYmAcYg5iXXUxFVW99sWgYuHq44M6JbDSKpatSX8'

// This test ensures that IDLs whose init/upgrade transactions fell out of
// the archival time can still be retrieved by downloading it from the IDL
// account directly.
test('loris-twitter: load from devnet (where it exists)', async (t) => {
  const { idls, failures } = await findIdls(
    LORIS_TWITTER_PROG,
    'https://api.devnet.solana.com'
  )
  // NOTE: the IDL txs aren't available on devnet (due to not being fully archival)
  checkFailures(
    t,
    {
      idlAddress: LORIS_TWITTER_IDL,
      txsFound: false,
      idlAccountFound: true,
      len: 1,
    },
    failures
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

test('loris-twitter: load from mainnet (where it does not exist)', async (t) => {
  const { idls, failures } = await findIdls(
    LORIS_TWITTER_PROG,
    'https://api.mainnet-beta.solana.com'
  )
  checkFailures(
    t,
    {
      idlAddress: LORIS_TWITTER_IDL,
      txsFound: false,
      idlAccountFound: false,
      len: 2,
    },
    failures
  )
  assert.equal(idls.length, 0)
})
