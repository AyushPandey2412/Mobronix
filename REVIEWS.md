# Customer reviews

Apply `supabase/migrations/012_customer_reviews.sql` in the Supabase SQL editor before using reviews. The existing legacy `reviews` table is preserved; the homepage no longer uses its static testimonials.

If migration 012 was applied before the enquiry-deletion fix, also apply `013_preserve_reviews_on_enquiry_delete.sql`. This allows deleting an enquiry while preserving its review. Admin review cards show “Order removed” for these entries.

Customers see “Give a review” on completed orders in Track Order. Eligibility is checked on the server against the signed-in user's ID and the stored completed status. Guest orders without a matching authenticated owner cannot submit reviews. One stored review is allowed per enquiry. Permanently deleting a review allows the customer to submit a new review if their order still exists and is completed. Reviews require 1–5 stars and 10–1,000 characters.

New reviews are pending. Admin → Reviews supports search, pending/published/hidden filters, publishing, hiding and deletion. Delete permanently removes the database row. Hide keeps the row and removes it from public display. Apply migration 014 to remove older soft-deleted reviews. Admin cannot rewrite ratings or customer wording. Serviceable Areas remains the last navigation item.

The homepage fetches up to 12 published customer reviews on load and when the tab becomes visible. It displays only first name, device, rating and review text, with a verified customer badge. It displays the original static testimonials when no published customer reviews are available. Only reviews tied to real completed orders receive the verified customer badge. Phone, address, order IDs and user IDs are excluded from the public API. Customers are told before submitting which fields may appear publicly and asked to avoid private details in their text. Admins should check review text for private information before publishing.

Validation: `node scripts/test-reviews.cjs`, `npx tsc --noEmit`, and lint changed files. For integration QA, complete an owned enquiry, submit a review, verify pending in admin, publish and check the homepage, then hide and check it is removed on reload. Verify another account and unfinished orders cannot submit and duplicate reviews return 409.
