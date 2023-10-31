import test from 'node:test'
import spok from 'spok'

import { getTransaction } from './utils/'
import { extractSetBuffer } from '../src/mudlands'
import { idlAddrForProgram } from '../src/utils'
import assert from 'assert/strict'

const USD = '1USDCmv8QmvZ9JaL7bmevGsNHn7ez8TNahJzCN551sb'
const FOO = '7w4ooixh9TFgfmcCUsDJzHd9QqDKyxz4Mq1Bke6PVXaY'

test('extract-setbuffer-tx: transaction with error throws', async () => {
  const idlAddr = await idlAddrForProgram(USD)
  let { transaction, meta } = getTransaction('set-buffer.foo')
  meta = {
    ...meta,
    err: {
      InstructionError: [
        0,
        {
          Custom: 0,
        },
      ],
    },
  }
  assert.rejects(
    extractSetBuffer(transaction, meta, USD, idlAddr.toBase58(), 99),
    /transaction with error/i
  )
})

test('extract-setbuffer-tx: valid write transaction from local', async (t) => {
  const idlAddr = await idlAddrForProgram(FOO)
  const { transaction, meta } = getTransaction('set-buffer.foo')
  const res = await extractSetBuffer(
    transaction,
    meta,
    FOO,
    idlAddr.toBase58(),
    99
  )

  spok(t, res, {
    $topic: 'set buffer',
    idl: idlAddr.toBase58(),
    program: FOO,
    srcAddr: 'CQjg8FSi427zVFfbHqJqy7k3w74nAXkH3qFeABcY3kea',
    slot: 99,
  })
})

test('extract-idlwrite-tx: valid setbuffer transaction from mainnet', async (t) => {
  const idlAddr = await idlAddrForProgram(USD)
  const { transaction, meta } = getTransaction('set-buffer.usd')
  const res = await extractSetBuffer(
    transaction,
    meta,
    USD,
    idlAddr.toBase58(),
    99
  )
  spok(t, res, {
    $topic: 'set buffer',
    idl: idlAddr.toBase58(),
    program: USD,
    srcAddr: '3s1nymBqKjEhftgQJhxktXLvTn9whxdLu2QV6hR6b29V',
    slot: 99,
  })
})
