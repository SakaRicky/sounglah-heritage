# Concept Texts API

Admin-only CRUD for translated text attached to a concept and language.

## Model

`ConceptText` stores one primary expression for one concept in one language.

Fields:

- `id`
- `conceptId`
- `languageId`
- `text`
- `pronunciation`
- `literalMeaning`
- `usageNote`
- `status`: `active` or `disabled`
- `reviewStatus`: `draft`, `needs_review`, `approved`, or `rejected`
- `createdAt`
- `updatedAt`

`conceptId` references `concepts.id`. `languageId` references `languages.id`.

Important rule: `conceptId + languageId` must be unique.

## Authentication

All endpoints require admin authentication.

Send:

```http
Authorization: Bearer <token>
```

## List

```http
GET /api/admin/concept-texts
```

Query params:

- `search`
- `conceptId`
- `languageId`
- `status`
- `reviewStatus`
- `page`
- `pageSize`
- `sort`: `updated`, `concept`, `language`, or `text`

Example:

```http
GET /api/admin/concept-texts?languageId=<language-id>&status=active&page=1&pageSize=20
```

Response:

```json
{
  "data": [
    {
      "id": "uuid",
      "conceptId": "concept-uuid",
      "languageId": "language-uuid",
      "text": "Hello",
      "pronunciation": null,
      "literalMeaning": null,
      "usageNote": "Basic greeting.",
      "status": "active",
      "reviewStatus": "approved",
      "createdAt": "2026-05-18T10:00:00Z",
      "updatedAt": "2026-05-18T10:00:00Z",
      "concept": {
        "id": "concept-uuid",
        "key": "greeting",
        "title": "Greeting"
      },
      "language": {
        "id": "language-uuid",
        "name": "English",
        "code": "en"
      }
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

## Get One

```http
GET /api/admin/concept-texts/:id
```

Returns `{ "data": ConceptText }`.

## Create

```http
POST /api/admin/concept-texts
```

Body:

```json
{
  "conceptId": "concept-uuid",
  "languageId": "language-uuid",
  "text": "Bonjour",
  "pronunciation": "",
  "literalMeaning": "",
  "usageNote": "Standard French greeting.",
  "status": "active",
  "reviewStatus": "approved"
}
```

The API trims text fields. Empty optional strings are stored as `null`.

Disabled concepts and disabled languages cannot receive new concept text records.

## Update

```http
PATCH /api/admin/concept-texts/:id
```

Body:

```json
{
  "text": "Bonjour",
  "pronunciation": "bon-zhoor",
  "usageNote": "Standard French greeting.",
  "reviewStatus": "approved"
}
```

For MVP, updates do not change `conceptId` or `languageId`.

## Status

```http
PATCH /api/admin/concept-texts/:id/status
```

Body:

```json
{
  "status": "disabled"
}
```

Use `active` to re-enable.

## Validation

Required fields:

- `conceptId`
- `languageId`
- `text`

Validation rules:

- `conceptId` must reference an existing concept.
- `languageId` must reference an existing language.
- `text` cannot be empty after trimming.
- `status` must be `active` or `disabled`.
- `reviewStatus` must be `draft`, `needs_review`, `approved`, or `rejected`.
- A concept-language pair can only have one primary text.

Duplicate response:

```json
{
  "error": {
    "message": "Validation failed.",
    "fields": {
      "languageId": "This concept already has text for the selected language."
    }
  }
}
```

Missing reference responses:

```json
{
  "error": {
    "message": "Concept not found."
  }
}
```

```json
{
  "error": {
    "message": "Language not found."
  }
}
```
