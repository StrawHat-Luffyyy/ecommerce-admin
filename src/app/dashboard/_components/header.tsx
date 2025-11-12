"use client";

import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();

  const routes = [
    {
      href: `/dashboard`,
      label: "Overview",
      active: pathname === `/dashboard`,
    },
    {
      href: `/dashboard/products`,
      label: "Products",
      active: pathname === `/dashboard/products`,
    },
    {
      href: `/dashboard/orders`,
      label: "Orders",
      active: pathname === `/dashboard/orders`,
    },
    {
      href: `/dashboard/products/new`,
      label: "Create-Products",
      active: pathname === `/dashboard/products/new`,
    },
  ];

  return (
    <header className="flex items-center justify-between p-4 border-b">
      {/* Left Group: Title */}
      <div>
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      </div>

      {/* Center Group: Navigation Links */}
      <nav className="flex items-center space-x-4">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              route.active
                ? "text-primary dark:text-white"
                : "text-muted-foreground"
            )}
          >
            {route.label}
          </Link>
        ))}
      </nav>

      {/* Right Group: Toggles */}
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}
