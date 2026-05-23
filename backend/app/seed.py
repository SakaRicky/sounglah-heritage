from werkzeug.security import generate_password_hash

from app.extensions import db
from app.models.concept import Concept
from app.models.concept_text import ConceptText
from app.models.concept_text_audio import ConceptTextAudio
from app.models.language import Language
from app.models.lesson import Lesson
from app.models.lesson_item import LessonItem
from app.models.user import User


STARTER_LANGUAGES = [
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
        "description": "Reference language for diaspora families.",
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
        "description": "Reference language for Francophone families.",
        "direction": "ltr",
        "status": "active",
        "is_required_for_concept_completion": True,
        "requires_concept_text_review": False,
        "sort_order": 3,
    },
]


STARTER_LESSONS = [
    {
        "slug": "greetings-kindness",
        "title_en": "Greetings & Kindness",
        "title_fr": "Salutations et gentillesse",
        "description": "Warm first words for greeting family and showing kindness.",
        "difficulty": "beginner",
        "estimated_minutes": 7,
        "category": "Greetings & Kindness",
        "items": [
            ("hello", "Hello", "Bonjour", "O zi à"),
            ("good_morning", "Good morning", "Bonjour", "O zi à"),
            ("good_evening", "Good evening", "Bonsoir", None),
            ("thank_you", "Thank you", "Merci", "Me labte"),
            ("goodbye", "Goodbye", "Au revoir", None),
            ("welcome", "Welcome", "Bienvenue", "Seʼ mebwô"),
            ("please", "Please", "S’il vous plaît", "Netshoʼo"),
            ("excuse_me", "Excuse me", "Excuse-moi", None),
        ],
    },
    {
        "slug": "my-family",
        "title_en": "My Family",
        "title_fr": "Ma famille",
        "description": "Family words that help children name the people closest to them.",
        "difficulty": "beginner",
        "estimated_minutes": 8,
        "category": "Family",
        "items": [
            ("mother", "Mother", "Maman", "mà"),
            ("father", "Father", "Papa", "Tà"),
            ("grandmother", "Grandmother", "Grand-mère", None),
            ("grandfather", "Grandfather", "Grand-père", None),
            ("brother", "Brother", "Frère", "Mfêlàm mzè mandum"),
            ("sister", "Sister", "Sœur", "Mfêlàm mzè mennzwi"),
            ("baby", "Baby", "Bébé", None),
            ("family", "Family", "Famille", None),
        ],
    },
    {
        "slug": "food-eating",
        "title_en": "Food & Eating",
        "title_fr": "Nourriture et repas",
        "description": "Everyday food words for meals at home.",
        "difficulty": "beginner",
        "estimated_minutes": 9,
        "category": "Food & Eating",
        "items": [
            ("water", "Water", "Eau", "Ntse"),
            ("food", "Food", "Nourriture", None),
            ("eat", "Eat", "Manger", "Jù"),
            ("drink", "Drink", "Boire", "Nu"),
            ("rice", "Rice", "Riz", "Nkun"),
            ("banana", "Banana", "Banane", None),
            ("bread", "Bread", "Pain", None),
            ("delicious", "Delicious", "Délicieux", None),
        ],
    },
    {
        "slug": "home-daily-actions",
        "title_en": "Home & Daily Actions",
        "title_fr": "Maison et actions quotidiennes",
        "description": "Simple action words children hear during the day.",
        "difficulty": "beginner",
        "estimated_minutes": 10,
        "category": "Home & Daily Actions",
        "items": [
            ("sit", "Sit", "S'asseoir", "Tswe nsi"),
            ("stand", "Stand", "Se lever", "Tsin tu"),
            ("come", "Come", "Viens", "Se'"),
            ("go", "Go", "Aller", "Nèn"),
            ("sleep", "Sleep", "Dormir", "Zi"),
            ("wash_hands", "Wash hands", "Lave les mains", "Sôg bu mu"),
            ("open_door", "Open the door", "Ouvrir la porte", "Co' nzè nda"),
            ("close_door", "Close the door", "Fermer la porte", "Fu' nzè nda"),
        ],
    },
    {
        "slug": "emotions-encouragement",
        "title_en": "Emotions & Encouragement",
        "title_fr": "Émotions et encouragements",
        "description": "Gentle words for feelings, comfort, and encouragement.",
        "difficulty": "beginner",
        "estimated_minutes": 9,
        "category": "Emotions & Encouragement",
        "items": [
            ("happy", "Happy", "Heureux", "Tsiañde"),
            ("sad", "Sad", "Triste", None),
            ("smile", "Smile", "Sourire", None),
            ("dont_cry", "Don't cry", "Ne pleure pas", None),
            ("good_job", "Good job", "Bon travail", "A bwô"),
            ("be_strong", "Be strong", "Sois fort", None),
            ("i_love_you", "I love you", "Je t'aime", "Mè kô o"),
            ("proud_of_you", "I am proud of you", "Je suis fier de toi", None),
        ],
    },
    {
        "slug": "numbers-counting",
        "title_en": "Numbers & Counting",
        "title_fr": "Nombres et comptage",
        "description": "First counting words for beginner learners.",
        "difficulty": "beginner",
        "estimated_minutes": 8,
        "category": "Numbers & Counting",
        "items": [
            ("one", "One", "Un", "Taʼ"),
            ("two", "Two", "Deux", "Boho"),
            ("three", "Three", "Trois", "Tàt"),
            ("four", "Four", "Quatre", "Kuà"),
            ("five", "Five", "Cinq", "Tàn"),
            ("count", "Count", "Compter", None),
            ("many", "Many", "Beaucoup", "Yàme"),
            ("little", "Little", "Petit", "Metsit"),
        ],
    },
    {
        "slug": "animals-around-us",
        "title_en": "Animals Around Us",
        "title_fr": "Les animaux autour de nous",
        "description": "Animals children may hear about in stories and daily life.",
        "difficulty": "beginner",
        "estimated_minutes": 8,
        "category": "Animals Around Us",
        "items": [
            ("dog", "Dog", "Chien", "mbu"),
            ("cat", "Cat", "Chat", "Bù si"),
            ("bird", "Bird", "Oiseau", None),
            ("goat", "Goat", "Chèvre", None),
            ("chicken", "Chicken", "Poulet", None),
            ("fish", "Fish", "Poisson", None),
            ("cow", "Cow", "Vache", None),
            ("animal", "Animal", "Animal", "nyàm"),
        ],
    },
    {
        "slug": "nature-weather",
        "title_en": "Nature & Weather",
        "title_fr": "Nature et météo",
        "description": "Nature and weather words for noticing the world outside.",
        "difficulty": "beginner",
        "estimated_minutes": 8,
        "category": "Nature & Weather",
        "items": [
            ("sun", "Sun", "Soleil", "Nyam"),
            ("rain", "Rain", "Pluie", "Mbañ"),
            ("tree", "Tree", "Arbre", None),
            ("river", "River", "Rivière", None),
            ("sky", "Sky", "Ciel", None),
            ("wind", "Wind", "Vent", None),
            ("hot", "Hot", "Chaud", "A dumde"),
            ("cold", "Cold", "Froid", "A fi"),
        ],
    },
    {
        "slug": "school-learning",
        "title_en": "School & Learning",
        "title_fr": "École et apprentissage",
        "description": "School words that support reading, writing, and questions.",
        "difficulty": "beginner",
        "estimated_minutes": 9,
        "category": "School & Learning",
        "items": [
            ("book", "Book", "Livre", "Bu' ñwaʼni"),
            ("teacher", "Teacher", "Enseignant", None),
            ("student", "Student", "Élève", None),
            ("write", "Write", "Écrire", "Ki"),
            ("read", "Read", "Lire", "Sianje"),
            ("learn", "Learn", "Apprendre", "neziʼ"),
            ("answer", "Answer", "Réponse", None),
            ("question", "Question", "Question", None),
        ],
    },
    {
        "slug": "community-culture",
        "title_en": "Community & Culture",
        "title_fr": "Communauté et culture",
        "description": "Words for stories, music, gatherings, and shared roots.",
        "difficulty": "beginner",
        "estimated_minutes": 10,
        "category": "Community & Culture",
        "items": [
            ("dance", "Dance", "Danse", None),
            ("drum", "Drum", "Tambour", None),
            ("song", "Song", "Chanson", None),
            ("market", "Market", "Marché", None),
            ("village", "Village", "Village", "tañla'"),
            ("story", "Story", "Histoire", None),
            ("tradition", "Tradition", "Tradition", None),
            ("celebration", "Celebration", "Célébration", None),
        ],
    },
]


