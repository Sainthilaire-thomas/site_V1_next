// src/components/common/RichTextRenderer.tsx
import { urlFor } from '@/lib/sanity.image'

interface RichTextRendererProps {
  content: any[]
  className?: string
}

export default function RichTextRenderer({
  content,
  className = '',
}: RichTextRendererProps) {
  if (!content || !Array.isArray(content)) return null

  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      {content.map((block, index) => {
        if (block._type === 'block') {
          const children = block.children?.map(
            (child: any, childIndex: number) => (
              <span
                key={childIndex}
                className={
                  child.marks?.includes('strong') ? 'font-semibold' : ''
                }
              >
                {child.text}
              </span>
            )
          )

          switch (block.style) {
            case 'h1':
              return (
                <h1
                  key={index}
                  className="text-4xl font-light text-gray-900 mb-8"
                >
                  {children}
                </h1>
              )
            case 'h2':
              return (
                <h2
                  key={index}
                  className="text-3xl font-light text-gray-900 mb-6"
                >
                  {children}
                </h2>
              )
            case 'h3':
              return (
                <h3
                  key={index}
                  className="text-2xl font-light text-gray-900 mb-4"
                >
                  {children}
                </h3>
              )
            default:
              return (
                <p key={index} className="text-gray-600 mb-6 leading-relaxed">
                  {children}
                </p>
              )
          }
        }

        if (block._type === 'image') {
          return (
            <div key={index} className="my-8">
              <img
                src={urlFor(block).width(800).height(600).url()}
                alt={block.alt || ''}
                className="w-full h-auto rounded-lg"
              />
              {block.caption && (
                <p className="text-sm text-gray-500 mt-2 text-center italic">
                  {block.caption}
                </p>
              )}
            </div>
          )
        }

        return null
      })}
    </div>
  )
}
