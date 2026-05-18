import { Link } from 'react-router-dom'

const contentAreas = [
  {
    title: 'Languages',
    description: 'Manage supported languages.',
    to: '/admin/languages',
  },
  {
    title: 'Concepts',
    description: 'Organize learning concepts.',
    to: '/admin/concepts',
  },
  {
    title: 'Concept Texts',
    description: 'Connect concepts to translated text.',
    to: '/admin/concept-texts',
  },
  {
    title: 'Lessons',
    description: 'Build structured learning paths.',
    to: '/admin/lessons',
  },
  {
    title: 'Lesson Items',
    description: 'Create the small learning steps inside lessons.',
    to: '/admin/lesson-items',
  },
] as const

const buildFocus = [
  'Languages',
  'Concepts',
  'Concept Texts',
  'Lessons',
  'Lesson Items',
] as const

export function AdminDashboardPage() {
  return (
    <div>
      <p className="text-sm text-cocoa-body/80">Content management hub</p>
      <h1 className="mt-1 font-serif text-3xl font-bold text-cocoa-800 md:text-4xl">Admin Dashboard</h1>
      <p className="mt-3 max-w-2xl text-cocoa-body">
        Manage Sounglah learning content from one place. Start with languages and concepts, then
        connect texts, lessons, and lesson items as the platform grows.
      </p>

      <section className="mt-10" aria-labelledby="content-management-heading">
        <h2 id="content-management-heading" className="text-lg font-semibold text-cocoa-800">
          Content Management
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contentAreas.map((area) => (
            <li key={area.title}>
              <Link
                to={area.to}
                className="block h-full rounded-soft border border-sand-100 bg-white p-5 shadow-soft transition hover:border-forest-accent/30"
              >
                <h3 className="font-semibold text-cocoa-800">{area.title}</h3>
                <p className="mt-2 text-sm text-cocoa-body">{area.description}</p>
                <span className="mt-4 inline-block text-sm font-medium text-forest-accent">
                  Open →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="mt-10 rounded-soft border border-sand-100 bg-white p-6 shadow-soft"
        aria-labelledby="next-build-heading"
      >
        <h2 id="next-build-heading" className="text-lg font-semibold text-cocoa-800">
          Next build focus
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-cocoa-body">
          {buildFocus.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-cocoa-body/75">
          Roadmap items such as Stories, Users, and Reports stay visible in the sidebar and will ship
          in later slices.
        </p>
      </section>
    </div>
  )
}
