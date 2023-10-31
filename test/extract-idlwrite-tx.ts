import test from 'node:test'
import spok from 'spok'

import { getTransaction } from './utils/'
import { deserializeWriteTxData, extractIdlWriteTxData } from '../src/mudlands'
import { idlAddrForProgram } from '../src/utils'
import assert from 'assert/strict'

const USD = '1USDCmv8QmvZ9JaL7bmevGsNHn7ez8TNahJzCN551sb'
const FOO = '7w4ooixh9TFgfmcCUsDJzHd9QqDKyxz4Mq1Bke6PVXaY'

test('extract-idlwrite-tx: valid write transaction from local', async (t) => {
  const idlAddr = await idlAddrForProgram(FOO)
  const { transaction } = getTransaction('idl-write.foo-mini')
  const buf = await extractIdlWriteTxData(transaction, FOO, idlAddr.toBase58())
  assert(buf != null)

  const json = await deserializeWriteTxData([buf])
  assert(json != null)
  const res = JSON.parse(json.toString())

  spok(t, res, {
    $topic: 'minimal idl',
    version: '255',
    name: 'foo',
    instructions: [],
  })
})

test('extract-idlwrite-tx: valid write transaction from mainnet', async (t) => {
  const tgtAddr = '3s1nymBqKjEhftgQJhxktXLvTn9whxdLu2QV6hR6b29V'
  let buf1: Buffer | null
  let buf2: Buffer | null
  {
    const { transaction } = getTransaction('idl-write.usd-01')
    buf1 = await extractIdlWriteTxData(transaction, USD, tgtAddr)
    assert(buf1 != null)
  }
  {
    const { transaction } = getTransaction('idl-write.usd-02')
    buf2 = await extractIdlWriteTxData(transaction, USD, tgtAddr)
    assert(buf2 != null)
  }

  const json = await deserializeWriteTxData([buf1, buf2])
  assert(json != null)
  const res = JSON.parse(json.toString())

  spok(t, res, {
    $topic: 'usd idl',
    version: '1.11.0',
    name: 'collateral_manager',
    accounts: spok.arrayElements(6),
    types: spok.arrayElements(4),
  })
})
