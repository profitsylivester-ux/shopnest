-- Publish the five standard pages (FAQ, About, Privacy, Terms, Support) so the Help and Legal links open real pages.
-- Only drafts are changed; text already edited in Admin is kept as it is.
UPDATE "SitePage" SET "isPublished" = true, "updatedAt" = NOW() WHERE "slug" IN ('faq', 'about', 'privacy', 'terms', 'support') AND "isPublished" = false;