def _title_from_slug(slug):
    small_words = {"and", "of", "the"}
    words = slug.replace("_", " ").replace("-", " ").split()
    return " ".join(word if word in small_words else word.capitalize() for word in words)


def _starter_concepts():
    concepts = []
    seen = set()

    for lesson_index, lesson in enumerate(STARTER_LESSONS, start=1):
        for item_index, (slug, text_en, _text_fr, _text_med) in enumerate(lesson["items"], start=1):
            if slug in seen:
                continue

            seen.add(slug)
            concepts.append(
                {
                    "key": slug,
                    "slug": slug.replace("_", "-"),
                    "title": _title_from_slug(slug),
                    "description": f"Starter curriculum concept for {text_en}.",
                    "category": lesson["category"],
                    "difficulty_level": "beginner",
                    "status": "active",
                    "sort_order": (lesson_index * 100) + item_index,
                    "texts": [
                        {
                            "language_code": "en",
                            "text": text_en,
                            "review_status": "approved",
                        },
                        {
                            "language_code": "fr",
                            "text": _text_fr,
                            "review_status": "approved",
                        },
                    ],
                }
            )

            if _text_med:
                concepts[-1]["texts"].append(
                    {
                        "language_code": "med",
                        "text": _text_med,
                        "review_status": "needs_review",
                        "usage_note": "Médumba candidate from extracted Sounglah source data; needs native review.",
                    }
                )

    return concepts


