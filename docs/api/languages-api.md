# Languages Admin API

Base path: `/api/admin/languages`

All endpoints require an admin bearer token:

```http
Authorization: Bearer <token>
```

## Data Shape

```json
{
  "id": "uuid-here",
  "name": "Médumba",
  "nativeName": "Médumba",
  "code": "medumba",
  "slug": "medumba",
  "description": "Primary heritage language for the MVP.",
  "direction": "ltr",
  "status": "active",
  "isRequiredForConceptCompletion": true,
  "sortOrder": 1,
  "createdAt": "2026-05-18T10:00:00Z",
  "updatedAt": "2026-05-18T10:00:00Z"
}
```

`code` and `slug` are stable identifiers. They are editable during early development, but future content relationships may depend on them.

## List Languages

`GET /api/admin/languages`

Query parameters:

| Name | Notes |
| --- | --- |
| `search` | Searches name, native name, code, and slug. |
| `status` | `active`, `disabled`, or `all`. Defaults to `all`. |
| `page` | 1-based page number. Defaults to `1`. |
| `pageSize` | Defaults to `20`. Maximum `100`. |

Example:

```http
GET /api/admin/languages?status=active&search=med&page=1&pageSize=20
```

Response:

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
      "isRequiredForConceptCompletion": true,
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

## Create Language

`POST /api/admin/languages`

Request:

```json
{
  "name": "Médumba",
  "nativeName": "Médumba",
  "code": "medumba",
  "slug": "medumba",
  "description": "Primary heritage language for the MVP.",
  "direction": "ltr",
  "status": "active",
  "isRequiredForConceptCompletion": true,
  "sortOrder": 1
}
```

Response: `201 Created`

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
    "isRequiredForConceptCompletion": true,
    "sortOrder": 1,
    "createdAt": "2026-05-18T10:00:00Z",
    "updatedAt": "2026-05-18T10:00:00Z"
  }
}
```

## Update Language

`PATCH /api/admin/languages/:id`

Editable fields:

`name`, `nativeName`, `code`, `slug`, `description`, `direction`, `status`, `isRequiredForConceptCompletion`, `sortOrder`

Request:

```json
{
  "name": "Médumba",
  "nativeName": "Mə̀dʉ̂mbɑ̀",
  "description": "Updated description.",
  "isRequiredForConceptCompletion": true,
  "sortOrder": 1
}
```

Response:

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
    "isRequiredForConceptCompletion": true,
    "sortOrder": 1,
    "createdAt": "2026-05-18T10:00:00Z",
    "updatedAt": "2026-05-18T10:30:00Z"
  }
}
```

## Disable Or Enable Language

`PATCH /api/admin/languages/:id/status`

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
    "name": "Médumba",
    "nativeName": "Médumba",
    "code": "medumba",
    "slug": "medumba",
    "description": "Primary heritage language for the MVP.",
    "direction": "ltr",
    "status": "disabled",
    "isRequiredForConceptCompletion": true,
    "sortOrder": 1,
    "createdAt": "2026-05-18T10:00:00Z",
    "updatedAt": "2026-05-18T10:30:00Z"
  }
}
```

## Validation

Backend rules:

- `name` is required and trimmed.
- `code` is required, lowercased, trimmed, and unique.
- `slug` is required, lowercased, trimmed, space-to-hyphen normalized, and unique.
- `direction` must be `ltr` or `rtl`.
- `status` must be `active` or `disabled`.
- `isRequiredForConceptCompletion` must be `true` or `false`.
- `sortOrder` must be numeric.

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

Authentication error response:

```json
{
  "error": {
    "message": "Admin authentication is required."
  }
}
```
