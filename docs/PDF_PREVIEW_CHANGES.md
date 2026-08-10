# PDF and Preview Changes

## Scope

This release improves the editing and review workflow for quotes, technical reports, purchase contracts, and delivery notes.

## Watermarks

- Each PDF page renders the company logo as a centered watermark at 5.5% opacity.
- Watermarks are fixed and positioned before document content, so they appear behind the readable document surface.
- PDF watermark changes are in each feature's `pdf/*PDF.tsx` component.
- Browser previews use `DocumentWatermark` from `src/components/ui/DocumentWatermark.tsx`. It uses the same company logo with a low opacity and does not receive pointer events.

## Preview workflow

- `DocumentWorkspace` in `src/components/layout/DocumentWorkspace.tsx` provides `Edicion` and `Vista previa` tabs.
- It is used by quote, report, contract, and remision in `src/App.tsx`.
- The editor and preview are intentionally separate views. This avoids long scrolling while keeping React Hook Form state outside the tabs, so switching tabs does not lose in-progress changes.
- The tab control is touch-friendly and responsive. It works identically on desktop, tablet, and mobile.

## Maintenance notes

- Keep the PDF watermark behind document content and at a low opacity. Increasing it can make tables and photos difficult to read.
- Keep browser preview and PDF logo treatment consistent when either is changed.
- Do not move `DocumentWorkspace` state into individual forms unless preserving the current form state is verified.
- Validate PDF generation for all four document modules after editing watermark code.

## Release status

- Local validation was approved before publication.
- The release includes documentation updates in `AGENTS.md` and `docs/IMPLEMENTATION_UPDATE.md`.
