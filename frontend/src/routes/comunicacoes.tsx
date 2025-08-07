import { RouteSkeleton } from "@/shared/components/skeletons/_index";
import { ComunicacoesPage } from "@features/comunicacoes";
import { MainLayout } from "@shared/components/layout/MainLayout";
import { useLoadingConfig } from "@shared/hooks/useLoadingConfig";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

// 🚀 Lazy loading do componente (usado apenas se configurado)
const LazyLoadedComunicacoesPage = lazy(() =>
  import("@features/comunicacoes").then((module) => ({
    default: module.ComunicacoesPage,
  })),
);

// 🎯 Componente que escolhe a estratégia de loading baseado na config
function ComunicacoesPageLoader() {
  const config = useLoadingConfig();

  // Opção 1: Lazy loading com RouteSkeleton
  if (config.useLazyLoading && config.useRouteSkeleton) {
    return (
      <Suspense fallback={<RouteSkeleton />}>
        <LazyLoadedComunicacoesPage />
      </Suspense>
    );
  }

  // Opção 2: Lazy loading sem skeleton (fallback transparente)
  if (config.useLazyLoading && !config.useRouteSkeleton) {
    return (
      <Suspense fallback={<div />}>
        <LazyLoadedComunicacoesPage />
      </Suspense>
    );
  }

  // Opção 3: Import direto (sem lazy loading)
  return <ComunicacoesPage />;
}

export const Route = createFileRoute("/comunicacoes")({
  component: () => (
    <MainLayout>
      <ComunicacoesPageLoader />
    </MainLayout>
  ),
});
