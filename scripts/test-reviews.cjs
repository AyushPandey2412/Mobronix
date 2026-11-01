const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const zod = require('zod')
function compile(file, dependencies = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const context = { exports: {}, URL, require: name => { if (!(name in dependencies)) throw new Error('Unexpected dependency: ' + name); return dependencies[name] } }
  vm.runInNewContext(output, context)
  return context.exports
}
const helpers = compile('lib/reviews.ts', { zod })
const id = '11111111-1111-4111-8111-111111111111'
const userId = 'owner'
const valid = { enquiry_id: id, rating: 4, review_text: 'Pickup and payment went smoothly.' }

async function main() {
  assert.equal(helpers.reviewEligibility({ user_id: userId, status: 'completed' }, userId), true)
  for (const status of ['new', 'payment_completed', 'cancelled', 'pickup_scheduled']) assert.equal(helpers.reviewEligibility({ user_id: userId, status }, userId), false)
  assert.equal(helpers.reviewEligibility({ user_id: 'someone-else', status: 'completed' }, userId), false)
  assert.equal(helpers.reviewEligibility({ user_id: null, status: 'completed' }, userId), false)
  assert.equal(helpers.publicReviewName('  Asha Sharma  '), 'Asha')
  assert.equal(helpers.publicReviewName(null), 'Customer')
  for (const body of [{ ...valid, rating: 0 }, { ...valid, rating: 6 }, { ...valid, rating: 2.5 }, { ...valid, review_text: 'short' }, { ...valid, review_text: 'a'.repeat(1001) }, { ...valid, enquiry_id: 'bad' }]) assert.equal(helpers.customerReviewSchema.safeParse(body).success, false)
  assert.equal(helpers.customerReviewSchema.safeParse(valid).success, true)

  let user = { id: userId }
  let order = { id, user_id: userId, status: 'completed', guest_name: 'Asha Sharma', devices: [{ model: 'iPhone 15' }] }
  let inserted = null
  let insertError = null
  const db = { from(table) {
    if (table === 'customer_reviews') return { insert: async row => { inserted = row; return { error: insertError } } }
    return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: table === 'enquiries' ? order : { full_name: 'Asha Sharma' }, error: null }) }) }) }
  } }
  const api = compile('app/api/reviews/route.ts', {
    zod,
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options.status }) } },
    '@/lib/supabase/server': { createRouteClient: async () => ({ auth: { getUser: async () => ({ data: { user } }) } }), createServiceClient: () => db },
    '@/lib/reviews': helpers,
    '@/lib/ratelimit': { clientIp: () => 'test', rateLimit: async () => ({ ok: true }) },
  })
  const req = { json: async () => ({ ...valid, name: 'Spoofed Name', status: 'published', user_id: 'someone-else' }) }
  assert.equal((await api.POST(req)).status, 201)
  assert.equal(inserted.name, 'Asha')
  assert.equal(inserted.user_id, userId)
  assert.equal(inserted.status, 'pending')
  assert.equal(inserted.device, 'iPhone 15')
  insertError = { code: '23505' }
  assert.equal((await api.POST(req)).status, 409)
  inserted = null; order = { ...order, user_id: 'someone-else' }
  assert.equal((await api.POST(req)).status, 403)
  assert.equal(inserted, null)
  order = { ...order, user_id: userId, status: 'cancelled' }
  assert.equal((await api.POST(req)).status, 403)
  user = null
  assert.equal((await api.POST(req)).status, 401)
  let selectedFields = ''
  let publicStatus = ''
  const publicApi = compile('app/api/reviews/route.ts', {
    zod,
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options.status }) } },
    '@/lib/supabase/server': { createServiceClient: () => ({ from: () => ({ select: fields => {
      selectedFields = fields
      return { eq: (field, status) => {
        assert.equal(field, 'status'); publicStatus = status
        return { order: () => ({ limit: async () => ({ data: [], error: null }) }) }
      } }
    } }) }) },
    '@/lib/reviews': helpers,
    '@/lib/ratelimit': {},
  })
  assert.equal((await publicApi.GET({ url: 'http://localhost/api/reviews' })).status, 200)
  assert.equal(publicStatus, 'published')
  assert.equal(selectedFields, 'id, name, device, rating, review_text')
  let adminRole = 'customer'
  let moderated = null
  let permanentlyDeleted = false
  const adminApi = compile('app/api/admin/reviews/route.ts', {
    zod,
    'next/server': { NextResponse: { json: (body, options = {}) => ({ body, status: options.status || 200 }) } },
    '@/lib/supabase/server': {
      createRouteClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: userId } } }) }, from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { role: adminRole } }) }) }) }) }),
      createServiceClient: () => ({ from: () => ({
        update: row => { moderated = row; return { eq: () => ({ neq: () => ({ select: () => ({ maybeSingle: async () => ({ data: { id }, error: null }) }) }) }) } },
        delete: () => { permanentlyDeleted = true; return { eq: (field, value) => { assert.equal(field, 'id'); assert.equal(value, id); return { select: () => ({ maybeSingle: async () => ({ data: { id }, error: null }) }) } } } },
      }) }),
    },
  })
  const moderation = { method: 'PATCH', json: async () => ({ id, status: 'published', review_text: 'Admin rewrite' }) }
  assert.equal((await adminApi.PATCH(moderation)).status, 403)
  assert.equal(moderated, null)
  adminRole = 'admin'
  assert.equal((await adminApi.PATCH(moderation)).status, 200)
  assert.equal(moderated.status, 'published')
  assert.equal(Object.keys(moderated).length, 1)
  assert.equal((await adminApi.PATCH({ method: 'PATCH', json: async () => ({ id, status: 'deleted' }) })).status, 200)
  assert.equal(permanentlyDeleted, true)
  console.log('Review checks passed: ownership, completed status, validation, first-name privacy, pending moderation, duplicate prevention, and authentication.')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
