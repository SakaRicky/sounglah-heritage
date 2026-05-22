# Concepts Admin API

Base path: `/api/admin/concepts`

All endpoints require admin bearer-token authentication.

## Purpose

Concepts are language-independent learning ideas. They do not store translations or language-specific wording. Concept text records will attach language-specific wording later.

## Data Model

```ts
type ConceptStatus = "active" | "disabled";
type ConceptDifficultyLevel = "beginner" | "intermediate" | "advanced";

type Concept = {
  id: string;
  key: string;
  slug: string;
  title: string;
  description?: string | null;
  category?: string | null;
  difficultyLevel: ConceptDifficultyLevel;
  status: ConceptStatus;
  publishedAt: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};
```

## List Concepts

`GET /api/admin/concepts`

Query params:

| Param | Values | Default |
| --- | --- | --- |
| `search` | string | none |
| `status` | `active`, `disabled`, `all` | `all` |
| `category` | string | none |
| `difficultyLevel` | `beginner`, `intermediate`, `advanced`, `all` | `all` |
| `sort` | `sortOrder`, `title`, `newest` | `sortOrder` |
| `page` | number | `1` |
| `pageSize` | number, max `100` | `20` |

Example:

```http
GET /api/admin/concepts?search=family&status=active&page=1&pageSize=20
```

Response:

