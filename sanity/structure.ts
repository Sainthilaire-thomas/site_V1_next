export const structure = (S: any) =>
  S.list()
    .title('Contenu')
    .items([
      S.listItem().title('Homepage').child(
        S.document().schemaType('homepage').documentId('homepage-singleton')
      ),
      S.divider(),
      S.listItem().title('Pages').child(S.documentTypeList('page')),
      S.listItem().title('Lookbooks').child(S.documentTypeList('lookbook')),
      S.listItem().title('Collections éditoriales').child(S.documentTypeList('collectionEditoriale')),
      S.divider(),
      S.listItem().title('SEO (réutilisable)').child(S.documentTypeList('seo')),
    ])
