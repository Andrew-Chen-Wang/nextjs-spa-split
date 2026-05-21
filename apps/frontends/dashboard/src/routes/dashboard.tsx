import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/dashboard")({
  component: DashboardHome,
})

function DashboardHome() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Welcome to your Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total Projects</p>
          <p className="mt-1 text-3xl font-bold">12</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Active Tasks</p>
          <p className="mt-1 text-3xl font-bold">34</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="mt-1 text-3xl font-bold">89</p>
        </div>
      </div>
    </div>
  )
}
