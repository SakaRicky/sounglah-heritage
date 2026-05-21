import { isAuthenticated } from '../../../lib/auth'

type ConceptTextAudioPermission =
  | 'read'
  | 'create'
  | 'replace'
  | 'review'
  | 'approve'
  | 'reject'
  | 'archive'

export function canManageConceptTextAudio(permission: ConceptTextAudioPermission) {
  void permission
  // MVP: admin authentication is the permission boundary.
  // Keep this helper as the single frontend upgrade point when roles are added.
  return isAuthenticated()
}

export function canRecordConceptTextAudio(languageCode?: string | null) {
  return canManageConceptTextAudio('create') && languageCode?.toLowerCase() === 'med'
}
