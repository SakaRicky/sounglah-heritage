export function LoginPage() {
  return (
    <section className="section mx-auto max-w-md py-16">
      <div className="card p-8 shadow-floating">
        <h1 className="text-3xl font-bold">Admin login</h1>
        <p className="mt-2 text-sm text-sounglah-ink-500">
          Access the Sounglah content management area.
        </p>

        <form className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-sounglah-ink-700">Email</span>
            <input
              type="email"
              className="mt-2 w-full rounded-button border border-sounglah-earth-100 px-4 py-3 text-sounglah-ink-900 outline-none ring-sounglah-green-500/30 focus:ring-2"
              placeholder="admin@sounglah.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-sounglah-ink-700">Password</span>
            <input
              type="password"
              className="mt-2 w-full rounded-button border border-sounglah-earth-100 px-4 py-3 text-sounglah-ink-900 outline-none ring-sounglah-green-500/30 focus:ring-2"
              placeholder="••••••••"
            />
          </label>

          <button type="submit" className="btn-primary w-full">
            Login
          </button>
        </form>
      </div>
    </section>
  )
}
