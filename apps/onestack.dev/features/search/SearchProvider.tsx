import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ViewProps } from 'react-native'
import { Paragraph, Text } from 'tamagui'
import { useLinkTo, useRouter, type LinkProps as OneLinkProps } from 'one'
import { SearchContext } from './SearchContext'

// const ACTION_KEY_DEFAULT = ['Ctrl ', 'Control']
// const ACTION_KEY_APPLE = ['⌘', 'Command']
const API_KEY = '944bc68c2db83c04ef4785e559c6c573'
const APP_ID = '4XXMYD3SML'
const INDEX = 'one_docs'

export type LinkProps = ViewProps & OneLinkProps

export const Link = ({ href, replace, asChild, ...props }: LinkProps) => {
  const linkProps = useLinkTo({ href: href as string, replace })

  return (
    <Text
      tag="a"
      // always except-style
      asChild={asChild ? 'except-style' : false}
      className="t_Link"
      cursor="pointer"
      color="inherit"
      fontSize="inherit"
      lineHeight="inherit"
      {...props}
      {...linkProps}
    />
  )
}

let DocSearchModal

export const SearchProvider = memo(({ children }: any) => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [initialQuery, setInitialQuery] = useState(null)
  const [show, setShow] = useState(false)

  const onInput = useCallback(
    (e: any) => {
      setIsOpen(true)
      setInitialQuery(e.key)
    },
    [setIsOpen, setInitialQuery]
  )
  const onOpen = useCallback(() => setIsOpen(true), [setIsOpen])
  const onClose = useCallback(() => setIsOpen(false), [setIsOpen])

  useSearchKeyboard({
    isOpen,
    onOpen,
    onClose,
    onInput,
  })

  const contextValue = useMemo(
    () => ({
      isOpen,
      onOpen,
      onClose,
      onInput,
    }),
    [isOpen, onOpen, onClose, onInput]
  )

  useEffect(() => {
    if (!DocSearchModal && isOpen) {
      import('./DocSearch').then((x) => {
        DocSearchModal = x.default
        setShow(true)
      })
    }
  }, [isOpen])

  return (
    <>
      <SearchContext.Provider value={contextValue}>{children}</SearchContext.Provider>

      {isOpen &&
        show &&
        DocSearchModal &&
        createPortal(
          <DocSearchModal
            placeholder="Search One docs..."
            hitComponent={ResultItem}
            searchParameters={{
              // facetFilters: ['version:1.0.0'],
              facetFilters: [],
              distinct: 1,
            }}
            initialQuery={initialQuery || ''}
            initialScrollY={window.scrollY}
            onClose={onClose}
            appId={APP_ID}
            apiKey={API_KEY}
            indexName={INDEX}
            navigator={{
              navigate({ itemUrl }) {
                setIsOpen(false)
                router.push(itemUrl)
              },
            }}
            transformItems={(items) => {
              console.log({ items })
              return items.map((item) => {
                const url = new URL(item.url)
                return {
                  ...item,
                  url: `${url.pathname}${url.hash}`,
                  content: item.content,
                  highlightedContent: item._highlightResult?.content?.value || item.content,
                  snippet: item._snippetResult?.content?.value || '',
                  objectID: item.objectID,
                  type: item.type || 'content',
                }
              })
            }}
          />,
          document.body
        )}
    </>
  )
})

const ResultItem = ({ hit, children }) => {
  return (
    <Link href={window.location.origin + hit.url}>
      <Paragraph tag="span" color="$color">
        {children}
      </Paragraph>
    </Link>
  )
}

const useSearchKeyboard = ({ isOpen, onOpen, onClose }: any) => {
  useEffect(() => {
    const onKeyDown = (event: any) => {
      function open() {
        if (!document.body.classList.contains('DocSearch--active')) {
          onOpen()
        }
      }
      if (
        (isOpen && event.keyCode === 27) ||
        (event.key === 'k' && (event.metaKey || event.ctrlKey)) ||
        (!isFocusedSomewhere(event) && event.key === '/' && !isOpen)
      ) {
        event.preventDefault()

        if (isOpen) {
          onClose()
        } else if (!document.body.classList.contains('DocSearch--active')) {
          open()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, onOpen, onClose])
}

const isFocusedSomewhere = (event: any) => {
  const element = event.target
  const tagName = element.tagName
  return (
    element.isContentEditable ||
    tagName === 'INPUT' ||
    tagName === 'SELECT' ||
    tagName === 'TEXTAREA'
  )
}
