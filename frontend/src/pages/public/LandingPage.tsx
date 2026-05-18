import { ExploreLanguagesSection } from '../../components/public/ExploreLanguagesSection'
import { HeroSection } from '../../components/public/HeroSection'
import { MiddleFeatureBand } from '../../components/public/MiddleFeatureBand'
import { StoriesCultureSection } from '../../components/public/StoriesCultureSection'
import { WhySounglahSection } from '../../components/public/WhySounglahSection'

const PATTERN_BAND_H = 108

export function LandingPage() {
  return (
    <>
      <HeroSection />

      {/* Same horizontal max-width / padding as .section content (aligned with hero + navbar inner) */}
      <div
        className="section relative z-0 w-full min-w-0 mt-[-1.5rem] shrink-0 bg-cream-hero bg-[url('/images/patterns/pattern-band.png')] bg-[length:auto_100%] bg-bottom bg-repeat-x"
        style={{ height: PATTERN_BAND_H }}
        role="presentation"
        aria-hidden
      />

      <ExploreLanguagesSection />

      <StoriesCultureSection />

      <MiddleFeatureBand />

      <WhySounglahSection />
    </>
  )
}
