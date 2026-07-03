# Spec: Compact Hero Section with Security Badges

## Goal
Make the main landing page of LocalPDF more compact, professional, and functional. By reducing the visual weight of the hero section and adding client-side safety badges, we ensure that users can see the PDF tool grid immediately without scrolling, while still understanding that the app runs entirely locally and securely.

## User Review Required
No major breaking changes. The main layout of the home page will become more compact.

## Proposed Changes

### Frontend Landing Page
#### [MODIFY] [page.tsx](file:///C:/Users/freee/.gemini/antigravity/worktrees/tools/integrate-pdf-editing-features/frontend/src/app/page.tsx)
- Replace the large hero header text block with the new compact version.
- Implement the badge row using Tailwind CSS.
- Adjust vertical padding and margin of the hero wrapper to optimize space.

### Locales Translation files
#### [MODIFY] [ko.json](file:///C:/Users/freee/.gemini/antigravity/worktrees/tools/integrate-pdf-editing-features/frontend/src/locales/ko.json)
- Update `home.heroTitle` and `home.heroSubtitle`.
- Add `home.badgeLocal`, `home.badgeSecure`, and `home.badgeFree`.

#### [MODIFY] [en.json](file:///C:/Users/freee/.gemini/antigravity/worktrees/tools/integrate-pdf-editing-features/frontend/src/locales/en.json)
- Update `home.heroTitle` and `home.heroSubtitle`.
- Add `home.badgeLocal`, `home.badgeSecure`, and `home.badgeFree`.

## Verification Plan
- Run existing automated test suite (if any) or check local compilation.
- Verify visual aesthetics on mobile and desktop layout.
- Ensure language translations are fully applied and dynamic.
