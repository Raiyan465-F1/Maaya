"use client"

import { useCallback, useRef, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

interface PendingConfirm {
  options: ConfirmOptions
  resolve: (result: boolean) => void
}

export function useConfirm() {
  const [pending, setPending] = useState<PendingConfirm | null>(null)
  const pendingRef = useRef<PendingConfirm | null>(null)

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      const entry: PendingConfirm = { options, resolve }
      pendingRef.current = entry
      setPending(entry)
    })
  }, [])

  const settle = useCallback((result: boolean) => {
    const entry = pendingRef.current
    pendingRef.current = null
    setPending(null)
    if (entry) {
      entry.resolve(result)
    }
  }, [])

  const ConfirmDialog = useCallback(() => {
    const options = pending?.options

    return (
      <AlertDialog
        open={!!pending}
        onOpenChange={(open) => {
          if (!open) settle(false)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{options?.title ?? "Are you sure?"}</AlertDialogTitle>
            {options?.description && (
              <AlertDialogDescription>{options.description}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => settle(false)}>
              {options?.cancelLabel ?? "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              data-variant={options?.destructive ? "destructive" : undefined}
              onClick={(event) => {
                event.preventDefault()
                settle(true)
              }}
            >
              {options?.confirmLabel ?? "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }, [pending, settle])

  return { confirm, ConfirmDialog }
}
