"use client"

import * as React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { cn } from "@/lib/utils"

const WRAPPER_VARIANTS: Variants = {
  open: { scaleY: 1, opacity: 1, transition: { when: "beforeChildren", staggerChildren: 0.0167, duration: 0.1 } },
  closed: { scaleY: 0, opacity: 0, transition: { when: "afterChildren", staggerChildren: 0.0167, duration: 0.1 } },
}
const REDUCED_WRAPPER_VARIANTS: Variants = {
  open: { opacity: 1, transition: { when: "beforeChildren", duration: 0.1 } },
  closed: { opacity: 0, transition: { when: "afterChildren", duration: 0.1 } },
}
const ITEM_VARIANTS: Variants = {
  open: { opacity: 1, y: 0, transition: { when: "beforeChildren", duration: 0.1 } },
  closed: { opacity: 0, y: -10, transition: { when: "afterChildren", duration: 0.1 } },
}
const ICON_VARIANTS: Variants = {
  open: { scale: 1, y: 0, transition: { duration: 0.1 } },
  closed: { scale: 0, y: -7, transition: { duration: 0.1 } },
}
export const STAGGERED_CHEVRON_VARIANTS: Variants = {
  open: { rotate: 180, transition: { duration: 0.1 } },
  closed: { rotate: 0, transition: { duration: 0.1 } },
}

const SIDE_CLASSES = {
  bottom: "top-[calc(100%+0.5rem)]",
  right: "left-[calc(100%+0.5rem)] top-0",
} as const

const ALIGN_CLASSES = {
  start: "left-0",
  end: "right-0",
} as const

type DropdownContextValue = { close: () => void }
const DropdownContext = React.createContext<DropdownContextValue | null>(null)

function useDropdownContext(component: string) {
  const context = React.useContext(DropdownContext)
  if (!context) throw new Error(`${component} must be used within StaggeredDropdown`)
  return context
}

function useCloseOnOutsideOrEscape(open: boolean, close: () => void, rootRef: React.RefObject<HTMLElement | null>, returnFocusRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return
    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) close()
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close()
        returnFocusRef.current?.focus()
      }
    }
    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, close, rootRef, returnFocusRef])
}

function StaggeredDropdown({
  trigger,
  triggerClassName,
  side = "bottom",
  align = "start",
  className,
  contentClassName,
  children,
}: {
  trigger: React.ReactNode
  triggerClassName?: string
  side?: "bottom" | "right"
  align?: "start" | "end"
  className?: string
  contentClassName?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const reduceMotion = useReducedMotion()
  const close = useCallback(() => setOpen(false), [])

  useCloseOnOutsideOrEscape(open, close, rootRef, triggerRef)

  const wrapperVariants = reduceMotion ? REDUCED_WRAPPER_VARIANTS : WRAPPER_VARIANTS

  return (
    <DropdownContext.Provider value={{ close }}>
      <motion.div
        ref={rootRef}
        animate={open ? "open" : "closed"}
        initial={false}
        className={cn("relative inline-block", className)}
      >
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          className={cn("inline-flex items-center", triggerClassName)}
        >
          {trigger}
        </button>
        <motion.ul
          variants={wrapperVariants}
          style={{ originY: side === "bottom" ? "top" : "center" }}
          className={cn(
            "absolute z-50 flex w-48 flex-col gap-0.5 overflow-hidden rounded-lg bg-popover p-1.5 text-popover-foreground shadow-lg ring-1 ring-foreground/10",
            SIDE_CLASSES[side],
            side === "bottom" && ALIGN_CLASSES[align],
            !open && "pointer-events-none",
            contentClassName
          )}
        >
          {children}
        </motion.ul>
      </motion.div>
    </DropdownContext.Provider>
  )
}

function StaggeredDropdownItem({
  icon: Icon,
  children,
  onClick,
  className,
  variant = "default",
}: {
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: "default" | "destructive"
}) {
  const { close } = useDropdownContext("StaggeredDropdownItem")
  return (
    <motion.li
      variants={ITEM_VARIANTS}
      onClick={() => {
        onClick?.()
        close()
      }}
      className={cn(
        "flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm whitespace-nowrap transition-colors hover:bg-accent hover:text-accent-foreground",
        variant === "destructive" && "text-destructive hover:bg-destructive/10 hover:text-destructive",
        className
      )}
    >
      {Icon && (
        <motion.span variants={ICON_VARIANTS} className="shrink-0">
          <Icon className="size-4" />
        </motion.span>
      )}
      <span>{children}</span>
    </motion.li>
  )
}

function StaggeredDropdownChevron({ className }: { className?: string }) {
  return (
    <motion.span variants={STAGGERED_CHEVRON_VARIANTS} className={cn("shrink-0", className)}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.span>
  )
}

export { StaggeredDropdown, StaggeredDropdownItem, StaggeredDropdownChevron, useCloseOnOutsideOrEscape, WRAPPER_VARIANTS, REDUCED_WRAPPER_VARIANTS, ITEM_VARIANTS }
