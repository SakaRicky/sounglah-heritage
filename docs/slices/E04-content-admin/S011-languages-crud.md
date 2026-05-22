# S011 - Languages CRUD

## Epic

Epic 4 - Content Admin CRUD

## Status

Done

## Goal

Build the first admin CRUD flow for managing languages.

## Why First

Languages are foundational. Concepts, texts, lessons, and lesson items will depend on language support.

## Acceptance Criteria

- Admin can view languages.
- Admin can create a language.
- Admin can edit a language.
- Admin can disable or delete a language depending on chosen backend behavior.
- Backend and frontend API contracts are documented.

## Current UI Notes

- The language create/edit form is a centered modal with grouped language identity, system configuration, and notes sections.
- Clicking the transparent backdrop outside the form closes the modal.
- The centered layout is preferred for this form because the language fields benefit from two- and three-column scanning; a side drawer is better reserved for short quick-edit flows.

## Current Notes

- Backend and frontend Languages CRUD exists and was included in S016 stabilization QA.
