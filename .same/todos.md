# OWC PNG — Logo & Imagery Update

## Task: Use PNG national emblem as logo + replace all photos with PNG imagery

- [x] Save PNG national emblem to `public/png-emblem.png`
- [x] Add `NationalEmblem` component (gold-ringed medallion) in `owc-emblem.tsx`
- [x] Update header `OWCLockup` to use the real emblem
- [x] Update footer seal (`OWCSeal`) to use the real emblem
- [x] Update admin login + admin shell + home CTA to use the real emblem
- [x] Source authentic Papua New Guinea photos (verified each renders, all PNG people/places)
- [x] Update `IMG` + `NEWS` image references in `site-data.ts`
- [x] Update 2 hardcoded image URLs + alt text in home `page.tsx` and About page
- [x] Lint clean; all routes return HTTP 200; assets serve 200

### Final image set (all authentic PNG)
- heroWorker → Port Moresby waterfront with hi-vis dock workers
- harbour   → Port Moresby townscape from the hills
- community → PNG mother & child, Gerehu Market
- child     → young Papua New Guinean with the national flag
- medical   → University of PNG medical student (self-hosted /png-medical.jpg)

### Note
- Same's screenshot/preview service failed to capture during versioning (env issue);
  app verified working via HTTP 200 on every route + rendered markup checks.
