import React, {useEffect, useRef, useState, type ReactNode, type RefObject} from 'react'
import {Portal} from '@/components/Portal'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  ariaLabel?: string
  initialFocusRef?: RefObject<HTMLElement>
  closeOnBackdropClick?: boolean
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  ariaLabel,
  initialFocusRef,
  closeOnBackdropClick = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState<boolean>(isOpen)
  const [isClosing, setIsClosing] = useState<boolean>(false)
  const [announce, setAnnounce] = useState('')
  const animationDuration = 200

  useEffect(() => {
    let cleanup: (() => void) | undefined
    if (isOpen) {
      setVisible(true)
      setIsClosing(false)
      setAnnounce(ariaLabel ? `${ariaLabel} 창이 열렸습니다.` : '대화상자가 열렸습니다.')
      previouslyFocused.current = document.activeElement as HTMLElement | null

      // wait for the element to mount
      setTimeout(() => {
        const container = containerRef.current
        if (!container) return
        const focusableSelector =
          'a[href], area[href], input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'
        const focusables = Array.from(container.querySelectorAll<HTMLElement>(focusableSelector))
        const toFocus = initialFocusRef?.current ?? focusables[0]
        toFocus?.focus()
      }, 0)

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          onClose()
          return
        }
        if (e.key === 'Tab') {
          const container = containerRef.current
          if (!container) return
          const focusableSelector =
            'a[href], area[href], input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'
          const focusables = Array.from(container.querySelectorAll<HTMLElement>(focusableSelector))
          if (focusables.length === 0) {
            e.preventDefault()
            return
          }
          const active = document.activeElement as HTMLElement
          const first = focusables[0]
          const last = focusables[focusables.length - 1]
          if (e.shiftKey) {
            if (active === first) {
              e.preventDefault()
              last.focus()
            }
          } else {
            if (active === last) {
              e.preventDefault()
              first.focus()
            }
          }
        }
      }

      document.addEventListener('keydown', onKeyDown)
      cleanup = () => {
        document.removeEventListener('keydown', onKeyDown)
        previouslyFocused.current?.focus()
      }
    } else if (visible) {
      // start closing animation then unmount
      setIsClosing(true)
      setAnnounce(ariaLabel ? `${ariaLabel} 창이 닫혔습니다.` : '대화상자가 닫혔습니다.')
      const t = setTimeout(() => {
        setVisible(false)
        setIsClosing(false)
      }, animationDuration)
      cleanup = () => clearTimeout(t)
    }
    return cleanup
  }, [isOpen, onClose, initialFocusRef, ariaLabel, visible])

  if (!visible) return null

  const onBackdropClick = (e: React.MouseEvent) => {
    if (!closeOnBackdropClick) return
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <Portal>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-${animationDuration} ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onMouseDown={onBackdropClick}
      >
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          className={`bg-white rounded shadow-lg p-4 w-full max-w-md mx-4 transform transition-all duration-${animationDuration} ${
            isClosing ? 'opacity-0 translate-y-2 scale-95' : 'opacity-100 translate-y-0 scale-100'
          }`}
        >
          {/* sr-only live region for screen readers */}
          <div aria-live="assertive" role="status" className="sr-only">
            {announce}
          </div>
          {children}
        </div>
      </div>
    </Portal>
  )
}

export default Modal
