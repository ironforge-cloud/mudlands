const { LOCALHOST } = require('@metaplex-foundation/amman')
const path = require('path')

const FOO_PROGRAM = '7w4ooixh9TFgfmcCUsDJzHd9QqDKyxz4Mq1Bke6PVXaY'

module.exports = {
  validator: {
    killRunningValidators: true,
    programs: [
      {
        label: 'Foo',
        programId: FOO_PROGRAM,
        deployPath: path.join(__dirname, 'bins', 'foo.so'),
      },
    ],
    jsonRpcUrl: LOCALHOST,
    websocketUrl: '',
    commitment: 'confirmed',
    resetLedger: true,
    verifyFees: false,
    detached: process.env.ENABLE_RELAY == null,
  },
  relay: {
    enabled: process.env.ENABLE_RELAY != null,
    killlRunningRelay: true,
  },
  storage: {
    enabled: false,
  },
}
