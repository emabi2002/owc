import Link from "next/link";
import type { ReactNode } from "react";
import { BarChart3, Bot, Home, ShieldCheck } from "lucide-react";

export function ManagementShell({
  children,
  user,
}: {
  children: ReactNode;
  user: { name: string; email: string; demo: boolean };
}) {
  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div>
            <div className="flex items-center gap-2 font-serif text-xl font-bold text-primary">
              <ShieldCheck className="h-5 w-5 text-gold" /> OWC Management / Executive
            </div>
            <p className="text-xs text-muted-foreground">Protected management reporting workspace</p>
          </div>
          <div className="text-right text-sm">
            <div className="font-semibold">{user.name}</div>
            <div className="text-xs text-muted-foreground">{user.email}{user.demo ? " · Demonstration" : ""}</div>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 md:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-xl border bg-card p-3">
          <nav className="space-y-1 text-sm">
            <Link href="/management" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-secondary">
              <Home className="h-4 w-4" /> Executive dashboard
            </Link>
            <Link href="/management/reports" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-secondary">
              <BarChart3 className="h-4 w-4" /> Reports
            </Link>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground">
              <Bot className="h-4 w-4" /> AI Analyst · next phase
            </div>
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
