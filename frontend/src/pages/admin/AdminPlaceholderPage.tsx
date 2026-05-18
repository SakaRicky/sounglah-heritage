import { Link } from 'react-router-dom'

export type AdminPlaceholderPageProps = {
  title: string
  description: string
  nextSlice?: string
}

export function AdminPlaceholderPage({ title, description, nextSlice }: AdminPlaceholderPageProps) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-medium text-forest-accent">Content management</p>
      <h1 className="mt-1 font-serif text-3xl font-bold text-cocoa-800">{title}</h1>
      <p className="mt-3 text-cocoa-body">{description}</p>
      <div className="mt-8 rounded-soft border border-sand-100 bg-white p-6 shadow-soft">
        <p className="text-cocoa-body">
          {nextSlice
            ? `CRUD functionality will be implemented in ${nextSlice}.`
            : 'This area will be built in a later slice.'}
        </p>
        <Link to="/admin" className="btn-secondary mt-6 inline-block text-sm">
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
