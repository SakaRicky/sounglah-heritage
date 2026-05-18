import { Link } from 'react-router-dom'

const BENEFITS = [
  {
    icon: '📚',
    title: 'Cultural Connection',
    description:
      'Stories and lessons rooted in heritage, family life, and everyday conversations.',
  },
  {
    icon: '🌱',
    title: 'Child-Friendly Pace',
    description:
      'Short lessons designed to respect children’s attention, curiosity, and joy.',
  },
  {
    icon: '🤝',
    title: 'Family-Centered',
    description:
      'Built for parents, grandparents, and children learning together across generations.',
  },
] as const

function BenefitCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="flex gap-5 rounded-2xl border border-sand-100 bg-cream-50 p-6 transition hover:-translate-y-0.5 hover:shadow-soft md:p-6">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sand-100 text-xl">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="mb-2 font-sans text-lg font-bold text-cocoa-ink">{title}</h3>
        <p className="leading-7 text-cocoa-body">{description}</p>
      </div>
    </div>
  )
}

export function WhySounglahSection() {
  return (
    <section
      id="about"
      aria-labelledby="why-sounglah-heading"
      className="relative w-full overflow-hidden bg-cream-100 py-14 sm:py-16 lg:py-20 xl:py-24"
    >
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-sand-100/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-8 top-8 h-40 w-40 bg-[url('/images/patterns/pattern-band.png')] bg-contain bg-no-repeat opacity-[0.07]"
        aria-hidden
      />

      <div className="section relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-forest-accent">
            Built for heritage learning
          </p>

          <h2
            id="why-sounglah-heading"
            className="mb-6 font-serif text-[2rem] font-bold leading-tight text-cocoa-ink sm:text-4xl lg:text-5xl"
          >
            Why Sounglah
          </h2>

          <p className="mb-8 max-w-xl text-lg leading-8 text-cocoa-body">
            Sounglah helps families pass language, culture, and identity from one
            generation to the next through simple, joyful lessons made for children
            and parents.
          </p>

          <Link
            to="/languages"
            className="btn-primary inline-flex items-center gap-2 rounded-cta px-6 py-3 text-sm font-semibold no-underline"
          >
            Explore Languages
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="space-y-5">
          {BENEFITS.map((benefit) => (
            <BenefitCard key={benefit.title} {...benefit} />
          ))}
        </div>
      </div>
    </section>
  )
}
