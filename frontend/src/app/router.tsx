import { createBrowserRouter } from 'react-router-dom'

import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { AdminLayout } from '../components/layout/AdminLayout'
import { PublicLayout } from '../components/layout/PublicLayout'
import { LandingPage } from '../pages/public/LandingPage'
import { LanguagesPage } from '../pages/public/LanguagesPage'
import { StoriesCulturesPage } from '../pages/public/StoriesCulturesPage'
import { LoginPage } from '../pages/auth/LoginPage'
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { AdminPlaceholderPage } from '../pages/admin/AdminPlaceholderPage'

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
            element: (
              <AdminPlaceholderPage
                title="Languages"
                description="Manage supported languages for Sounglah."
                nextSlice="S011"
              />
            ),
          },
          {
            path: 'concepts',
            element: (
              <AdminPlaceholderPage
                title="Concepts"
                description="Organize learning concepts used across lessons."
                nextSlice="S012"
              />
            ),
          },
          {
            path: 'concept-texts',
            element: (
              <AdminPlaceholderPage
                title="Concept Texts"
                description="Connect concepts to learner-facing translated text."
                nextSlice="S013"
              />
            ),
          },
          {
            path: 'lessons',
            element: (
              <AdminPlaceholderPage
                title="Lessons"
                description="Build structured lessons for heritage learning."
                nextSlice="S014"
              />
            ),
          },
          {
            path: 'lesson-items',
            element: (
              <AdminPlaceholderPage
                title="Lesson Items"
                description="Create the small learning steps inside lessons."
                nextSlice="S015"
              />
            ),
          },
        ],
      },
    ],
  },
])
