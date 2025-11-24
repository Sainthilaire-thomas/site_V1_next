// sanity/schemas/index.ts
// Schémas Sanity - Blanche Renaudin

import blockContent from './types/blockContent'
import collectionEditoriale from './types/collectionEditoriale'
import homepage from './types/homepage'
import impactPage from './types/impactPage'
import lookbook from './types/lookbook'
import page from './types/page'
import seo from './types/seo'

// Nouveaux schémas .edition room
import editionRoomPost from './types/editionRoomPost'
import editionRoomCategory from './types/editionRoomCategory'

export const schemaTypes = [
  // Content types
  homepage,
  page,
  lookbook,
  impactPage,
  collectionEditoriale, // Legacy - à supprimer après migration

  // .edition room (Blog)
  editionRoomPost,
  editionRoomCategory,

  // Building blocks
  blockContent,
  seo,
]
