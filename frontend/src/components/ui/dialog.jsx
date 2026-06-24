import React, { useEffect, useRef } from "react";

// Lightweight Dialog components matching shadcn/ui API surface

export function Dialog({ open, onOpenChange, children }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === overlayRef.current) onOpenChange?.(false);
      }}
    >
      {children}
    </div>
  );
}

export function DialogContent({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 animate-in fade-in ${className}`}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ children, className = "" }) {
  return <div className={`space-y-2 ${className}`}>{children}</div>;
}

export function DialogTitle({ children, className = "" }) {
  return (
    <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
      {children}
    </h2>
  );
}

export function DialogDescription({ children, className = "" }) {
  return (
    <p className={`text-sm text-gray-500 ${className}`}>{children}</p>
  );
}

export function DialogFooter({ children, className = "" }) {
  return (
    <div className={`flex justify-end gap-2 pt-4 ${className}`}>
      {children}
    </div>
  );
}
