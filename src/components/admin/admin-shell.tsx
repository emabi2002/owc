"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FileEdit,
  ClipboardCheck,
  FileText,
  ScrollText,
  Users,
  Settings,
  Search,
  Bell,
  LogOut,
  Menu,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NationalEmblem } from "@/components/owc-emblem";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Content", href: "/admin/content", icon: FileEdit, badge: "3" },
  { label: "Approvals", href: "/admin/content#approvals", icon: ClipboardCheck },
  { label: "Claims", href: "/admin/claims", icon: FileText },
  { label: "Audit Logs", href: "/admin/audit", icon: ScrollText },
  { label: "Users & Roles", href: "/admin/users", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col bg-navy-deep text-white">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <NationalEmblem className="h-10 w-10" />
        <div className="leading-tight">
          <div className="font-serif text-sm font-bold">OWC Console</div>
          <div className="text-[10px] uppercase tracking-wide text-white/50">
            Admin &amp; CMS
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-white/40">
          Management
        </p>
        {NAV.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href.split("#")[0]);
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "border-gold bg-white/10 text-white"
                  : "border-transparent text-white/65 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  active ? "text-gold" : "text-white/50 group-hover:text-white/80"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="rounded-full bg-gold px-1.5 text-[10px] font-bold text-gold-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/65 hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" /> View public site
        </Link>
        <div className="mt-2 rounded-lg bg-white/5 p-3">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <ShieldCheck className="h-4 w-4 text-gold" />
            Secure session active
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const signOut = () => {
    toast.success("Signed out securely");
    router.push("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-secondary/40">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">
        <SidebarContent />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-white px-4 lg:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Admin navigation</SheetTitle>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="relative hidden max-w-sm flex-1 sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search content, claims, users…" className="h-9 pl-9" />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="relative grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground hover:bg-secondary" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md border border-border py-1 pl-1 pr-2 transition-colors hover:bg-secondary">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-white">
                    LA
                  </span>
                  <span className="hidden text-left sm:block">
                    <span className="block text-sm font-semibold leading-none text-foreground">L. Aila</span>
                    <span className="block text-[10px] text-muted-foreground">Administrator</span>
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  <div className="font-semibold">Lawrence Aila</div>
                  <div className="text-xs font-normal text-muted-foreground">l.aila@owc.gov.pg</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile settings</DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/users">Manage access</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-serif text-2xl font-bold text-primary">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, "default" | "secondary" | "destructive" | "success" | "warning" | "gold" | "navy"> = {
    Published: "success",
    Paid: "success",
    Approved: "success",
    Active: "success",
    "Pending Review": "warning",
    "Awaiting Documents": "warning",
    "Under Assessment": "warning",
    Scheduled: "navy",
    New: "navy",
    Invited: "secondary",
    Draft: "secondary",
    Declined: "destructive",
    Suspended: "destructive",
  };
  return <Badge variant={map[status] ?? "secondary"}>{status}</Badge>;
}
