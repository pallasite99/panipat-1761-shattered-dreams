# Image Fixes TODO

## Broken Images Found

1. **Encyclopedia.tsx** - Uses Unsplash URLs with potential CORS/referrer issues. Has `referrerPolicy="no-referrer"` but images may still fail.
2. **MainMenu.tsx** - References:
   - `maratha_faction_logo.png` (no path - needs to be `public/` or URL)
   - `durrani_faction_logo.png` (no path)
   - `historical_map.png` (referenced in StoryScreen)
   - `afghan_map.png` (referenced in StoryScreen)
3. **WarCouncil.tsx** - Has avatar imports that will fail:
   - `../assets/images/maharaja_suraj_mal_1780981012497.png`
   - `../assets/images/nawab_shuja_ud_daula_1780981037889.png`
   - `../assets/images/maratha_treasurer_raghunathrao_1780981073863.png`
   - `../assets/images/malharrao_holkar_1780981055883.png`
4. **AIDebateRoom.tsx** - Same avatar imports as above
5. **Logistics.tsx** - Supply lines images broken (need to check)
6. **StrategicMap.tsx** - Supply lines images broken (need to check)
7. **src/assets/images/** - Empty directory (only .keep file)

## Plan
1. Create placeholder SVG images for faction logos in public/
2. Create placeholder avatar PNG/SVG images in src/assets/images/
3. Fix image paths in all files
4. Add fallback error handlers
5. Fix Supply Lines images in Logistics and StrategicMap
