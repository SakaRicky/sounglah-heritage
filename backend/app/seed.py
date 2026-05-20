import csv
import re
from pathlib import Path

from flask import current_app
from werkzeug.security import generate_password_hash

from app.extensions import db
from app.models.concept import Concept
from app.models.concept_text import ConceptText
from app.models.language import Language
from app.models.user import User


EXTRACTION_DIR = Path(__file__).resolve().parents[1] / "sounglah_extraction"
CONCEPTS_SEED_FILE = EXTRACTION_DIR / "concepts_seed.csv"
CONCEPT_TEXTS_SEED_FILE = EXTRACTION_DIR / "concept_texts_seed.csv"

DIFFICULTY_LEVEL_MAP = {
    "beginner": "beginner",
    "beginner_story": "beginner",
    "beginner_plus": "intermediate",
    "intermediate": "intermediate",
    "advanced": "advanced",
    "advanced_culture": "advanced",
    "review": "beginner",
    "ui": "beginner",
}


def _read_seed_csv(path):
    with path.open(encoding="utf-8-sig", newline="") as seed_file:
        return list(csv.DictReader(seed_file))


def _optional_string(value):
    if value is None:
        return None

    normalized = str(value).strip()
    return normalized or None


def _slug_from_key(value):
    slug = str(value or "").strip().lower().replace("_", "-")
    slug = re.sub(r"[^a-z0-9-]+", "", slug)
    slug = re.sub(r"-{2,}", "-", slug)
    return slug.strip("-")


def _normalize_difficulty_level(value):
    return DIFFICULTY_LEVEL_MAP.get(str(value or "").strip().lower(), "beginner")


def seed_admin_user():
    email = current_app.config["ADMIN_EMAIL"].strip().lower()
    password = current_app.config["ADMIN_PASSWORD"]

    if User.query.filter_by(email=email).first():
        return

    user = User(
        email=email,
        password_hash=generate_password_hash(password, method="pbkdf2:sha256"),
    )
    db.session.add(user)
    db.session.commit()


def seed_languages():
    legacy_medumba = Language.query.filter_by(code="medumba").first()
    current_medumba = Language.query.filter_by(code="med").first()
    if legacy_medumba is not None and current_medumba is None:
        legacy_medumba.code = "med"
        db.session.commit()

    seed_data = [
        {
            "name": "Médumba",
            "native_name": "Médumba",
            "code": "med",
            "slug": "medumba",
            "description": "Primary heritage language for the MVP.",
            "direction": "ltr",
            "status": "active",
            "sort_order": 1,
        },
        {
            "name": "English",
            "native_name": "English",
            "code": "en",
            "slug": "english",
            "description": None,
            "direction": "ltr",
            "status": "active",
            "sort_order": 2,
        },
        {
            "name": "French",
            "native_name": "Français",
            "code": "fr",
            "slug": "french",
            "description": None,
            "direction": "ltr",
            "status": "active",
            "sort_order": 3,
        },
    ]

    changed = False

    for item in seed_data:
        if Language.query.filter_by(code=item["code"]).first():
            continue

        db.session.add(Language(**item))
        changed = True

    if changed:
        db.session.commit()


def seed_concepts():
    changed = False

    for sort_order, row in enumerate(_read_seed_csv(CONCEPTS_SEED_FILE), start=1):
        concept_key = row["concept_key"].strip()
        if Concept.query.filter_by(key=concept_key).first():
            continue

        db.session.add(
            Concept(
                key=concept_key,
                slug=_slug_from_key(concept_key),
                title=row["display_name"].strip(),
                description=None,
                category=_optional_string(row.get("category")),
                difficulty_level=_normalize_difficulty_level(row.get("difficulty")),
                status="active",
                sort_order=sort_order,
            )
        )
        changed = True

    if changed:
        db.session.commit()


def seed_concept_texts():
    concepts_by_key = {concept.key: concept for concept in Concept.query.all()}
    languages_by_code = {language.code: language for language in Language.query.all()}
    existing_pairs = {
        (row.concept_id, row.language_id)
        for row in ConceptText.query.with_entities(
            ConceptText.concept_id,
            ConceptText.language_id,
        ).all()
    }
    seen_seed_pairs = set()
    changed = False

    for row in _read_seed_csv(CONCEPT_TEXTS_SEED_FILE):
        concept = concepts_by_key.get(row["concept_key"].strip())
        language = languages_by_code.get(row["language_code"].strip())
        text = row["text"].strip()
        if concept is None or language is None or not text:
            continue

        pair = (concept.id, language.id)
        if pair in existing_pairs or pair in seen_seed_pairs:
            continue

        db.session.add(
            ConceptText(
                concept_id=concept.id,
                language_id=language.id,
                text=text,
                status="active",
                review_status="needs_review",
            )
        )
        seen_seed_pairs.add(pair)
        changed = True

    if changed:
        db.session.commit()
