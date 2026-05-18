# Languages CRUD

Route: `/admin/content/languages`

Languages are foundational content entities for Sounglah. Concepts, concept texts, lessons, lesson items, stories, audio, and translation content can later depend on language records, so supported languages are managed as database data instead of hardcoded frontend arrays.

## Behavior

Admins can:

- View supported languages.
- Search by name, native name, code, or slug.
- Filter by `active`, `disabled`, or `all`.
- Create languages.
- Edit languages.
- Disable languages.
- Re-enable languages.

Hard delete is intentionally out of scope for S011. A disabled language remains in the database but should be hidden from normal future content creation flows unless an admin explicitly chooses to view disabled languages.

## UI

The page includes:

- Page title and short description.
- `Add language` action.
- Search input.
- Status filter.
- Languages table with name, native name, code, direction, status, sort order, updated date, and actions.
- Create/edit drawer.
- Disable/enable confirmation dialog.
- Success and error messages.

Create form behavior:

- Typing a name suggests `code` and `slug`.
- Admins can manually edit both suggested identifiers.
- Backend validation remains the source of truth.

Edit form behavior:

- Existing fields are pre-filled.
- `code` and `slug` remain editable in this early slice, but the UI notes that they are stable identifiers.
- Backend field errors are shown without closing the form.

## Backend

Admin endpoints live under `/api/admin/languages` and require bearer-token admin authentication.

The backend stores:

- `id`
- `name`
- `nativeName`
- `code`
- `slug`
- `description`
- `direction`
- `status`
- `sortOrder`
- `createdAt`
- `updatedAt`

Seed data:

| Name | Native name | Code | Slug | Direction | Status | Sort |
| --- | --- | --- | --- | --- | --- | --- |
| Médumba | Médumba | `medumba` | `medumba` | `ltr` | `active` | 1 |
| English | English | `en` | `english` | `ltr` | `active` | 2 |
| French | Français | `fr` | `french` | `ltr` | `active` | 3 |

## Future Relationships

Future content admin slices should reference language records instead of hardcoded language values:

- Concepts
- Concept texts
- Lessons
- Lesson items
- Stories
- Audio files
- Cultural notes
- Translation pairs
- Learner progress

Future schema additions may include variants, orthographies, regions, dialects, and language assets. Those are intentionally deferred.

## Manual QA Checklist

- View seeded languages.
- Create a new language.
- Try creating a duplicate code.
- Edit a language.
- Disable a language.
- Enable a language.
- Search languages.
- Filter active, disabled, and all.
- Refresh the page and confirm data persists.
