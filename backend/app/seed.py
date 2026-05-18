from flask import current_app
from werkzeug.security import generate_password_hash

from app.extensions import db
from app.models.concept import Concept
from app.models.concept_text import ConceptText
from app.models.language import Language
from app.models.user import User


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
    seed_data = [
        {
            "name": "Médumba",
            "native_name": "Médumba",
            "code": "medumba",
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
        },
    ]

    changed = False

    for item in seed_data:
        if Concept.query.filter_by(key=item["key"]).first():
            continue

        db.session.add(Concept(**item))
        changed = True

    if changed:
        db.session.commit()


def seed_concept_texts():
    seed_data = [
        {
            "concept_key": "greeting",
            "language_code": "en",
            "text": "Hello",
            "usage_note": "Basic greeting.",
            "review_status": "approved",
        },
        {
            "concept_key": "greeting",
            "language_code": "fr",
            "text": "Bonjour",
            "usage_note": "Standard French greeting.",
            "review_status": "approved",
        },
        {
            "concept_key": "mother",
            "language_code": "en",
            "text": "Mother",
            "review_status": "approved",
        },
        {
            "concept_key": "mother",
            "language_code": "fr",
            "text": "Mère",
            "review_status": "approved",
        },
        {
            "concept_key": "father",
            "language_code": "en",
            "text": "Father",
            "review_status": "approved",
        },
        {
            "concept_key": "father",
            "language_code": "fr",
            "text": "Père",
            "review_status": "approved",
        },
        {
            "concept_key": "water",
            "language_code": "en",
            "text": "Water",
            "review_status": "approved",
        },
        {
            "concept_key": "water",
            "language_code": "fr",
            "text": "Eau",
            "review_status": "approved",
        },
        {
            "concept_key": "food",
            "language_code": "en",
            "text": "Food",
            "review_status": "approved",
        },
        {
            "concept_key": "food",
            "language_code": "fr",
            "text": "Nourriture",
            "review_status": "approved",
        },
        {
            "concept_key": "thank_you",
            "language_code": "en",
            "text": "Thank you",
            "review_status": "approved",
        },
        {
            "concept_key": "thank_you",
            "language_code": "fr",
            "text": "Merci",
            "review_status": "approved",
        },
    ]

    changed = False

    for item in seed_data:
        concept = Concept.query.filter_by(key=item["concept_key"]).first()
        language = Language.query.filter_by(code=item["language_code"]).first()
        if concept is None or language is None:
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
                text=item["text"],
                usage_note=item.get("usage_note"),
                status="active",
                review_status=item["review_status"],
            )
        )
        changed = True

    if changed:
        db.session.commit()
