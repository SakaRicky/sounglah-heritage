# Concepts CRUD

Route: `/admin/content/concepts`

Concepts are language-independent learning ideas. They define what can be learned, not how the idea is worded in a specific language.

## Concept vs Concept Text

Concept:

- `greeting`
- `mother`
- `water`
- `thank_you`

Concept Text, planned for a later slice, connects a concept to a language-specific wording:

- `greeting` + English = `hello`
- `greeting` + French = `bonjour`
- `greeting` + Médumba = future translation

S012 intentionally does not attach a language to concepts.

## Fields

| Field | Purpose |
| --- | --- |
| `title` | Human-friendly admin label. |
| `key` | Stable internal identifier for imports and organization. |
| `slug` | URL-safe identifier. |
| `description` | Optional meaning notes. |
| `category` | Optional grouping, such as Family or Courtesy. |
| `image_url` | Optional Cloudinary secure URL for the concept image. |
| `image_public_id` | Optional Cloudinary public ID used for replacement and deletion. |
| `image_alt_text` | Optional accessible description for the concept image. |
| `difficultyLevel` | `beginner`, `intermediate`, or `advanced`. |
| `status` | `active` or `disabled`. |
| `sortOrder` | Admin and future lesson-builder ordering. |

## UI Behavior

The Concepts page includes:

- Page title and short description.
- Add concept button.
- Search input.
- Status filter.
- Category filter.
- Difficulty filter.
- Sort control.
- Concepts table.
- Image thumbnail or “No image” state in the concepts table.
- Empty states.
- Create and edit drawer.
- Optional concept image upload, preview, alt text editing, replacement, and removal.
- Disable and enable confirmation dialog.

When the admin types a title in the create form, the UI suggests:

- `key` with lowercase words joined by underscores.
- `slug` with lowercase words joined by hyphens.

Admins can still edit both fields during MVP development. The form includes helper text explaining that keys should be stable.

## Soft Disable

Concepts are not hard deleted in S012. The admin can disable a concept, which keeps it in the database while marking it unavailable for new content creation by default.

This avoids breaking future dependencies such as:

- Concept texts.
- Lessons.
- Lesson items.
- Stories.
- Exercises.
- Audio.
- Learner progress.

## Seed Concepts

The backend seeds a small starter set:

- Greeting
- Mother
- Father
- Water
- Food
- Thank You
- Yes
- No
- Family
- Home

## Manual QA Checklist

- Admin can open `/admin/content/concepts`.
- Seed concepts appear in the table.
- Admin can search by title.
- Admin can search by key.
- Admin can filter by status.
- Admin can filter by difficulty.
- Admin can create a concept.
- Duplicate key is rejected.
- Duplicate slug is rejected.
- Admin can edit a concept.
- Admin can upload a JPEG, PNG, or WebP concept image.
- Admin sees a thumbnail in the concept table.
- Admin can replace a concept image.
- Admin can update image alt text.
- Admin can remove a concept image.
- Admin can disable a concept.
- Disabled concept remains visible when status filter is all.
- Disabled concept appears when status filter is disabled.
- Admin can re-enable a disabled concept.
- Page refresh keeps data.
- API errors show useful messages.

## Future Dependencies

This structure is intended to support Concept Texts, Lessons, Lesson Items, audio recordings, cultural notes, curriculum paths, and learner progress without making the Concept model language-specific.
