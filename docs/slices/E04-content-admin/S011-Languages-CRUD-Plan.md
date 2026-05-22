# S011 - Languages CRUD Plan

## Epic

Epic 4 - Content Admin CRUD

## Status

Done

## Goal

Build the first admin CRUD flow for managing languages in the Sounglah admin dashboard.

Languages are foundational. Concepts, concept texts, lessons, lesson items, stories, audio, and translation content will depend on language support.

This planning document is retained as historical context. The implemented slice summary lives in `docs/slices/E04-content-admin/S011-languages-crud.md`, and S016 stabilization verified the completed Languages CRUD flow.

---

## Key Product Decision

For this slice, use **soft-disable** instead of hard delete.

Languages should not be permanently deleted once other records may depend on them. A disabled language remains in the database but is hidden from normal content creation flows unless the admin explicitly chooses to view disabled languages.

Recommended behavior:

- Admins can create languages.
- Admins can edit languages.
- Admins can disable languages.
- Admins can re-enable languages.
- Hard delete is not part of this slice.

Hard delete can be added later only for languages with no dependent records.

---

## Why Languages Come First

Sounglah is not a single-language app. It starts with Médumba, but the system should be ready for other Cameroonian and African heritage languages such as Fefe, Yemba, Duala, Bassa, and others.

This means languages should not be hardcoded in the frontend.

Avoid this:

```ts
const languages = ["Medumba", "French", "English"];
```

Instead, fetch languages from the backend.

This allows the app to grow from:

```txt
Médumba
English
French
```

to:

```txt
Médumba
Fefe
Yemba
Duala
Bassa
English
French
```

without changing frontend source code every time.

---

## Scope

### In Scope

- Backend language model and migration.
- Backend admin API routes.
- Backend validation.
- Seed data for initial languages.
- Frontend API client and TypeScript types.
- Admin Languages page.
- Languages table.
- Search and status filter.
- Create language form.
- Edit language form.
- Disable and enable behavior.
- API contract documentation.
- Manual QA checklist.

### Out of Scope

Do not build these in S011:

- Concepts CRUD.
- Concept Texts CRUD.
- Lessons CRUD.
- Lesson Items CRUD.
- Translation import.
- Bulk upload.
- Audio upload.
- Learner-facing language selector.
- Advanced dialect management.
- Language proficiency levels.
- Full localization system.

For S011, the goal is simple:

```txt
Admin manages supported languages.
```

---

## Suggested Language Data Model

Keep the model simple but future-friendly.

```ts
Language {
  id: string;
  name: string;
  nativeName?: string;
  code: string;
  slug: string;
  description?: string;
  direction: "ltr" | "rtl";
  status: "active" | "disabled";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
```

### Field Details

#### `id`

Unique identifier. Prefer UUID.

#### `name`

Display name used in the admin UI.

Examples:

```txt
Médumba
French
English
```

#### `nativeName`

How the language is written by its own speakers, when available.

Examples:

```txt
Médumba
Français
English
```

This can be optional for now.

#### `code`

A stable internal language code.

Examples:

```txt
medumba
fr
en
```

Do not overcomplicate this slice with perfect international language-code rules yet. The key is that the code should be unique and stable.

Later, this can be improved with ISO codes or custom heritage-language identifiers.

#### `slug`

URL-safe identifier.

Examples:

```txt
medumba
french
english
```

This can be auto-generated from the name, but should still be stored.

#### `description`

Optional admin note.

Example:

```txt
Primary heritage language for the MVP.
```

#### `direction`

Default to:

```txt
ltr
```

This keeps the app future-ready for right-to-left languages without adding complexity now.

#### `status`

Use:

```txt
active
disabled
```

Active languages can be used in content management.

Disabled languages stay in the database but should not appear in normal creation dropdowns unless the admin chooses to show disabled items.

#### `sortOrder`

Useful for controlling display order later.

Example:

```txt
1 - Médumba
2 - English
3 - French
```

---

## Backend Plan

Assuming the backend is Flask + PostgreSQL, this slice should create:

```txt
Language model
Language migration
Language schema or serializer
Language admin routes
Validation rules
API contract documentation
Basic backend tests
```

---

## Database Table

Suggested table name:

```txt
languages
```

Suggested columns:

