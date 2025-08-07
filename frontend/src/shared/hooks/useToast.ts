import { useContext } from "react";
import type { ToastContextValue } from "../components/ui/toast/ToastProvider";
import { ToastContext } from "../components/ui/toast/ToastProvider";

// 🪝 useToast Hook
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error("useToast deve ser usado dentro de um ToastProvider");
  }

  return context;
}
