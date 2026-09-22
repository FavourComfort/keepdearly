import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Icon } from "./Icon";

const navLinkBase =
  "rounded-full px-4 py-1 text-label-md transition-all text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low";
const navLinkActive = "bg-surface-container-high text-on-surface font-medium";

function Logo() {
  return (
    <svg viewBox="0 0 120 120" className="h-8 w-8 rounded-full" fill="none" aria-hidden>
      <rect width="120" height="120" rx="32" fill="#FAF6F0" />
      <path
        d="M40 38C40 33.5817 43.5817 30 48 30H72C76.4183 30 80 33.5817 80 38V88L60 74L40 88V38Z"
        fill="#F4EAE2"
        stroke="#D98E82"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M52 48C52 44.5 54.5 42 57.5 42C59.2 42 60 43.2 60 43.2C60 43.2 60.8 42 62.5 42C65.5 42 68 44.5 68 48C68 53.5 60 59 60 59C60 59 52 53.5 52 48Z"
        fill="#D98E82"
        opacity="0.9"
      />
      <circle cx="60" cy="67" r="1.5" fill="#B07167" />
    </svg>
  );
}

function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-surface/90 px-4 py-2 shadow-[0_-2px_12px_rgba(0,0,0,0.03)] backdrop-blur-xl md:hidden">
      <Link
        to="/"
        activeOptions={{ exact: true }}
        activeProps={{ className: "text-primary" }}
        inactiveProps={{ className: "text-on-surface-variant" }}
        className="flex flex-col items-center gap-0.5 transition-colors"
      >
        <Icon name="cottage" className="text-[20px]" />
        <span className="text-label-sm lowercase">home</span>
      </Link>
      <Link
        to="/capture"
        className="flex flex-col items-center gap-0.5 rounded-full bg-primary-container px-4 py-1 text-on-primary-container shadow-sm transition-transform active:scale-95"
      >
        <Icon name="favorite" className="text-[20px]" />
        <span className="text-label-sm font-semibold lowercase">keep</span>
      </Link>
      <Link
        to="/reminders"
        activeProps={{ className: "text-primary" }}
        inactiveProps={{ className: "text-on-surface-variant" }}
        className="flex flex-col items-center gap-0.5 transition-colors"
      >
        <Icon name="calendar_today" className="text-[20px]" />
        <span className="text-label-sm lowercase">reminders</span>
      </Link>
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <header className="fixed left-0 right-0 top-0 z-50 bg-surface/90 shadow-[0_1px_8px_rgba(0,0,0,0.03)] backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-3xl items-center justify-between gap-4 px-4">
          <Link to="/" className="group flex items-center gap-2">
            <span className="transition-transform group-hover:scale-105">
              <Logo />
            </span>
            <span className="flex flex-col">
              <span className="text-headline-md lowercase leading-none tracking-tight text-primary">
                keepdearly
              </span>
              <span className="mt-0.5 hidden text-body-sm leading-tight text-on-surface-variant sm:inline-block">
                the little things that actually matter
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              className={navLinkBase}
              activeProps={{ className: navLinkActive }}
            >
              Home
            </Link>
            <Link to="/capture" className={navLinkBase} activeProps={{ className: navLinkActive }}>
              Keep a Memory
            </Link>
            <Link
              to="/reminders"
              className={navLinkBase}
              activeProps={{ className: navLinkActive }}
            >
              Reminders
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/capture"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-sm transition-all active:scale-95 md:hidden"
              aria-label="Keep a memory"
            >
              <Icon name="add" className="text-[18px]" />
            </Link>
            <div className="flex items-center gap-2 pl-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-fixed text-title-sm text-primary">
                F
              </span>
              <span className="hidden text-label-md font-medium text-on-surface sm:inline">
                Favour
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full bg-surface pb-24 pt-20 md:pb-16">
        <div className="mx-auto min-h-[calc(100vh-14rem)] max-w-3xl px-4">{children}</div>
      </main>

      <BottomNavigation />

      <footer className="mt-14 w-full bg-surface-container-low py-9 pb-28 md:pb-9">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:text-left">
          <div className="flex flex-col gap-1">
            <span className="text-headline-sm lowercase text-primary">keepdearly</span>
            <p className="text-body-sm text-on-surface-variant">
              A quiet sanctuary for beloved memories and small tokens of tenderness.
            </p>
          </div>
          <span className="text-label-sm text-on-surface-variant">
            © 2026 keepdearly. Gentle &amp; discreet.
          </span>
        </div>
      </footer>
    </div>
  );
}
