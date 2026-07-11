"use client"

import * as React from "react"
import { useCallback, useRef, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"
import {
  ITEM_VARIANTS,
  REDUCED_WRAPPER_VARIANTS,
  StaggeredDropdownChevron,
  WRAPPER_VARIANTS,
  useCloseOnOutsideOrEscape,
} from "@/components/ui/staggered-dropdown"

function StaggeredSelect({
  name,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  className,
  triggerClassName,
  children,
}: {
  name?: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
  triggerClassName?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "")
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const reduceMotion = useReducedMotion()
  const close = useCallback(() => setOpen(false), [])

  useCloseOnOutsideOrEscape(open, close, rootRef, triggerRef)

  const currentValue = value ?? uncontrolledValue
  const wrapperVariants = reduceMotion ? REDUCED_WRAPPER_VARIANTS : WRAPPER_VARIANTS

  function selectValue(nextValue: string) {
    if (value === undefined) setUncontrolledValue(nextValue)
    onValueChange?.(nextValue)
    close()
  }

  let selectedLabel: React.ReactNode = placeholder
  React.Children.forEach(children, (child) => {
    if (React.isValidElement<{ value: string; children?: React.ReactNode }>(child) && child.props.value === currentValue) {
      selectedLabel = child.props.children
    }
  })

  return (
    <StaggeredSelectContext.Provider value={{ currentValue, selectValue }}>
      {name && <input type="hidden" name={name} value={currentValue} />}
      <motion.div
        ref={rootRef}
        animate={open ? "open" : "closed"}
        initial={false}
        className={cn("relative inline-block", className)}
      >
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex w-fit items-center justify-between gap-2 rounded-lg bg-card px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-shadow data-open:shadow-md",
            triggerClassName
          )}
          data-open={open || undefined}
        >
          <span>{selectedLabel}</span>
          <StaggeredDropdownChevron className="text-muted-foreground" />
        </button>
        <motion.ul
          variants={wrapperVariants}
          style={{ originY: "top" }}
          className={cn(
            "absolute top-[calc(100%+0.5rem)] left-0 z-50 flex min-w-full flex-col gap-0.5 overflow-hidden rounded-lg bg-popover p-1.5 text-popover-foreground shadow-lg ring-1 ring-foreground/10",
            !open && "pointer-events-none"
          )}
        >
          {children}
        </motion.ul>
      </motion.div>
    </StaggeredSelectContext.Provider>
  )
}

const StaggeredSelectContext = React.createContext<{
  currentValue: string
  selectValue: (value: string) => void
} | null>(null)

function StaggeredSelectItem({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const context = React.useContext(StaggeredSelectContext)
  if (!context) throw new Error("StaggeredSelectItem must be used within StaggeredSelect")
  const selected = context.currentValue === value

  return (
    <motion.li
      variants={ITEM_VARIANTS}
      onClick={() => context.selectValue(value)}
      data-selected={selected || undefined}
      className={cn(
        "flex w-full cursor-default items-center rounded-md px-2 py-1.5 text-sm whitespace-nowrap transition-colors hover:bg-accent hover:text-accent-foreground data-selected:bg-accent/60",
        className
      )}
    >
      {children}
    </motion.li>
  )
}

export { StaggeredSelect, StaggeredSelectItem }
