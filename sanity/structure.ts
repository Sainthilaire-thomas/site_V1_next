// sanity/structure.ts
import type { StructureBuilder } from 'sanity/desk'

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Contenu')
    .items([
      S.listItem()
        .title('Homepage')
        .child(
          S.document().schemaType('homepage').documentId('homepage-singleton')
        ),

      S.divider(),

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
                .title('Publiés')
                .child(
                  S.documentTypeList('lookbook')
                    .title('Lookbooks publiés')
                    .filter(
                      '_type == "lookbook" && coalesce(published, true) == true'
                    )
                    .defaultOrdering([
                      { field: '_createdAt', direction: 'desc' },
                    ])
                ),
              S.listItem()
                .title('Dépubliés')
                .child(
                  S.documentTypeList('lookbook')
                    .title('Lookbooks dépubliés')
                    .filter('_type == "lookbook" && published == false')
                    .defaultOrdering([
                      { field: '_createdAt', direction: 'desc' },
                    ])
                ),
              S.divider(),
              S.listItem()
                .title('Tous')
                .child(
                  S.documentTypeList('lookbook')
                    .title('Tous les lookbooks')
                    .defaultOrdering([
                      { field: '_createdAt', direction: 'desc' },
                    ])
                ),
            ])
        ),

      // Collections éditoriales
      S.listItem()
        .title('Collections éditoriales')
        .child(
          S.list()
            .title('Collections éditoriales')
            .items([
              S.listItem()
                .title('Publiées')
                .child(
                  S.documentTypeList('collectionEditoriale')
                    .title('Collections publiées')
                    .filter(
                      '_type == "collectionEditoriale" && coalesce(published, true) == true'
                    )
                    .defaultOrdering([
                      { field: '_createdAt', direction: 'desc' },
                    ])
                ),
              S.listItem()
                .title('Dépubliées')
                .child(
                  S.documentTypeList('collectionEditoriale')
                    .title('Collections dépubliées')
                    .filter(
                      '_type == "collectionEditoriale" && published == false'
                    )
                    .defaultOrdering([
                      { field: '_createdAt', direction: 'desc' },
                    ])
                ),
              S.divider(),
              S.listItem()
                .title('Toutes')
                .child(
                  S.documentTypeList('collectionEditoriale')
                    .title('Toutes les collections éditoriales')
                    .defaultOrdering([
                      { field: '_createdAt', direction: 'desc' },
                    ])
                ),
            ])
        ),

      S.divider(),

      S.listItem()
        .title('SEO (réutilisable)')
        .child(
          S.documentTypeList('seo')
            .title('Entrées SEO')
            .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
        ),
    ])
