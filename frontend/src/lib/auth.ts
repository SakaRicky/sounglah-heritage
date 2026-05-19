const TOKEN_KEY = 'sounglah_auth_token'
const AUTH_CHANGED_EVENT = 'sounglah:auth-changed'

function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
}

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
  notifyAuthChanged()
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  notifyAuthChanged()
}

export function isAuthenticated() {
  return Boolean(getToken())
}

export function subscribeToAuthChanges(callback: () => void) {
  window.addEventListener(AUTH_CHANGED_EVENT, callback)
  window.addEventListener('storage', callback)

  return () => {
    window.removeEventListener(AUTH_CHANGED_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}
