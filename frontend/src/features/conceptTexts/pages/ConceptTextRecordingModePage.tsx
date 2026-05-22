import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Loader2, Mic, Search, SkipForward } from 'lucide-react'

import { AdminFilterBar } from '../../../components/admin/AdminFilterBar'
import { AdminPageHeader } from '../../../components/admin/AdminPageHeader'
import { StatsCard } from '../../../components/admin/StatsCard'
import { getConceptTexts, uploadConceptTextAudio } from '../api/conceptTextsApi'
import { InlineAudioRecorder } from '../components/InlineAudioRecorder'
import type { ConceptText } from '../types/conceptText.types'
import { canRecordConceptTextAudio } from '../utils/conceptTextAudioPermissions'
import { getLanguages } from '../../languages/api/languagesApi'
import type { Language } from '../../languages/types/language.types'

const RECORDING_PAGE_SIZE = 100

function LoadingIcon() {
  return <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
}

function MedumbaIcon() {
  return <Mic className="h-5 w-5" aria-hidden />
}

function SearchIcon() {
  return <Search className="h-4 w-4" aria-hidden />
}

async function fetchAllConceptTexts(search: string, languageId: string) {
  const firstPage = await getConceptTexts({
    search,
    languageId,
    status: 'all',
    reviewStatus: 'all',
    sort: 'concept',
    page: 1,
    pageSize: RECORDING_PAGE_SIZE,
  })

  const totalPages = Math.max(1, Math.ceil(firstPage.meta.total / RECORDING_PAGE_SIZE))
  if (totalPages === 1) {
    return firstPage.data
  }

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      getConceptTexts({
        search,
        languageId,
        status: 'all',
        reviewStatus: 'all',
        sort: 'concept',
        page: index + 2,
        pageSize: RECORDING_PAGE_SIZE,
      }),
    ),
  )

  return [firstPage.data, ...remainingPages.map((response) => response.data)].flat()
}

