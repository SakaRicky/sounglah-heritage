import { expect, test, type Page } from '@playwright/test'

async function openMobileNavIfNeeded(page: Page) {
  const menuButton = page.getByRole('button', { name: /open menu/i })

  if (await menuButton.isVisible()) {
    await menuButton.click()
  }
}

function visibleLanguageSelect(page: Page) {
  return page.locator('select[aria-label="Language"]').filter({ visible: true })
}

test.describe('public experience', () => {
  test('loads the landing page and reaches the languages page', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('link', { name: 'Sounglah home' })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Their language\./ })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Explore our languages' })).toBeVisible()

    await page.getByRole('link', { name: 'View all languages' }).click()

    await expect(page).toHaveURL(/\/languages$/)
    await expect(page.getByRole('heading', { name: 'Heritage languages' })).toBeVisible()
    await expect(page.getByText('Médumba').first()).toBeVisible()
  })

  test('switches public copy between English and French', async ({ page }) => {
    await page.goto('/')

    await openMobileNavIfNeeded(page)
    await visibleLanguageSelect(page).selectOption('fr')
    await page.keyboard.press('Escape')

    await expect(page.getByRole('link', { name: 'Accueil Sounglah' })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Leur langue\./ })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Explorer nos langues' })).toBeVisible()

    await page.getByRole('link', { name: 'Voir toutes les langues' }).click()

    await expect(page).toHaveURL(/\/languages$/)
    await expect(page.getByRole('heading', { name: 'Langues héritées' })).toBeVisible()
  })

  test('opens login from the navbar', async ({ page }) => {
    await page.goto('/')

    await openMobileNavIfNeeded(page)
    await page.getByRole('link', { name: 'Login' }).click()

    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'Admin login' })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
  })
})
