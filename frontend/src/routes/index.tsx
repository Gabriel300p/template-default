import { AnimatedPageExample } from "@/shared/animations/examples";
import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

function IndexComponent() {
  // Temporary demo mode for testing new toast features
  const isDemoMode = process.env.NODE_ENV === "development";

  if (isDemoMode) {
    return <AnimatedPageExample />;
  }

  return <Navigate to="/login" />;
}