export function ConceptTextRecordingModePage() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [conceptTexts, setConceptTexts] = useState<ConceptText[]>([])
  const [search, setSearch] = useState('')
  const [languageId, setLanguageId] = useState('')
  const [loadingLanguages, setLoadingLanguages] = useState(true)
  const [loadingQueue, setLoadingQueue] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [recorderActive, setRecorderActive] = useState(false)
  const loadRequestIdRef = useRef(0)
  const defaultLanguageSetRef = useRef(false)

  const selectedLanguage = useMemo(
    () => languages.find((language) => language.id === languageId) ?? null,
    [languageId, languages],
  )

  const missingConceptTexts = useMemo(
    () => conceptTexts.filter((conceptText) => conceptText.audioSummary?.status === 'missing'),
    [conceptTexts],
  )

  const medumbaMissingConceptTexts = useMemo(
    () =>
      missingConceptTexts.filter((conceptText) => conceptText.language?.code?.toLowerCase() === 'med'),
    [missingConceptTexts],
  )

  const isRecordingLanguage = canRecordConceptTextAudio(selectedLanguage?.code)
  const recordableQueue = isRecordingLanguage ? medumbaMissingConceptTexts : []
  const currentItem = recordableQueue[currentIndex] ?? null
  const selectedLanguageLabel = selectedLanguage?.name ?? 'All languages'

  const loadLanguages = useCallback(async () => {
    setLoadingLanguages(true)

    try {
      const response = await getLanguages({ status: 'active', page: 1, pageSize: 100 })
      setLanguages(response.data)

      if (!defaultLanguageSetRef.current) {
        const medumbaLanguage = response.data.find((language) => language.code.toLowerCase() === 'med')
        if (medumbaLanguage) {
          setLanguageId(medumbaLanguage.id)
        }
        defaultLanguageSetRef.current = true
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load languages.')
    } finally {
      setLoadingLanguages(false)
    }
  }, [])

  const loadQueue = useCallback(async () => {
    if (loadingLanguages && !languageId) {
      return []
    }

    const requestId = ++loadRequestIdRef.current
    setLoadingQueue(true)
    setError('')

    try {
      const queue = await fetchAllConceptTexts(search, languageId)
      if (requestId !== loadRequestIdRef.current) {
        return queue
      }

      setConceptTexts(queue)
      setCurrentIndex(0)
      return queue
    } catch (requestError) {
      if (requestId === loadRequestIdRef.current) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load the recording queue.')
      }
      return []
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setLoadingQueue(false)
      }
    }
  }, [languageId, loadingLanguages, search])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadLanguages()
    }, 200)

    return () => window.clearTimeout(timer)
  }, [loadLanguages])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadQueue()
    }, 200)

    return () => window.clearTimeout(timer)
  }, [loadQueue])

  useEffect(() => {
    if (!notice) {
      return
    }

    const timer = window.setTimeout(() => setNotice(''), 3000)
    return () => window.clearTimeout(timer)
  }, [notice])

  function moveNext() {
    setRecorderActive(false)
    setCurrentIndex((current) => Math.min(current + 1, Math.max(recordableQueue.length - 1, 0)))
  }

  function movePrevious() {
    setRecorderActive(false)
    setCurrentIndex((current) => Math.max(current - 1, 0))
  }

  async function handleSubmit(audioBlob: Blob, durationSeconds: number) {
    if (!currentItem) {
      throw new Error('No concept text is selected for recording.')
    }

    if (!isRecordingLanguage) {
      throw new Error('Recording is available for Médumba only.')
    }

    await uploadConceptTextAudio(currentItem.id, audioBlob, durationSeconds)
    await loadQueue()
    setNotice('Saved for review. Moving to next item...')
  }

  const currentLanguageLabel = currentItem?.language?.name ?? selectedLanguageLabel
  const currentLanguageCode = currentItem?.language?.code ?? selectedLanguage?.code ?? ''
  const currentProgressLabel = recordableQueue.length > 0 ? `${currentIndex + 1} of ${recordableQueue.length}` : '0 of 0'

  return (
    <div className="space-y-8">
      <AdminPageHeader
        breadcrumb={['Content Management', 'Concept Texts', 'Recording Mode']}
        title="Recording Mode"
        description="Work through missing Médumba pronunciations one by one. Record, preview, retake, and submit without opening the edit form."
        action={
          <Link
            to="/admin/content/concept-texts"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-forest-accent/25 bg-white px-4 py-3 text-sm font-semibold text-forest-700 shadow-[0_8px_24px_rgba(31,90,61,0.1)] transition hover:border-forest-300 hover:bg-forest-50/30 focus:outline-none focus:ring-2 focus:ring-forest-200"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Back to concept texts
          </Link>
        }
      />

      {notice ? (
        <div className="rounded-cta border border-forest-accent/20 bg-forest-accent/10 px-4 py-3 text-sm font-medium text-forest-700">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-cta border border-terracotta-500/20 bg-terracotta-400/10 px-4 py-3 text-sm font-medium text-terracotta-600">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3" aria-label="Recording summary">
        <StatsCard
          icon={<MedumbaIcon />}
          label="Recordable"
          value={recordableQueue.length}
          description="Médumba items ready for pronunciation"
          variant="green"
        />
        <StatsCard
          icon={<SearchIcon />}
          label="Missing in view"
          value={missingConceptTexts.length}
          description="All missing audio rows for the selected filter"
        />
        <StatsCard
          icon={loadingLanguages || loadingQueue ? <LoadingIcon /> : <Mic className="h-5 w-5" aria-hidden />}
          label="Selected language"
          value={selectedLanguageLabel}
          description={selectedLanguage?.code ? selectedLanguage.code.toUpperCase() : 'All languages'}
          variant="warm"
        />
      </section>

      <AdminFilterBar>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:items-end">
          <label className="block">
            <span className="text-sm font-medium text-forest-600">Search</span>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa-body/45" aria-hidden />
            <input
              value={search}
              onChange={(event) => {
                setRecorderActive(false)
                setSearch(event.target.value)
              }}
              className="w-full rounded-xl border border-sand-200 bg-white/90 py-3 pl-11 pr-4 text-sm text-cocoa-800 outline-none transition placeholder:text-cocoa-body/45 hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-200"
              placeholder="Search concept text, concept, or language..."
            />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-forest-600">Language</span>
            <select
              value={languageId}
              onChange={(event) => {
                setRecorderActive(false)
                setLanguageId(event.target.value)
              }}
              className="mt-2 w-full rounded-xl border border-sand-200 bg-white/90 px-4 py-3 text-sm text-cocoa-800 outline-none transition hover:border-forest-300 focus:border-forest-600 focus:ring-2 focus:ring-forest-200"
            >
              <option value="">All languages</option>
              {languages.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-cocoa-body">
            <span className="h-2 w-2 rounded-full bg-terracotta-500" />
            Audio: missing only
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-cocoa-body">
            <span className="h-2 w-2 rounded-full bg-gold-500" />
            Review: needs audio
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-cocoa-body">
            <span className="h-2 w-2 rounded-full bg-forest-accent" />
            Médumba recording only
          </span>
        </div>
      </AdminFilterBar>

      {loadingQueue || loadingLanguages ? (
        <div className="rounded-2xl border border-sand-200 bg-white p-8 text-center shadow-soft">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-forest-600" aria-hidden />
          <p className="mt-4 text-sm font-medium text-cocoa-body">Loading recording queue...</p>
        </div>
      ) : recordableQueue.length === 0 ? (
        <div className="rounded-2xl border border-sand-200 bg-white p-8 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-wide text-forest-600/70">Recording queue</p>
          <h2 className="mt-2 text-2xl font-bold text-cocoa-800">
            {selectedLanguage ? 'No recordable Médumba items found' : 'Choose Médumba to begin'}
          </h2>
          <p className="mt-3 max-w-2xl text-cocoa-body">
            {selectedLanguage && selectedLanguage.code.toLowerCase() !== 'med'
              ? 'Recording is available for Médumba only. Switch the language filter back to Médumba to continue.'
              : 'No missing Médumba audio was found for the current search. Clear the search or return to the Concept Texts table.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/admin/content/concept-texts"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm font-semibold text-forest-700 transition hover:bg-cream-100 focus:outline-none focus:ring-2 focus:ring-forest-200"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Back to concept texts
            </Link>
          </div>
        </div>
      ) : currentItem ? (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
          <article className="rounded-2xl border border-sand-200 bg-white p-6 shadow-soft">
            <div className="rounded-2xl border border-forest-accent/20 bg-forest-accent/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-forest-700/75">Text to record</p>
              <p className="mt-3 break-words text-3xl font-bold leading-tight text-cocoa-800 md:text-4xl">
                {currentItem.text}
              </p>
              {currentItem.pronunciation ? (
                <p className="mt-3 break-words text-base font-semibold leading-7 text-cocoa-body">
                  Pronunciation: {currentItem.pronunciation}
                </p>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-forest-600/70">Current item</p>
                <h2 className="mt-2 text-3xl font-bold text-cocoa-800">{currentItem.concept?.title ?? 'Unknown concept'}</h2>
                <p className="mt-2 text-sm font-mono text-cocoa-body/65">{currentItem.concept?.key ?? currentItem.conceptId}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-forest-accent/20 bg-forest-accent/10 px-3 py-1.5 text-xs font-semibold text-forest-700">
                  {currentProgressLabel}
                </span>
                <span className="rounded-full border border-gold-500/20 bg-gold-400/15 px-3 py-1.5 text-xs font-semibold text-cocoa-700">
                  Missing audio
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-sand-100 bg-cream-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-forest-600/70">Language</p>
                <p className="mt-2 text-lg font-semibold text-cocoa-800">{currentLanguageLabel}</p>
                <p className="text-sm text-cocoa-body/65">{currentLanguageCode ? currentLanguageCode.toUpperCase() : 'Unknown code'}</p>
              </div>
              <div className="rounded-2xl border border-sand-100 bg-cream-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-forest-600/70">Concept</p>
                <p className="mt-2 text-lg font-semibold leading-7 text-cocoa-800">{currentItem.concept?.title ?? 'Unknown concept'}</p>
                <p className="mt-1 text-sm text-cocoa-body/70">Keep the recording centered on the phrase above.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {currentItem.literalMeaning ? (
                <div className="rounded-2xl border border-sand-100 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-forest-600/70">Literal meaning</p>
                  <p className="mt-2 text-sm italic text-cocoa-body">{currentItem.literalMeaning}</p>
                </div>
              ) : null}

              {currentItem.usageNote ? (
                <div className="rounded-2xl border border-sand-100 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-forest-600/70">Usage note</p>
                  <p className="mt-2 text-sm text-cocoa-body">{currentItem.usageNote}</p>
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={movePrevious}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-2 rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm font-semibold text-forest-700 transition hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
                Previous
              </button>
              <button
                type="button"
                onClick={moveNext}
                disabled={currentIndex >= recordableQueue.length - 1}
                className="inline-flex items-center gap-2 rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm font-semibold text-forest-700 transition hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <SkipForward className="h-4 w-4" aria-hidden />
                Skip
              </button>
              <Link
                to="/admin/content/concept-texts"
                className="inline-flex items-center gap-2 rounded-xl border border-forest-accent/20 bg-forest-accent/10 px-4 py-3 text-sm font-semibold text-forest-700 transition hover:bg-forest-accent/15"
              >
                Back to table
              </Link>
            </div>
          </article>

          <aside className="rounded-2xl border border-sand-200 bg-white p-6 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-wide text-forest-600/70">Recorder</p>
            <h3 className="mt-2 text-2xl font-bold text-cocoa-800">Record pronunciation</h3>
            <p className="mt-2 text-sm text-cocoa-body">
              Speak the phrase clearly, preview it, then submit it for review. Only Médumba is recordable in this workflow.
            </p>

            <div className="mt-6 space-y-4">
              {isRecordingLanguage ? (
                <InlineAudioRecorder
                  conceptName={currentItem.concept?.title ?? 'Unknown concept'}
                  languageName={currentLanguageLabel}
                  text={currentItem.text}
                  disabled={false}
                  isActive={recorderActive}
                  recordLabel="Record"
                  onActivate={() => setRecorderActive(true)}
                  onCancel={() => setRecorderActive(false)}
                  onSubmit={handleSubmit}
                />
              ) : (
                <div className="rounded-2xl border border-gold-500/20 bg-gold-400/10 p-4 text-sm text-cocoa-700">
                  Recording is available for Médumba only. Choose Médumba in the language filter to continue.
                </div>
              )}
            </div>
          </aside>
        </section>
      ) : null}
    </div>
  )
}
