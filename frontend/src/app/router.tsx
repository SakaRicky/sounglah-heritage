import { Navigate, createBrowserRouter } from 'react-router-dom'

import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { AdminLayout } from '../components/layout/AdminLayout'
import { PublicLayout } from '../components/layout/PublicLayout'
import { LandingPage } from '../pages/public/LandingPage'
import { LanguagesPage } from '../pages/public/LanguagesPage'
import { StoriesCulturesPage } from '../pages/public/StoriesCulturesPage'
import { LoginPage } from '../pages/auth/LoginPage'
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { AdminPlaceholderPage } from '../pages/admin/AdminPlaceholderPage'
import { AdminConceptTextsPage } from '../features/conceptTexts/pages/ConceptTextsPage'
import { ConceptTextAudioReviewPage } from '../features/conceptTexts/pages/ConceptTextAudioReviewPage'
import { ConceptTextReviewPage } from '../features/conceptTexts/pages/ConceptTextReviewPage'
import { ConceptTextRecordingModePage } from '../features/conceptTexts/pages/ConceptTextRecordingModePage'
import { ConceptCompletionPage } from '../features/concepts/pages/ConceptCompletionPage'
import { AdminConceptsPage } from '../features/concepts/pages/ConceptsPage'
import { AdminLanguagesPage } from '../features/languages/pages/LanguagesPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'languages',
        element: <LanguagesPage />,
      },
      {
        path: 'stories-cultures',
        element: <StoriesCulturesPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminDashboardPage />,
          },
          {
            path: 'languages',
            element: <Navigate to="/admin/content/languages" replace />,
          },
          {
            path: 'content/languages',
            element: <AdminLanguagesPage />,
          },
          {
            path: 'content/concepts',
            element: <AdminConceptsPage />,
          },
          {
            path: 'content/concepts/completion',
            element: <ConceptCompletionPage />,
          },
          {
            path: 'content/concept-texts',
            element: <AdminConceptTextsPage />,
          },
          {
            path: 'content/concept-texts/recording',
            element: <ConceptTextRecordingModePage />,
          },
          {
            path: 'content/concept-texts/review',
            element: <ConceptTextReviewPage />,
          },
          {
            path: 'content/concept-texts/audio-review',
            element: <ConceptTextAudioReviewPage />,
          },
          {
            path: 'audio-recording',
            element: <Navigate to="/admin/content/concept-texts/recording" replace />,
          },
          {
            path: 'audio-review',
            element: <Navigate to="/admin/content/concept-texts/audio-review" replace />,
          },
          {
            path: 'text-review',
            element: <Navigate to="/admin/content/concept-texts/review" replace />,
          },
          {
            path: 'content/lessons',
            element: (
              <AdminPlaceholderPage
                title="Lessons"
                description="Build structured lessons for heritage learning."
                nextSlice="S014"
              />
            ),
          },
          {
            path: 'content/lesson-items',
            element: (
              <AdminPlaceholderPage
                title="Lesson Items"
                description="Create the small learning steps inside lessons."
                nextSlice="S015"
              />
            ),
          },
          {
            path: 'concepts',
            element: <Navigate to="/admin/content/concepts" replace />,
          },
          {
            path: 'concept-texts',
            element: <Navigate to="/admin/content/concept-texts" replace />,
          },
          {
            path: 'lessons',
            element: <Navigate to="/admin/content/lessons" replace />,
          },
          {
            path: 'lesson-items',
            element: <Navigate to="/admin/content/lesson-items" replace />,
          },
        ],
      },
    ],
  },
])
