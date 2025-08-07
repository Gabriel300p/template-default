import { LoadingSpinner } from "@/shared/components/ui/toast/_index";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

// 🚀 Code Splitting: Lazy load LoginPage
const LoginPage = lazy(() =>
  import("@/features/auth/_index").then((module) => ({
    default: module.LoginPage,
  })),
);

export const Route = createFileRoute("/login")({
  component: () => (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <LoadingSpinner size="lg" text="Carregando página de login..." />
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  ),
});
