"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogClose = DialogPrimitive.Close;

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn("sr-only", className)} {...props} />;
}

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn("animate-fade-in fixed inset-0 z-40 bg-black/50", className)}
      {...props}
    />
  );
}

/** Conteúdo sem estilo de caixa: cada tela desenha o seu (modal, bottom sheet, drawer). */
// clicar no "desfazer" do toast não pode contar como clique fora e fechar o modal
function keepOpenOnToast(e: { target: EventTarget | null; preventDefault: () => void }) {
  if ((e.target as Element | null)?.closest?.("[data-toast]")) e.preventDefault();
}

function DialogContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        aria-describedby={undefined}
        onPointerDownOutside={keepOpenOnToast}
        onInteractOutside={keepOpenOnToast}
        className={cn("fixed z-40 outline-none", className)}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export { Dialog, DialogClose, DialogContent, DialogOverlay, DialogTitle };
