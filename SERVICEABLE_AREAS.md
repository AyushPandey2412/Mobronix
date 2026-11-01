# Serviceable areas

## Deployment

1. Apply `supabase/migrations/011_serviceable_areas.sql` in your Supabase SQL editor.
2. Open `/admin/serviceable-areas` using a real admin login. Add the pincodes you serve. The list starts empty; no pickup requests are accepted until an active pincode is added. `400612` is an example, not automatically enabled.

## Behavior

- Only active pincodes can submit new enquiries or save pickup edits. The enquiry service enforces the check independently of the UI.
- Unknown pincodes show that pickup is not yet offered; paused pincodes show temporary unavailability.
- Missing configuration/database failures block submission rather than accepting unchecked pincodes.
- Existing enquiries are preserved. If editing an old enquiry in an unavailable area, select a currently serviceable pincode before saving.
- Address and payment remain optional; pincode is required.
- Customers enter their address and pincode manually. No location permission or geocoding API key is required.

## Checks

Run `node scripts/test-serviceability.cjs`, `npx tsc --noEmit`, and the build. After applying the migration, verify with an admin and customer session: add `400612`, submit that pincode, reject another pincode, and pause/enable/remove the area.
