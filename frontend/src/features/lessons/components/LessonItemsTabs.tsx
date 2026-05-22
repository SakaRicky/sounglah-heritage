import { Link, useLocation } from 'react-router-dom'

import { useI18n } from '../../../i18n'

type Props = {
  lessonId: string
}

export function LessonItemsTabs({ lessonId }: Props) {
  const { t } = useI18n()
  const location = useLocation()

  const tabs = [
    {
      key: 'items',
      label: t('admin.lessons.items.tabs.items'),
      to: `/admin/content/lessons/${lessonId}/items`,
      active: location.pathname.endsWith('/items'),
    },
    {
      key: 'details',
      label: t('admin.lessons.items.tabs.details'),
      to: `/admin/content/lessons/${lessonId}/edit`,
      active: location.pathname.endsWith('/edit'),
    },
    {
      key: 'settings',
      label: t('admin.lessons.items.tabs.settings'),
      to: `/admin/content/lessons/${lessonId}/edit`,
      active: false,
    },
  ] as const

  return (
    <nav className="flex gap-6 border-b border-sand-200" aria-label={t('admin.lessons.items.tabs.label')}>
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          to={tab.to}
          className={[
            '-mb-px border-b-2 pb-3 text-sm font-semibold transition',
            tab.active
              ? 'border-forest-accent text-forest-700'
              : 'border-transparent text-cocoa-body/65 hover:border-sand-200 hover:text-cocoa-800',
          ].join(' ')}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
