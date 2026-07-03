# Architecture Decision Record: Place Functional Tool Grid Above Hero Section

## Status
Accepted

## Context
The landing page of LocalPDF initially followed a conventional SaaS landing page layout, placing a large hero title, subtitle, and trust badges at the very top, followed by the tool card grid.

However, for a pure utility-oriented application like LocalPDF, this layout forced users to scroll down to access the core tools. Swapping the order to put the tool grid directly under the navigation bar and moving the description to the bottom was proposed to optimize utility access and ensure all tools are visible above the fold on standard resolutions.

## Decision
We will place the **Tool Grid at the very top** of the main landing page, directly below the navigation header.

- The 7 PDF tool cards grid will occupy the top portion of the main layout.
- A screen-reader-only `h1` element (`sr-only`) will be placed at the top of the main container to maintain proper document heading outline, SEO, and accessibility.
- The hero title, subtitle, and client-side security badges will be relocated to the bottom of the page, directly above the footer.
- The hero title heading level will be downgraded to `h2` to respect proper semantic outline structure.
- A subtle top border divider (`border-t border-gray-200 pt-16 mt-20`) will separate the tool grid and the hero/badges section.

## Consequences

### Positive
- **Instant Access & Zero Scrolling**: Users can see and interact with all PDF tools immediately upon page load without scrolling, maximizing efficiency.
- **Improved UX for Returning Users**: Eliminates redundant reading of hero text for repeat users who already know the site's purpose.
- **Tool-First PLG Alignment**: Aligning with industry-standard utility tools (e.g., TinyPNG, PDF compressors) that focus on immediate tool interaction.
- **Retained Trust Indicators**: The local-first, zero-upload trust badges are still preserved and readable below the tool grid for first-time visitors.

### Negative
- **Unconventional Page Outline**: Placing the primary descriptive text and value proposition at the bottom of the page deviates from traditional landing page hierarchies, though it fits utility-first products.
