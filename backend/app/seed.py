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
            "is_required_for_concept_completion": True,
            "requires_concept_text_review": True,
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
            "is_required_for_concept_completion": True,
            "requires_concept_text_review": False,
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
            "is_required_for_concept_completion": True,
            "requires_concept_text_review": False,
            "sort_order": 3,
        },
    ]

    changed = False

    for item in seed_data:
        existing = Language.query.filter_by(code=item["code"]).first()
        if existing is not None:
            if existing.is_required_for_concept_completion != item["is_required_for_concept_completion"]:
                existing.is_required_for_concept_completion = item["is_required_for_concept_completion"]
                changed = True
            if existing.requires_concept_text_review != item.get("requires_concept_text_review", False):
                existing.requires_concept_text_review = item.get("requires_concept_text_review", False)
                changed = True
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


def seed_test_content():
    seed_data = [
        {
            "key": "greeting",
            "slug": "greeting",
            "title": "Greeting",
            "description": "A basic greeting used when meeting someone.",
            "category": "Greetings",
            "difficulty_level": "beginner",
            "status": "active",
            "sort_order": 1,
            "texts": [
                {
                    "language_code": "en",
                    "text": "Hello",
                    "usage_note": "Basic greeting.",
                    "review_status": "approved",
                },
                {
                    "language_code": "fr",
                    "text": "Bonjour",
                    "usage_note": "Standard French greeting.",
                    "review_status": "approved",
                },
            ],
        },
        {
            "key": "mother",
            "slug": "mother",
            "title": "Mother",
            "description": "The concept of mother in a family context.",
            "category": "Family",
            "difficulty_level": "beginner",
            "status": "active",
            "sort_order": 2,
            "texts": [
                {"language_code": "en", "text": "Mother", "review_status": "approved"},
                {"language_code": "fr", "text": "Mère", "review_status": "approved"},
            ],
        },
        {
            "key": "father",
            "slug": "father",
            "title": "Father",
            "description": "The concept of father in a family context.",
            "category": "Family",
            "difficulty_level": "beginner",
            "status": "active",
            "sort_order": 3,
            "texts": [
                {"language_code": "en", "text": "Father", "review_status": "approved"},
                {"language_code": "fr", "text": "Père", "review_status": "approved"},
            ],
        },
        {
            "key": "water",
            "slug": "water",
            "title": "Water",
            "description": None,
            "category": "Food & Drink",
            "difficulty_level": "beginner",
            "status": "active",
            "sort_order": 4,
            "texts": [
                {"language_code": "en", "text": "Water", "review_status": "approved"},
                {"language_code": "fr", "text": "Eau", "review_status": "approved"},
            ],
        },
        {
            "key": "food",
            "slug": "food",
            "title": "Food",
            "description": None,
            "category": "Food & Drink",
            "difficulty_level": "beginner",
            "status": "active",
            "sort_order": 5,
            "texts": [
                {"language_code": "en", "text": "Food", "review_status": "approved"},
                {"language_code": "fr", "text": "Nourriture", "review_status": "approved"},
            ],
        },
        {
            "key": "thank_you",
            "slug": "thank-you",
            "title": "Thank You",
            "description": "A polite expression of gratitude.",
            "category": "Courtesy",
            "difficulty_level": "beginner",
            "status": "active",
            "sort_order": 6,
            "texts": [
                {"language_code": "en", "text": "Thank you", "review_status": "approved"},
                {"language_code": "fr", "text": "Merci", "review_status": "approved"},
            ],
        },
        {
            "key": "yes",
            "slug": "yes",
            "title": "Yes",
            "description": None,
            "category": "Everyday Life",
            "difficulty_level": "beginner",
            "status": "active",
            "sort_order": 7,
            "texts": [],
        },
        {
            "key": "no",
            "slug": "no",
            "title": "No",
            "description": None,
            "category": "Everyday Life",
            "difficulty_level": "beginner",
            "status": "active",
            "sort_order": 8,
            "texts": [],
        },
        {
            "key": "family",
            "slug": "family",
            "title": "Family",
            "description": "The concept of family and family relationships.",
            "category": "Family",
            "difficulty_level": "beginner",
            "status": "active",
            "sort_order": 9,
            "texts": [],
        },
        {
            "key": "home",
            "slug": "home",
            "title": "Home",
            "description": None,
            "category": "Home",
            "difficulty_level": "beginner",
            "status": "active",
            "sort_order": 10,
            "texts": [],
        },
    ]

    changed = False

    for item in seed_data:
        concept = Concept.query.filter_by(key=item["key"]).first()
        if concept is None:
            concept = Concept(
                key=item["key"],
                slug=item["slug"],
                title=item["title"],
                description=item["description"],
                category=item["category"],
                difficulty_level=item["difficulty_level"],
                status=item["status"],
                sort_order=item["sort_order"],
            )
            db.session.add(concept)
            db.session.flush()
            changed = True

        for text_item in item["texts"]:
            language = Language.query.filter_by(code=text_item["language_code"]).first()
            if language is None:
                continue

            existing = ConceptText.query.filter_by(
                concept_id=concept.id,
                language_id=language.id,
            ).first()
            if existing:
                continue

            db.session.add(
                ConceptText(
                    concept_id=concept.id,
                    language_id=language.id,
                    text=text_item["text"],
                    usage_note=text_item.get("usage_note"),
                    status="active",
                    review_status=text_item["review_status"],
                )
            )
            changed = True

    if changed:
        db.session.commit()
