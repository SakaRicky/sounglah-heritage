import { Link } from 'react-router-dom'

import { useI18n } from '../../i18n'

/** Slightly stronger fade on the far left so copy sits on a softer canvas, still clearing before the characters. */
const HERO_IMAGE_FADE = `linear-gradient(to right, rgba(255,248,236,0.96) 0%, rgba(255,248,236,0.7) 16%, rgba(255,248,236,0.36) 30%, rgba(255,248,236,0.1) 44%, rgba(255,248,236,0) 58%)`

function SocialProof() {
  const { t } = useI18n()

  return (
    <div className="mt-8 flex flex-wrap items-center gap-4">
      <div className="flex -space-x-2" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-10 w-10 rounded-full border-2 border-[#FFF8EC] bg-gradient-to-br from-sand-200 to-sand-300"
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <p className="text-[#F4B431]" aria-label={t('hero.ratingLabel')}>
          ★★★★★
        </p>
        <p className="text-sm font-semibold text-[#3F3328]">
          {t('hero.socialProof')}
        </p>
      </div>
    </div>
  )
}

export function HeroSection() {
  const { t } = useI18n()

  return (
    <section
      className="relative flex w-full min-w-0 flex-col overflow-hidden bg-cream-hero max-md:min-h-[calc(100svh-5rem)] md:min-h-[520px]"
      aria-labelledby="hero-heading"
    >
      {/* Match navbar / page content: full-bleed band, inner content uses .section max-width + padding */}
      <div className="section relative flex min-h-0 w-full min-w-0 flex-1 flex-col max-md:min-h-0 md:min-h-[520px] md:flex-row md:items-stretch md:gap-6">
        {/* Copy — horizontal padding from .section; fixed column width on large screens */}
        <div className="relative z-10 flex w-full min-w-0 shrink-0 flex-col py-8 sm:py-10 md:w-[50%] lg:w-[min(55%,42rem)] md:flex-none md:justify-start lg:py-12">
          <div className="w-full shrink-0">
            <h1
              id="hero-heading"
              className="font-serif text-[42px] font-bold leading-[1.05] sm:text-[52px] lg:text-[64px] xl:text-[72px]"
            >
              <span className="block text-[#1F1A14]">{t('hero.desktopTitleLine1')}</span>
              <span className="mt-1 block text-[#0F6B3A]">{t('hero.desktopTitleLine2')}</span>
            </h1>

            <p className="mt-5 text-lg leading-[1.7] text-[#3F3328]">
              {t('hero.description')}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                to="/lessons"
                className="inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#0F6B3A] px-[26px] py-[14px] text-base font-semibold text-white shadow-button transition hover:bg-[#0c5630] sm:w-auto"
              >
                {t('common.startLearning')}
                <span aria-hidden>→</span>
              </Link>
              <Link
                to="/#languages"
                className="inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-[14px] border-2 border-[#0F6B3A] bg-[#FFF8EC] px-[26px] py-[14px] text-base font-semibold text-[#0F6B3A] transition hover:bg-cream-100 sm:w-auto"
              >
                {t('hero.exploreLanguages')}
                <span aria-hidden className="text-lg">
                  🌍
                </span>
              </Link>
            </div>

            <SocialProof />
          </div>
        </div>

        {/* Desktop & Tablet: image column fills remaining width inside .section */}
        <div className="relative z-0 hidden min-h-0 min-w-0 flex-1 flex-col md:flex">
          <div className="relative min-h-0 flex-1">
            <img
              src="/images/hero/hero-family.png"
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-[center_32%]"
            />
            <div
              className="pointer-events-none absolute inset-0 z-[1]"
              style={{ backgroundImage: HERO_IMAGE_FADE }}
              aria-hidden
            />
          </div>
        </div>

        {/* Mobile: rounded card container with shadows avoids vertical gradient fade issues */}
        <div className="relative z-0 mt-6 h-[260px] sm:h-[320px] w-full overflow-hidden rounded-2xl border border-sand-200 shadow-soft md:hidden">
          <img
            src="/images/hero/hero-family.png"
            alt={t('hero.familyAlt')}
            className="h-full w-full object-cover object-[center_35%]"
          />
        </div>
      </div>
    </section>
  )
}
