# Concept Texts CRUD

Concept Texts connect language-independent concepts to language-specific text.

## Mental Model

- `Concept`: the idea, such as `greeting` or `water`
- `Language`: the language, such as English, French, or Médumba
- `ConceptText`: how that idea is expressed in that language

The MVP rule is one primary text per concept-language pair.

## Admin Route

```text
/admin/content/concept-texts
```

Sidebar location:

```text
Content Management
- Languages
- Concepts
- Concept Texts
- Lessons
- Lesson Items
```

## UI Fields

Create form:

- Concept
- Language
- Text
- Pronunciation
- Literal meaning
- Usage note
- Review status
- Status

Edit form:

- Concept and language are read-only labels.
- Text, pronunciation, notes, review status, and status are editable.

## Filters

- Search
- Concept
- Language
- Status
- Review status
- Sort

Search covers translated text, concept title, concept key, language name, and language code.

## Create Behavior

Admins choose a concept, choose a language, enter text, and save.

If that concept-language pair already exists, the backend rejects the request with:

```text
This concept already has text for the selected language.
```

## Disable And Enable

Disable keeps the record in the database but marks it unavailable for learner-facing content by default.

Enable restores it to active status.

## Review Status

Supported values:

- Draft
- Needs review
- Approved

This is only stored and editable in S013. A full reviewer workflow is out of scope.

## Manual QA Checklist

- Admin can open `/admin/content/concept-texts`.
- Admin can see seeded English and French concept texts.
- Admin can filter by language.
- Admin can filter by concept.
- Admin can filter by review status.
- Admin can search by text.
- Admin can create English, French, or Médumba text for an unfilled concept-language pair.
- Admin cannot create duplicate text for the same concept-language pair.
- Admin can edit text.
- Admin can update pronunciation.
- Admin can update usage note.
- Admin can change review status.
- Admin can disable a concept text.
- Disabled concept text remains visible when status filter is all.
- Admin can re-enable a concept text.
- Errors show useful messages.
- Page refresh keeps data.
