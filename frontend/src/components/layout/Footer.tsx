import { useI18n } from '../../i18n'

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="shrink-0 border-t border-sand-100 px-6 py-8 text-center text-sm text-cocoa-700">
      <p>{t('footer.tagline')}</p>
    </footer>
  )
}