```json
{
  "data": [
    {
      "id": "uuid-here",
      "key": "mother",
      "slug": "mother",
      "title": "Mother",
      "description": "The concept of mother in a family context.",
      "category": "Family",
      "difficultyLevel": "beginner",
      "status": "active",
      "publishedAt": null,
      "isPublished": false,
      "sortOrder": 2,
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

## Get One Concept

`GET /api/admin/concepts/:id`

Response:

```json
{
  "data": {
    "id": "uuid-here",
    "key": "thank_you",
    "slug": "thank-you",
    "title": "Thank You",
    "description": "A polite expression of gratitude.",
    "category": "Courtesy",
    "difficultyLevel": "beginner",
    "status": "active",
    "publishedAt": null,
    "isPublished": false,
    "sortOrder": 6,
    "createdAt": "2026-05-18T10:00:00Z",
    "updatedAt": "2026-05-18T10:00:00Z"
  }
}
```

## Create Concept

`POST /api/admin/concepts`

Request:

```json
{
  "key": "thank_you",
  "slug": "thank-you",
  "title": "Thank You",
  "description": "A polite expression of gratitude.",
  "category": "Courtesy",
  "difficultyLevel": "beginner",
  "status": "active",
  "sortOrder": 6
}
```

Response: `201 Created`

```json
{
  "data": {
    "id": "uuid-here",
    "key": "thank_you",
    "slug": "thank-you",
    "title": "Thank You",
    "description": "A polite expression of gratitude.",
    "category": "Courtesy",
    "difficultyLevel": "beginner",
    "status": "active",
    "publishedAt": null,
    "isPublished": false,
    "sortOrder": 6,
    "createdAt": "2026-05-18T10:00:00Z",
    "updatedAt": "2026-05-18T10:00:00Z"
  }
}
```

## Update Concept

`PATCH /api/admin/concepts/:id`

Request:

```json
{
  "title": "Thank You",
  "description": "A basic polite expression used to show gratitude.",
  "category": "Courtesy",
  "difficultyLevel": "beginner",
  "sortOrder": 5
}
```

Response:

```json
{
  "data": {
    "id": "uuid-here",
    "key": "thank_you",
    "slug": "thank-you",
    "title": "Thank You",
    "description": "A basic polite expression used to show gratitude.",
    "category": "Courtesy",
    "difficultyLevel": "beginner",
    "status": "active",
    "publishedAt": null,
    "isPublished": false,
    "sortOrder": 5,
    "createdAt": "2026-05-18T10:00:00Z",
    "updatedAt": "2026-05-18T10:30:00Z"
  }
}
```

## Status Endpoint

`PATCH /api/admin/concepts/:id/status`

Request:

```json
{
  "status": "disabled"
}
```

Response:

```json
{
  "data": {
    "id": "uuid-here",
    "key": "thank_you",
    "slug": "thank-you",
    "title": "Thank You",
    "description": "A polite expression of gratitude.",
    "category": "Courtesy",
    "difficultyLevel": "beginner",
    "status": "disabled",
    "publishedAt": null,
    "isPublished": false,
    "sortOrder": 6,
    "createdAt": "2026-05-18T10:00:00Z",
    "updatedAt": "2026-05-18T10:30:00Z"
  }
}
```

## Publish Concept

`POST /api/admin/concepts/:id/publish`

Publishing is guarded by concept completion. A concept can only be published when every active language marked as required for concept completion has an active concept text, and every required language with `requiresConceptTextReview = true` has `reviewStatus = approved`. English, French, and other support languages can be required without review gating.

Success response:

```json
{
  "data": {
    "id": "uuid-here",
    "key": "thank_you",
    "slug": "thank-you",
    "title": "Thank You",
    "description": "A polite expression of gratitude.",
    "category": "Courtesy",
    "difficultyLevel": "beginner",
    "status": "active",
    "publishedAt": "2026-05-22T10:00:00Z",
    "isPublished": true,
    "sortOrder": 6,
    "createdAt": "2026-05-18T10:00:00Z",
    "updatedAt": "2026-05-22T10:00:00Z"
  }
}
```

Incomplete response:

```json
{
  "error": {
    "message": "Concept cannot be published because required texts are missing or not approved."
  },
  "missingLanguages": ["med"],
  "draftLanguages": [],
  "needsReviewLanguages": [],
  "rejectedLanguages": []
}
```

## List Concept Completion

`GET /api/admin/concepts/completion`

Returns concepts with their required-language completion state. The `status` query param filters completion status, not concept visibility.

Query params:

| Param | Values | Default |
| --- | --- | --- |
| `search` | string | none |
| `status` | `needs_translation`, `has_rejected_text`, `draft`, `needs_review`, `complete`, `published`, `all` | `all` |
| `conceptStatus` | concept visibility: `active`, `disabled`, `all` | `all` |
| `isComplete` | `true` or `false` — filters by required-language readiness | none |
| `language` | active required language code, such as `med`, `en`, or `fr` | none |
| `page` | number | `1` |
| `pageSize` | number, max `100` | `20` |

The `language` filter returns concepts where that required language is missing, or (for heritage review languages) not approved.

Response:

```json
{
  "data": [
    {
      "id": "uuid-here",
      "key": "mother",
      "slug": "mother",
      "title": "Mother",
      "description": "The concept of mother in a family context.",
      "category": "Family",
      "difficultyLevel": "beginner",
      "status": "active",
      "publishedAt": null,
      "isPublished": false,
      "sortOrder": 2,
      "createdAt": "2026-05-18T10:00:00Z",
      "updatedAt": "2026-05-18T10:00:00Z",
      "completionStatus": "needs_translation",
      "isComplete": false,
      "isReadyToPublish": false,
      "missingLanguages": ["med"],
      "draftLanguages": [],
      "needsReviewLanguages": [],
      "rejectedLanguages": [],
      "languages": [
        {
          "languageId": "uuid-here",
          "languageCode": "med",
          "languageName": "Médumba",
          "hasText": false,
          "textStatus": null,
          "textId": null,
          "text": null,
          "pronunciation": null
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

## Get Concept Completion

`GET /api/admin/concepts/:id/completion`

Returns one concept with the same completion fields as the completion list. Useful when editing an existing lesson item that may still link a legacy incomplete concept.

## Concept Completion Summary

`GET /api/admin/concepts/completion/summary`

Response:

```json
{
  "data": {
    "totalConcepts": 120,
    "needsTranslation": 35,
    "hasRejectedText": 4,
    "draft": 6,
    "needsReview": 18,
    "complete": 52,
    "published": 15
  }
}
```

## Validation

The API enforces:

- `title`, `key`, and `slug` are required.
- `key` is unique.
- `slug` is unique.
- `difficultyLevel` is `beginner`, `intermediate`, or `advanced`.
- `status` is `active` or `disabled`.
- `sortOrder` must be numeric.

Normalization:

- `title`, `description`, and `category` are trimmed.
- `key` is lowercased and spaces become underscores.
- `slug` is lowercased and spaces become hyphens.

Validation error:

```json
{
  "error": {
    "message": "Validation failed.",
    "fields": {
      "key": "Concept key already exists."
    }
  }
}
```
