import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/comunicacoes')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/comunicacoes"!</div>
}