```sql
id UUID PRIMARY KEY
name VARCHAR(120) NOT NULL
native_name VARCHAR(120)
code VARCHAR(50) NOT NULL UNIQUE
slug VARCHAR(140) NOT NULL UNIQUE
description TEXT
direction VARCHAR(10) NOT NULL DEFAULT 'ltr'
status VARCHAR(20) NOT NULL DEFAULT 'active'
sort_order INTEGER NOT NULL DEFAULT 0
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL
```

Recommended constraints:

```txt
direction must be either ltr or rtl
status must be either active or disabled
name must not be empty
code must be unique
slug must be unique
```

---

## Seed Data

Seed basic starting data:

```txt
Médumba
English
French
```

Example seed values:

| Name | Native Name | Code | Slug | Direction | Status | Sort Order |
|---|---|---|---|---|---|---|
| Médumba | Médumba | medumba | medumba | ltr | active | 1 |
| English | English | en | english | ltr | active | 2 |
| French | Français | fr | french | ltr | active | 3 |

Keep seed data minimal. Do not add every future language yet unless needed for testing.

---

## Backend API Contract

Base path:

```txt
/api/admin/languages
```

All routes should require admin authentication.

---

## 1. List Languages

```http
GET /api/admin/languages
```

### Query Parameters

```txt
search
status
page
pageSize
sort
```

Allowed status filters:

```txt
active
disabled
all
```

Default status filter:

```txt
all
```

Example request:

```http
GET /api/admin/languages?status=active&search=med&page=1&pageSize=20
```

Example response:

```json
{
  "data": [
    {
      "id": "uuid-here",
      "name": "Médumba",
      "nativeName": "Médumba",
      "code": "medumba",
      "slug": "medumba",
      "description": "Primary heritage language for the MVP.",
      "direction": "ltr",
      "status": "active",
      "sortOrder": 1,
      "createdAt": "2026-05-18T10:00:00Z",
      "updatedAt": "2026-05-18T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

---

## 2. Create Language

```http
POST /api/admin/languages
```

Example request body:

```json
{
  "name": "Médumba",
  "nativeName": "Médumba",
  "code": "medumba",
  "slug": "medumba",
  "description": "Primary heritage language for the MVP.",
  "direction": "ltr",
  "status": "active",
  "sortOrder": 1
}
```

Example response:

```json
{
  "data": {
    "id": "uuid-here",
    "name": "Médumba",
    "nativeName": "Médumba",
    "code": "medumba",
    "slug": "medumba",
    "description": "Primary heritage language for the MVP.",
    "direction": "ltr",
    "status": "active",
    "sortOrder": 1,
    "createdAt": "2026-05-18T10:00:00Z",
    "updatedAt": "2026-05-18T10:00:00Z"
  }
}
```

Validation error response:

```json
{
  "error": {
    "message": "Validation failed.",
    "fields": {
      "code": "Language code already exists."
    }
  }
}
```

---

## 3. Update Language

```http
PATCH /api/admin/languages/:id
```

Example request body:

```json
{
  "name": "Médumba",
  "nativeName": "Mə̀dʉ̂mbɑ̀",
  "description": "Updated description.",
  "sortOrder": 1
}
```

Example response:

```json
{
  "data": {
    "id": "uuid-here",
    "name": "Médumba",
    "nativeName": "Mə̀dʉ̂mbɑ̀",
    "code": "medumba",
    "slug": "medumba",
    "description": "Updated description.",
    "direction": "ltr",
    "status": "active",
    "sortOrder": 1,
    "createdAt": "2026-05-18T10:00:00Z",
    "updatedAt": "2026-05-18T10:30:00Z"
  }
}
```

### Important Editing Rule

For now, allow editing:

```txt
name
nativeName
description
direction
status
sortOrder
```

Be careful with editing:

```txt
code
slug
```

`code` and `slug` may later be used by URLs, imports, lessons, and content relationships. During early development, editing them is acceptable, but the documentation should clearly say they are stable identifiers.

---

## 4. Disable or Enable Language

```http
PATCH /api/admin/languages/:id/status
```

Disable request:

```json
{
  "status": "disabled"
}
```

Enable request:

```json
{
  "status": "active"
}
```

Example response:

```json
{
  "data": {
    "id": "uuid-here",
    "name": "Médumba",
    "status": "disabled"
  }
}
```

---

## Backend Validation Rules

The backend should enforce:

```txt
name is required
code is required
slug is required
code must be unique
slug must be unique
direction must be ltr or rtl
status must be active or disabled
sortOrder must be a number
```

Recommended normalization:

```txt
Trim name
Trim nativeName
Lowercase code
Lowercase slug
Convert spaces in slug to hyphens
```

Example:

```txt
"  Médumba Language  " -> name: "Médumba Language"
"Medumba Language" -> slug: "medumba-language"
```

---

## Frontend Plan

Frontend route:

```txt
/admin/content/languages
```

This page should live under the admin dashboard shell from S010.

Sidebar section:

```txt
Content Management
  - Languages
  - Concepts
  - Concept Texts
  - Lessons
  - Lesson Items
