// Run with: node scripts/test-serviceability.cjs
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')

const source = fs.readFileSync(require('node:path').join(__dirname, '../lib/serviceability.ts'), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
const context = { exports: {} }
vm.runInNewContext(compiled, context)
const { checkServiceability, requireServiceablePincode } = context.exports

function database(row, error = null) {
  return { from(table) {
    assert.equal(table, 'serviceable_areas')
    return { select() { return { eq(field, value) {
      assert.equal(field, 'pincode'); assert.equal(value, '400612')
      return { maybeSingle: async () => ({ data: row, error }) }
    } } } }
  } }
}

async function main() {
  const active = database({ is_active: true })
  assert.equal((await checkServiceability(active, '400612')).serviceable, true)
  await requireServiceablePincode(active, '400612')
  for (const row of [null, { is_active: false }]) {
    assert.equal((await checkServiceability(database(row), '400612')).serviceable, false)
    await assert.rejects(requireServiceablePincode(database(row), '400612'), e => e.status === 400)
  }
  assert.match((await checkServiceability(database(null), '400612')).message, /don’t offer pickup/)
  assert.match((await checkServiceability(database({ is_active: false }), '400612')).message, /temporarily/)
  for (const pincode of ['', '000000', '40061', '4006123', 'abcdef', ' 400612']) {
    await assert.rejects(requireServiceablePincode({}, pincode), e => e.status === 400)
  }
  await assert.rejects(requireServiceablePincode(database(null, { message: 'Missing table' }), '400612'), e => e.status === 503)
  console.log('Serviceability checks passed: enabled, paused, unsupported, invalid, and database failure.')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
