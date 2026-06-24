"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { OWCLockup } from "@/components/owc-emblem";
import { MAIN_NAV, ORG } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("#")[0]);

  return (
    <header className="sticky top-0 z-50">
      {/* Tricolour accent */}
      <div className="flex h-1 w-full">
        <span className="h-full flex-1 bg-destructive" />
        <span className="h-full flex-1 bg-navy-deep" />
        <span className="h-full flex-1 bg-gold" />
      </div>

      {/* Utility bar */}
      <div className="hidden bg-navy-deep text-white/80 lg:block">
        <div className="container-gov flex h-9 items-center justify-between text-xs">
          <p className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-gold" />
            An official website of the {ORG.country}
          </p>
          <div className="flex items-center gap-5">
            <a href={`tel:${ORG.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:text-white">
              <Phone className="h-3.5 w-3.5 text-gold" /> {ORG.phone}
            </a>
            <span className="h-3 w-px bg-white/20" />
            <Link href="/about" className="hover:text-white">Accessibility</Link>
            <Link href="/contact" className="hover:text-white">Help</Link>
            <span className="h-3 w-px bg-white/20" />
            <Link
              href="/admin/login"
              className="flex items-center gap-1.5 font-medium text-gold hover:text-gold-soft"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Staff Login
            </Link>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div
        className={cn(
          "border-b border-border bg-white transition-shadow",
          scrolled && "shadow-sm"
        )}
      >
        <div className="container-gov flex h-[72px] items-center justify-between gap-4">
          <Link href="/" aria-label="OWC home" className="focus-gold rounded-md">
            <OWCLockup />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              className="hidden h-10 items-center gap-2 rounded-md border border-input px-3 text-sm text-muted-foreground transition-colors hover:border-gold hover:text-foreground md:flex"
              aria-label="Search the OWC website"
            >
              <Search className="h-4 w-4" />
              <span className="pr-6">Search…</span>
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">/</kbd>
            </button>

            <Button asChild variant="gold" className="hidden sm:inline-flex">
              <Link href="/claims#lodge">Lodge a Claim</Link>
            </Button>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[88vw] max-w-sm overflow-y-auto p-0">
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                <div className="bg-flag-diag p-5">
                  <OWCLockup variant="light" />
                </div>
                <nav className="p-3">
                  {MAIN_NAV.map((item) => (
                    <MobileNavItem
                      key={item.label}
                      item={item}
                      onNavigate={() => setMobileOpen(false)}
                    />
                  ))}
                  <div className="mt-4 grid gap-2 px-1">
                    <Button asChild variant="gold">
                      <Link href="/claims#lodge" onClick={() => setMobileOpen(false)}>
                        Lodge a Claim
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/admin/login" onClick={() => setMobileOpen(false)}>
                        Staff Login
                      </Link>
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Desktop navigation */}
      <nav className="hidden bg-primary text-white lg:block" onMouseLeave={() => setOpenMenu(null)}>
        <div className="container-gov flex items-stretch">
          <Link
            href="/"
            data-active={pathname === "/"}
            className="nav-underline flex items-center px-3 py-3.5 text-sm font-semibold text-white/90 hover:text-white"
          >
            Home
          </Link>
          {MAIN_NAV.map((item) => {
            const active = isActive(item.href);
            const hasChildren = !!item.children?.length;
            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setOpenMenu(hasChildren ? item.label : null)}
              >
                <Link
                  href={item.href}
                  data-active={active}
                  className="nav-underline flex items-center gap-1 px-3 py-3.5 text-sm font-semibold text-white/90 hover:text-white"
                >
                  {item.label}
                  {hasChildren && (
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform",
                        openMenu === item.label && "rotate-180"
                      )}
                    />
                  )}
                </Link>

                {hasChildren && openMenu === item.label && (
                  <div className="absolute left-0 top-full z-50 w-[22rem] animate-fade-up rounded-b-lg border border-t-2 border-border border-t-gold bg-white p-2 text-foreground shadow-xl">
                    {item.children!.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="group flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-secondary"
                      >
                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-gold transition-transform group-hover:translate-x-0.5" />
                        <span>
                          <span className="block text-sm font-semibold text-primary">
                            {child.label}
                          </span>
                          {child.description && (
                            <span className="block text-xs text-muted-foreground">
                              {child.description}
                            </span>
                          )}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

function MobileNavItem({
  item,
  onNavigate,
}: {
  item: NavItemType;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = !!item.children?.length;

  if (!hasChildren) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className="block rounded-md px-3 py-3 text-sm font-semibold text-primary hover:bg-secondary"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="border-b border-border/60 last:border-0">
      <div className="flex items-center">
        <Link
          href={item.href}
          onClick={onNavigate}
          className="flex-1 rounded-md px-3 py-3 text-sm font-semibold text-primary hover:bg-secondary"
        >
          {item.label}
        </Link>
        <button
          onClick={() => setOpen((o) => !o)}
          className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-secondary"
          aria-label={`Toggle ${item.label} submenu`}
        >
          {open ? <X className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>
      {open && (
        <div className="mb-2 ml-3 space-y-0.5 border-l-2 border-gold/40 pl-3">
          {item.children!.map((child) => (
            <Link
              key={child.label}
              href={child.href}
              onClick={onNavigate}
              className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

type NavItemType = (typeof MAIN_NAV)[number];
