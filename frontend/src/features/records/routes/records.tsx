import { RouteSkeleton } from "@/shared/components/skeletons/_index";
import { RecordsPage } from "@features/records";
import { MainLayout } from "@shared/components/layout/MainLayout";
import { useLoadingConfig } from "@shared/hooks/useLoadingConfig";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

// 🚀 Lazy loading do componente (usado apenas se configurado)
const LazyLoadedRecordsPage = lazy(() =>
  import("@features/records").then((module) => ({
    default: module.RecordsPage,
  })),
);

// 🎯 Componente que escolhe a estratégia de loading baseado na config
function RecordsPageLoader() {
  const config = useLoadingConfig();

  // Opção 1: Lazy loading com RouteSkeleton
  if (config.useLazyLoading && config.useRouteSkeleton) {
    return (
      <Suspense fallback={<RouteSkeleton />}>
        <LazyLoadedRecordsPage />
      </Suspense>
    );
  }

  // Opção 2: Lazy loading sem skeleton (fallback transparente)
  if (config.useLazyLoading && !config.useRouteSkeleton) {
    return (
      <Suspense fallback={<div />}>
        <LazyLoadedRecordsPage />
      </Suspense>
    );
  }

  // Opção 3: Import direto (sem lazy loading)
  return <RecordsPage />;
}

export const Route = createFileRoute("/records")({
  component: () => (
    <MainLayout>
      <RecordsPageLoader />
    </MainLayout>
  ),
});
