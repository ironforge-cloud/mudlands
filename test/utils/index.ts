import path from 'path'
const fixtures = path.join(__dirname, 'fixtures')

export function getTransaction(name: string) {
  const filename = path.join(fixtures, 'transactions', `${name}.json`)
  const { result } = require(filename)
  return result
}
