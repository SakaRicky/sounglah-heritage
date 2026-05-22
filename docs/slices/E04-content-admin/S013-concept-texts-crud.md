# S013 - ConceptTexts CRUD

## Epic

Epic 4 - Content Admin CRUD

## Status

Done

## Goal

Build CRUD for translated text attached to concepts and languages.

## Example

Concept: greeting

Texts:
- English: Hello
- French: Bonjour
- Médumba: [translation]

## Acceptance Criteria

- Admin can manage text per concept and language.
- Structure supports English, French, Médumba, and future languages.

## Current UI Notes

- Text-only concept text create/edit uses the same centered modal treatment as language forms.
- Concept image handling remains on the concept form, where the existing image preview and upload section is still the better fit.
- Clicking the transparent backdrop outside the form or confirmation dialog closes it.

## Current Notes

- Backend and frontend Concept Texts CRUD exists and was included in S016 stabilization QA.
- Concept Text audio recording/review was completed as follow-up S014.x work.
