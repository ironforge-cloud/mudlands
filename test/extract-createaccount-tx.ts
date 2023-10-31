import test from 'node:test'
import spok from 'spok'
import { getTransaction } from './utils/'
import { extractCreateAccount } from '../src/mudlands'
import { idlAddrForProgram } from '../src/utils'
import assert from 'assert/strict'

const USD = '1USDCmv8QmvZ9JaL7bmevGsNHn7ez8TNahJzCN551sb'
const FOO = '7w4ooixh9TFgfmcCUsDJzHd9QqDKyxz4Mq1Bke6PVXaY'

test('extract-createaccount-tx: transaction with error throws', async () => {
  const idlAddr = await idlAddrForProgram(USD)
  const { transaction, meta } = getTransaction('create-acc-err.usd')
  assert.rejects(
    extractCreateAccount(transaction, meta, USD, idlAddr.toBase58(), 99),
    /transaction with error/i
  )
})

test('extract-createaccount-tx: old valid create transaction from mainnet', async (t) => {
  const idlAddr = await idlAddrForProgram(USD)
  const { transaction, meta } = getTransaction('create-acc.usd')
  const res = await extractCreateAccount(
    transaction,
    meta,
    USD,
    idlAddr.toBase58(),
    99
  )
  spok(t, res, {
    $topic: 'create-account-result',
    idl: 'Ahs3Spb5rZpBkJPNjRpj285332ZZN4GCfLrvSWZ1z7rE',
    program: '1USDCmv8QmvZ9JaL7bmevGsNHn7ez8TNahJzCN551sb',
    slot: 99,
  })
})

test('extract-createaccount-tx: valid create transaction from local', async (t) => {
  const idlAddr = await idlAddrForProgram(FOO)
  const { transaction, meta } = getTransaction('create-acc.foo-mini')
  const res = await extractCreateAccount(
    transaction,
    meta,
    FOO,
    idlAddr.toBase58(),
    99
  )
  spok(t, res, {
    $topic: 'create-account-result',
    idl: 'CyCbCVxJUzFbNnZGb4qXXVFMqGDK78ESX8zgeYZ4NVnt',
    program: '7w4ooixh9TFgfmcCUsDJzHd9QqDKyxz4Mq1Bke6PVXaY',
    slot: 99,
  })
})