```

For S011, only Languages needs to work. The other sidebar items can remain disabled or marked as “Coming soon”.

---

## Languages Page Layout

The page should have:

```txt
Page title
Short description
Create Language button
Search input
Status filter
Languages table
Empty state
Create/Edit form
Disable/Enable action
```

Suggested page header:

```txt
Languages

Manage the languages supported by Sounglah. Languages are used by concepts, lessons, stories, and translation content.
```

Primary button:

```txt
Add language
```

---

## Table Columns

Recommended columns:

```txt
Name
Native name
Code
Direction
Status
Sort order
Updated
Actions
```

Example table:

| Name | Native name | Code | Direction | Status | Sort | Actions |
|---|---|---|---|---|---|---|
| Médumba | Médumba | medumba | LTR | Active | 1 | Edit / Disable |
| French | Français | fr | LTR | Active | 2 | Edit / Disable |

---

## Form Fields

The create/edit form should include:

```txt
Name
Native name
Code
Slug
Description
Direction
Status
Sort order
```

For the MVP, this can be a modal, drawer, or separate page.

Recommended choice:

```txt
Use a right-side drawer or modal so the admin stays on the language list.
```

---

## Create Form Behavior

When the admin types the name:

```txt
Name: Médumba
```

Auto-suggest:

```txt
Code: medumba
Slug: medumba
```

Still allow manual editing.

This helps when adding future languages.

---

## Edit Form Behavior

When editing an existing language:

```txt
Pre-fill all existing fields
Save changes
Show success toast
Refresh table
```

If the update fails:

```txt
Show field-level validation errors
Do not close the form
```

---

## Disable Behavior

When admin clicks Disable, show a confirmation dialog:

```txt
Disable Médumba?

This language will stay in the system but will no longer be available for new content creation.
```

Buttons:

```txt
Cancel
Disable language
```

After disabling:

```txt
Show success toast
Update row status to Disabled
Change action from Disable to Enable
```

---

## Suggested Frontend File Structure

```txt
src/
  features/
    languages/
      api/
        languagesApi.ts
      components/
        LanguageForm.tsx
        LanguageTable.tsx
        LanguageStatusBadge.tsx
        LanguageFilters.tsx
        DisableLanguageDialog.tsx
      pages/
        LanguagesPage.tsx
      types/
        language.types.ts
      utils/
        languageSlug.ts
```

This keeps S011 modular and prepares the same pattern for future CRUD slices.

Later, the same feature-folder pattern can be reused for:

```txt
features/concepts
features/conceptTexts
features/lessons
features/lessonItems
```

---

## Suggested Frontend TypeScript Types

```ts
export type LanguageStatus = "active" | "disabled";

export type LanguageDirection = "ltr" | "rtl";