def reset_seed_data():
    ConceptText.query.update({ConceptText.current_audio_id: None})
    db.session.query(ConceptTextAudio).delete()
    db.session.query(LessonItem).delete()
    db.session.query(Lesson).delete()
    db.session.query(ConceptText).delete()
    db.session.query(Concept).delete()
    db.session.query(Language).delete()
    db.session.query(User).delete()
    db.session.commit()


def seed_admin_user():
    from flask import current_app

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

    changed = False
    for item in STARTER_LANGUAGES:
        language = Language.query.filter_by(code=item["code"]).first()
        if language is None:
            db.session.add(Language(**item))
            changed = True
            continue

        for field, value in item.items():
            if getattr(language, field) != value:
                setattr(language, field, value)
                changed = True

    if changed:
        db.session.commit()


def seed_concepts():
    changed = False
    for item in _starter_concepts():
        concept = Concept.query.filter_by(key=item["key"]).first()
        concept_data = {key: value for key, value in item.items() if key != "texts"}
        if concept is None:
            db.session.add(Concept(**concept_data))
            changed = True
            continue

        for field, value in concept_data.items():
            if getattr(concept, field) != value:
                setattr(concept, field, value)
                changed = True

    if changed:
        db.session.commit()


def seed_concept_texts():
    concepts_by_key = {concept.key: concept for concept in Concept.query.all()}
    languages_by_code = {language.code: language for language in Language.query.all()}
    changed = False

    for item in _starter_concepts():
        concept = concepts_by_key.get(item["key"])
        if concept is None:
            continue

        for text_item in item["texts"]:
            language = languages_by_code.get(text_item["language_code"])
            if language is None:
                continue

            concept_text = ConceptText.query.filter_by(
                concept_id=concept.id,
                language_id=language.id,
            ).first()
            text_data = {
                "text": text_item["text"],
                "usage_note": text_item.get("usage_note"),
                "status": "active",
                "review_status": text_item["review_status"],
            }
            if concept_text is None:
                db.session.add(
                    ConceptText(
                        concept_id=concept.id,
                        language_id=language.id,
                        **text_data,
                    )
                )
                changed = True
                continue

            for field, value in text_data.items():
                if getattr(concept_text, field) != value:
                    setattr(concept_text, field, value)
                    changed = True

    if changed:
        db.session.commit()


def seed_lessons():
    concepts_by_key = {concept.key: concept for concept in Concept.query.all()}
    changed = False

    for lesson_index, lesson_data in enumerate(STARTER_LESSONS, start=1):
        lesson = Lesson.query.filter_by(slug=lesson_data["slug"]).first()
        lesson_fields = {
            "title": lesson_data["title_en"],
            "description": lesson_data["description"],
            "difficulty": lesson_data["difficulty"],
            "estimated_minutes": lesson_data["estimated_minutes"],
            "cover_image_alt_text": f"{lesson_data['title_en']} lesson cover",
            "status": "published",
            "order_index": lesson_index,
        }

        if lesson is None:
            lesson = Lesson(slug=lesson_data["slug"], **lesson_fields)
            db.session.add(lesson)
            db.session.flush()
            changed = True
        else:
            for field, value in lesson_fields.items():
                if getattr(lesson, field) != value:
                    setattr(lesson, field, value)
                    changed = True

        existing_items_by_order = {item.order_index: item for item in lesson.items}
        for item_index, (concept_key, text_en, text_fr, _text_med) in enumerate(
            lesson_data["items"],
            start=1,
        ):
            concept = concepts_by_key[concept_key]
            item_fields = {
                "type": "VOCABULARY",
                "concept_id": concept.id,
                "title": text_en,
                "instruction_text": "Listen, look, and say it with someone at home.",
                "content_json": {
                    "textEn": text_en,
                    "textFr": text_fr,
                    "lessonTitleFr": lesson_data["title_fr"],
                },
                "is_active": True,
            }

            lesson_item = existing_items_by_order.get(item_index)
            if lesson_item is None:
                db.session.add(
                    LessonItem(
                        lesson_id=lesson.id,
                        order_index=item_index,
                        **item_fields,
                    )
                )
                changed = True
                continue

            for field, value in item_fields.items():
                if getattr(lesson_item, field) != value:
                    setattr(lesson_item, field, value)
                    changed = True

        for order_index, item in existing_items_by_order.items():
            if order_index > len(lesson_data["items"]):
                db.session.delete(item)
                changed = True

    if changed:
        db.session.commit()


def seed_starter_curriculum():
    seed_languages()
    seed_concepts()
    seed_concept_texts()
    seed_lessons()


def seed_test_content():
    seed_languages()
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
