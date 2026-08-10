# Implementation Update

## Dashboard and navigation

- Rebuilt the dashboard as a scalable document center with a desktop sidebar and compact mobile navigation.
- Added tool search, pagination in groups of four on larger screens, and horizontally scrollable tool cards on mobile.
- Added a local Historial destination to navigation.
- Added persistent dark mode as the default; users can explicitly select light mode.
- Refined responsive layouts, card spacing, list reordering controls, previews, and draft recovery notices.

## History and editable documents

- Added a local IndexedDB history for generated files.
- History records include file metadata, creation date, last download date, open, download, and delete actions.
- Quotes, reports, contracts, and remissions persist editable snapshots and can be restored with `Continuar editando`.
- Accounting exports remain downloadable records only because their source workbook is not retained.

## Documents and exports

- Added reorder controls with drag support and touch-accessible move controls to relevant document lists.
- Added the optional general quote description field and render it in preview and PDF.
- Added a centered, low-opacity company logo watermark to every quote, report, contract, and remision PDF page.
- Added the same watermark to browser previews.
- Replaced side-by-side/long-scroll document review with Edicion and Vista previa tabs through `DocumentWorkspace`.
- Adjusted Firefox Blob URL cleanup to preserve generated downloads and previews long enough to load.

## Validation and publication

- Validated with `npm run build`, `npm run test`, and the interface detector before publication.
- The project is deployed as Cloudflare Worker `new-power-cotizador-v4` after the matching Git commit is pushed.

## Maintenance

- History, drafts, theme preference, and editable snapshots are browser-local. They are not synchronized between devices.
- Keep PDF watermark opacity low and preserve the same logo treatment between PDF and browser preview.
- When adding a document module, add its history snapshot, editor restoration, preview tab, PDF watermark, and responsive behavior together.
