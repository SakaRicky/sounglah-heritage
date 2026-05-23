const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:5000/api'

function apiOrigin() {
  return new URL(API_BASE_URL).origin
}

export function resolveMediaUrl(src?: string | null) {
  if (!src) {
    return null
  }

  if (/^[a-z]+:/i.test(src)) {
    return src
  }

  if (src.startsWith('/media/')) {
    return `${apiOrigin()}${src}`
  }

  return src
}
