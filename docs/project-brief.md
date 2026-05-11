# Sounglah Project Brief

## One-Sentence Summary

Sounglah is a heritage language learning platform that helps diaspora families preserve and learn African/local languages, starting with Médumba.

## Product Vision

Sounglah helps children in the diaspora learn their mother language through short, practical, family-centered lessons that connect them to parents, grandparents, culture, and roots.

## What Sounglah Is

- A heritage language learning platform
- A child-friendly learning experience
- A tool for family and cultural connection
- A modular platform that can later support many languages
- A place to organize high-quality learning content

## What Sounglah Is Not

- Not just a translation app
- Not a generic SaaS admin panel
- Not a full Duolingo clone
- Not a place to over-engineer the schema too early

## Starting Language

- Médumba

## Future Languages

Possible future languages:
- Fefe
- Yemba
- Duala
- Bassa
- Other African/local languages

## Primary Users

### Parents

Parents are likely the main value-recognizers. They want their children to stay connected to family, language, and culture.

### Children

Children are the main learners. The experience should be simple, warm, visual, and encouraging.

### Admins / Reviewers

Admins and reviewers manage languages, concepts, translations, lessons, and lesson items.

## MVP Direction

The MVP should focus on:
- Public landing page
- Login/admin access
- Admin CRUD for content
- Language management
- Concept management
- Concept text management
- Lesson and lesson item management
- Simple learner experience later

## Preferred Tech Stack

Frontend:
- React
- Vite
- TypeScript
- Tailwind

Backend:
- Flask
- Flask blueprints
- Application factory pattern
- SQLAlchemy later when database work begins

Database:
- Start simple
- PostgreSQL preferred later
- SQLite acceptable during early local development

## Build Philosophy

Build in small vertical slices.

Do not attempt to design the entire schema perfectly before coding. Schema should evolve as learning flows become clearer.
