# Database Reset & Live Data Migration — TODO

## Steps

- [x] 1. Full database reset (prisma migrate reset --force)
- [x] 2. Create seed script with admin user (info@cedars.com / Admin@1234) + tenant
- [x] 3. Run seed to populate admin + tenant
- [x] 4. Fix AchievementsStrip.tsx — replace mock data with live API fetch
- [x] 5. Stats.tsx — kept as static (marketing counters, no DB equivalent needed)
- [x] 6. Keep Testimonials.tsx as static content (no change)
- [x] 7. Keep About page milestones as static content (no change)
- [x] 8. Verify all public pages show live data (empty states when no data)

## Bug Fixes Applied

- [x] Backend: `gallery.service.ts` — removed `"videoUrl"` from all raw SQL queries
       (column does not exist in DB after migration reset → was causing 500 on /gallery)
- [x] Backend: `tsconfig.json` — added `rootDir: "./src"` + excluded `prisma/` dir
       (fixes stale dist/ path mismatch: `Cannot find module './prisma/prisma.module'`)
- [x] Frontend: `public-api.ts` — updated `PublicGalleryItem` type (removed `videoUrl`,
       added `titleAr`, `descriptionAr`, `sortOrder` to match actual API response)

## Current State

- Backend running on http://localhost:3001/v1 ✅
- Frontend running on http://localhost:3000 ✅
- Admin user: info@cedars.com / Admin@1234 ✅
- Tenant ID: 921a4273-78be-4b91-a99b-b013e9830456 ✅
- All public API endpoints return 200 with empty arrays (no data seeded yet) ✅
- Gallery: no more 500 error ✅
- AchievementsStrip: live API, returns null when empty ✅
