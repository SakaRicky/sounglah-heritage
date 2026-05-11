import { Link } from 'react-router-dom'

function LanguageCard() {
  return (
    <div className="card p-5 text-center transition hover:shadow-card">
      <div
        className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-card bg-sounglah-green-100 text-3xl"
        aria-hidden
      >
        🏠
      </div>
      <h3 className="font-bold text-sounglah-ink-900">Médumba</h3>
      <p className="text-sm text-sounglah-ink-500">(Yédùmba)</p>
      <p className="mt-3 text-sm font-semibold text-sounglah-green-600">
        Start learning →
      </p>
    </div>
  )
}

function StoryCard() {
  return (
    <div className="card overflow-hidden transition hover:shadow-card">
      <div className="flex h-40 w-full items-center justify-center bg-sounglah-cream-200 text-sounglah-ink-500">
        Story image
      </div>
      <div className="p-4">
        <h3 className="font-bold">A Day at the Market</h3>
        <p className="text-sm text-sounglah-ink-500">Culture · 4 min</p>
      </div>
    </div>
  )
}

function FeatureItem({
  icon,
  title,
  body,
}: {
  icon: string
  title: string
  body: string
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sounglah-green-100 text-xl">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-sounglah-ink-900">{title}</h3>
        <p className="text-sm text-sounglah-ink-500">{body}</p>
      </div>
    </div>
  )
}

export function LandingPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-hero-warm">
        <div className="section grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-20">
          <div>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl lg:leading-tight">
              Their language.{' '}
              <span className="text-sounglah-green-600">Their future.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-sounglah-ink-700">
              Sounglah helps children of the diaspora learn and speak their mother
              tongue through fun lessons, stories, and everyday conversations.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/login" className="btn-primary inline-block text-center">
                Start Learning →
              </Link>
              <a
                href="#languages"
                className="btn-secondary inline-block text-center"
              >
                Explore Languages 🌍
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] w-full min-h-[280px] overflow-hidden rounded-card shadow-floating">
              <div className="flex h-full min-h-[280px] w-full flex-col items-center justify-center bg-gradient-to-br from-sounglah-cream-100 to-sounglah-earth-100 p-8 text-center text-sm text-sounglah-ink-500">
                <p className="font-medium text-sounglah-ink-700">
                  Warm family illustration
                </p>
                <p className="mt-2 max-w-xs">
                  Add{' '}
                  <code className="rounded bg-white/60 px-1">
                    public/images/hero-family.png
                  </code>{' '}
                  to show your hero image here.
                </p>
              </div>
            </div>

            <div className="absolute bottom-6 right-4 w-64 p-5 card">
              <p className="text-sm text-sounglah-ink-500">Today&apos;s Lesson</p>
              <h3 className="mt-2 font-bold">Greetings & Introductions</h3>
              <div className="mt-4 h-2 rounded-full bg-sounglah-earth-100">
                <div className="h-2 w-3/5 rounded-full bg-sounglah-green-600" />
              </div>
              <Link
                to="/login"
                className="btn-primary mt-5 block w-full text-center text-sm"
              >
                Continue Lesson
              </Link>
            </div>
          </div>
        </div>

        <div
          className="h-3 w-full opacity-50"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              #D8A66F 0px,
              #D8A66F 6px,
              transparent 6px,
              transparent 12px
            )`,
          }}
          aria-hidden
        />
      </section>

      <section id="languages" className="section py-16">
        <h2 className="text-3xl font-bold">Languages</h2>
        <p className="mt-2 max-w-measure text-sounglah-ink-500">
          Starting with Médumba — more heritage languages will join the platform
          over time.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <LanguageCard />
        </div>
      </section>

      <section id="stories" className="section border-t border-sounglah-earth-100 py-16">
        <h2 className="text-3xl font-bold">Stories</h2>
        <p className="mt-2 text-sounglah-ink-500">
          Short cultural stories for family learning moments.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <StoryCard />
        </div>
      </section>

      <section id="about" className="section bg-sounglah-cream-100/60 py-16">
        <h2 className="text-3xl font-bold">Why Sounglah</h2>
        <div className="mt-10 grid max-w-3xl gap-8">
          <FeatureItem
            icon="📚"
            title="Cultural connection"
            body="Stories and lessons rooted in heritage and family life."
          />
          <FeatureItem
            icon="🌱"
            title="Child-friendly pace"
            body="Short blocks of learning that respect attention and joy."
          />
          <FeatureItem
            icon="🤝"
            title="Family-centered"
            body="Built for parents, grandparents, and children learning together."
          />
        </div>
      </section>

      <section id="blog" className="section py-12 text-center text-sounglah-ink-500">
        <p className="text-sm">Blog — coming soon.</p>
      </section>
    </>
  )
}
