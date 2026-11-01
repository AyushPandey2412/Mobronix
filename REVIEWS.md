# Customer reviews

Apply `supabase/migrations/012_customer_reviews.sql` in the Supabase SQL editor before using reviews. The existing legacy `reviews` table is preserved; the homepage no longer uses its static testimonials.

Customers see “Give a review” on completed orders in Track Order. Eligibility is checked on the server against the signed-in user's ID and the stored completed status. Guest orders without a matching authenticated owner cannot submit reviews. One review is allowed per enquiry, including after moderation or deletion. Reviews require 1–5 stars and 10–1,000 characters.

New reviews are pending. Admin → Reviews supports search, pending/published/hidden filters, publishing, hiding and deletion. Deletion is a soft delete so the one-review constraint remains intact. Admin cannot rewrite ratings or customer wording. Serviceable Areas remains the last navigation item.

The homepage fetches up to 12 published customer reviews on load and when the tab becomes visible. It displays only first name, device, rating and review text, with a verified customer badge. It shows no static fallback testimonials when there are no published reviews. Phone, address, order IDs and user IDs are excluded from the public API. Customers are told before submitting which fields may appear publicly and asked to avoid private details in their text. Admins should check review text for private information before publishing.

Validation: `node scripts/test-reviews.cjs`, `npx tsc --noEmit`, and lint changed files. For integration QA, complete an owned enquiry, submit a review, verify pending in admin, publish and check the homepage, then hide and check it is removed on reload. Verify another account and unfinished orders cannot submit and duplicate reviews return 409.
