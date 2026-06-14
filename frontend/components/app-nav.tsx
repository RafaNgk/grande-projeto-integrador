"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Bell,
  History,
  Sprout,
  Menu,
  Leaf,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useAlerts } from "@/lib/hooks"

const navItems = [
  { href: "/", label: "Principal", icon: LayoutDashboard },
  { href: "/alertas", label: "Alertas", icon: Bell },
  { href: "/historico", label: "Histórico", icon: History },
  { href: "/canteiros", label: "Canteiros", icon: Leaf },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { data: alerts } = useAlerts()
  const activeAlerts = alerts?.filter((a) => !a.acknowledged && a.type !== "info").length ?? 0

  return (
    <nav className="flex flex-col gap-1" aria-label="Navegação principal">
      {navItems.map((item) => {
        const active = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
            {item.href === "/alertas" && activeAlerts > 0 && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-semibold text-destructive-foreground">
                {activeAlerts}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
        <Sprout className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold leading-tight">HortaMonitor</p>
        <p className="text-xs text-muted-foreground leading-tight">Monitoramento IoT</p>
      </div>
    </div>
  )
}

export function AppNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-60 flex-col border-r border-border bg-sidebar">
        <div className="flex h-16 items-center border-b border-border">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavLinks />
        </div>
        <div className="border-t border-border p-4 text-xs text-muted-foreground">
          <p>HortaMonitor v1.0</p>
          <p>Agricultura inteligente</p>
        </div>
      </aside>

      {/* Topbar mobile */}
      <header className="lg:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur">
        <Brand />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Abrir menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-sidebar p-0">
            <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
            <div className="flex h-16 items-center border-b border-border">
              <Brand />
            </div>
            <div className="p-3">
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </header>
    </>
  )
}
