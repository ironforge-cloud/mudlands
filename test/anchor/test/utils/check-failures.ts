import spok, { Specifications, TestContext } from 'spok'
import assert from 'assert/strict'
import { IdlFailure } from '../../../../src/mudlands'

export function checkFailures(
  t: TestContext,
  expect: {
    idlAddress: string
    txsFound: boolean
    idlAccountFound: boolean
    len: number
  },
  failures: IdlFailure[]
) {
  assert.equal(failures.length, expect.len)
  if (!expect.txsFound) {
    const failure = failures.shift()
    spok(t, failure, <Specifications<IdlFailure>>{
      $topic: 'txsNotFound failure',
      err: (err: any) => spok.test(/unable to find transactions/i)(err.message),
    })
  }
  if (!expect.idlAccountFound) {
    const failure = failures.shift()
    spok(t, failure, <Specifications<IdlFailure>>{
      $topic: 'idlAccountNotFound failure',
      addr: expect.idlAddress,
      err: (err: any) =>
        spok.test(/unable to find idl at address/i)(err.message),
    })
  }
}