export interface Language {
  id: string;
  name: string;
  nativeName?: string;
  code: string;
  slug: string;
  description?: string;
  direction: LanguageDirection;
  status: LanguageStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLanguagePayload {
  name: string;
  nativeName?: string;
  code: string;
  slug: string;
  description?: string;
  direction: LanguageDirection;
  status: LanguageStatus;
  sortOrder: number;
}

export interface UpdateLanguagePayload {
  name?: string;
  nativeName?: string;
  code?: string;
  slug?: string;
  description?: string;
  direction?: LanguageDirection;
  status?: LanguageStatus;
  sortOrder?: number;
}
```

---

## Suggested Frontend API Client

```ts
export async function getLanguages(params?: {
  search?: string;
  status?: "active" | "disabled" | "all";
  page?: number;
  pageSize?: number;
}) {}

export async function createLanguage(payload: CreateLanguagePayload) {}

export async function updateLanguage(
  id: string,
  payload: UpdateLanguagePayload
) {}

export async function updateLanguageStatus(
  id: string,
  status: LanguageStatus
) {}
```

Do not call `fetch` directly inside the page component if the app already has a shared API client.

---

## Documentation Required for This Slice

Create or update:

```txt
docs/api/languages-api.md
docs/admin/languages-crud.md
```

### `docs/api/languages-api.md`

Should include:

```txt
List languages endpoint
Create language endpoint
Update language endpoint
Disable/enable language endpoint
Request examples
Response examples
Error examples
Validation rules
```

### `docs/admin/languages-crud.md`

Should include:

```txt
Purpose of Languages CRUD
Why languages are foundational
Chosen disable behavior
Frontend route
UI behavior
Future relationship with concepts, lessons, and translations
```

---

## Suggested Implementation Order

### Step 1 - Backend Model and Migration

Build the `languages` table.

Seed basic starting data:

```txt
Médumba
English
French
```

---

### Step 2 - Backend Routes

Implement:

```txt
GET /api/admin/languages
POST /api/admin/languages
PATCH /api/admin/languages/:id
PATCH /api/admin/languages/:id/status
```

---

### Step 3 - Backend Validation and Error Shape

Make sure errors are consistent.

Example:

```json
{
  "error": {
    "message": "Validation failed.",
    "fields": {
      "name": "Name is required.",
      "code": "Code already exists."
    }
  }
}
```

---

### Step 4 - API Documentation

Before frontend implementation, document the API contract.

This helps future Cursor agents avoid inventing their own response shapes.

---

### Step 5 - Frontend API Layer

Create the language API functions and TypeScript types.

---

### Step 6 - Frontend Languages Page

Build the page at:

```txt
/admin/content/languages
```

Add:

```txt
Table
Search
Status filter
Add language button
Edit action
Disable/enable action
```

---

### Step 7 - Form and Validation

Build the create/edit form.

Frontend validation should match backend validation, but backend remains the source of truth.

---

### Step 8 - Manual QA

Test these flows:

```txt
View seeded languages
Create a new language
Try creating duplicate code
Edit a language
Disable a language
Enable a language
Search languages
Filter active/disabled/all
Refresh page and confirm data persists
```

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|---|---|
| Admin can view languages | `GET /api/admin/languages` + Languages table |
| Admin can create a language | `POST /api/admin/languages` + create form |
| Admin can edit a language | `PATCH /api/admin/languages/:id` + edit form |
| Admin can disable or delete language | Use soft-disable via status endpoint |
| Backend and frontend contracts are documented | Add `docs/api/languages-api.md` and `docs/admin/languages-crud.md` |

---

## Suggested Child Tasks

Split S011 into small child tasks:

```txt
S011.1 - Backend Language model + migration
S011.2 - Backend Language API routes
S011.3 - Backend validation + tests
S011.4 - Language API documentation
S011.5 - Frontend language API client + types
S011.6 - Frontend Languages page
S011.7 - Create/Edit language form
S011.8 - Disable/Enable language behavior
S011.9 - Manual QA + reviewer pass
```

This keeps the work focused and prevents the CRUD slice from becoming too large.

---

## Modularity Notes

Languages are the first reusable CRUD pattern for the content admin area.

The implementation should establish patterns that future slices can copy:

```txt
Feature-based folder structure
Shared API client usage
Consistent response shape
Consistent error shape
Reusable status badge pattern
Reusable table pattern
Reusable create/edit form pattern
Reusable confirmation dialog pattern
```

This helps later slices move faster:

```txt
Concepts CRUD
Concept Texts CRUD
Lessons CRUD
Lesson Items CRUD
Stories CRUD
Audio CRUD
```

---

## Future-Proofing Notes

Later, languages may connect to:

```txt
ConceptTexts
Lessons
LessonItems
Stories
Audio files
Cultural notes
Translation pairs
Learner progress
Language-specific curriculum paths
```

So the Language entity should remain stable.

A future schema could add:

```txt
language_variants
orthographies
regions
dialects
language_assets
```

Do not add those now. They would make S011 too large.

For now, the best balance is:

```txt
Simple Language CRUD
Soft-disable behavior
Clean API contracts
Reusable frontend CRUD structure
```

---

## Final Recommendation

Build Languages CRUD as the first reusable content-admin pattern.

The most important architectural decision is to avoid hardcoded languages and treat each language as a real managed content entity.

For this slice, choose:

```txt
Soft-disable instead of delete
Admin-only API routes
Reusable feature folder
Documented API contract
Simple but future-friendly language fields
```

This gives Sounglah a clean foundation for the next content slices: Concepts, Concept Texts, Lessons, and Lesson Items.
