// sanity/structure.ts
import type { StructureBuilder } from 'sanity/structure'

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Contenu')
    .items([
      // Homepage
      S.listItem()
        .title('Homepage')
        .child(
          S.document().schemaType('homepage').documentId('homepage-singleton')
        ),

      // Page Impact
      S.listItem()
        .title('Page Impact')
        .child(
          S.document().schemaType('impactPage').documentId('impact-singleton')
        ),

      S.divider(),

      // .edition room (Blog)
      S.listItem()
        .title('.edition room')
        .child(
          S.list()
            .title('.edition room')
            .items([
              S.listItem()
                .title('Tous les articles')
                .child(
                  S.documentTypeList('editionRoomPost')
                    .title('Articles')
                    .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('Publies')
                .child(
                  S.documentList()
                    .title('Articles publies')
                    .filter('_type == "editionRoomPost" && status == "published"')
                    .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('Brouillons')
                .child(
                  S.documentList()
                    .title('Brouillons')
                    .filter('_type == "editionRoomPost" && status == "draft"')
                    .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                ),
              S.divider(),
              S.listItem()
                .title('Categories')
                .child(
                  S.documentTypeList('editionRoomCategory')
                    .title('Categories')
                    .defaultOrdering([{ field: 'order', direction: 'asc' }])
                ),
            ])
        ),

      S.divider(),

      // Pages
      S.listItem()
        .title('Pages')
        .child(
          S.documentTypeList('page')
            .title('Toutes les pages')
            .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
        ),

      // Lookbooks
      S.listItem()
        .title('Lookbooks')
        .child(
          S.list()
            .title('Lookbooks')
            .items([
              S.listItem()
                .title('Publies')
                .child(
                  S.documentTypeList('lookbook')
                    .title('Lookbooks publies')
                    .filter('_type == "lookbook" && coalesce(published, true) == true')
                    .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('Depublies')
                .child(
                  S.documentTypeList('lookbook')
                    .title('Lookbooks depublies')
                    .filter('_type == "lookbook" && published == false')
                    .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
                ),
              S.divider(),
              S.listItem()
                .title('Tous')
                .child(
                  S.documentTypeList('lookbook')
                    .title('Tous les lookbooks')
                    .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
                ),
            ])
        ),

      S.divider(),

      // Legacy - Collections editoriales
      S.listItem()
        .title('Collections editoriales (legacy)')
        .child(
          S.documentTypeList('collectionEditoriale')
            .title('Collections editoriales')
            .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
        ),
    ])
