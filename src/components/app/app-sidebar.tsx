'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { BookText, Calendar, Settings, Sprout, Leaf, LayoutDashboard, Notebook, Rows3 } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/inventory', icon: Sprout, label: 'Inventory' },
  { href: '/plantings', icon: Rows3, label: 'Plantings' },
  { href: '/journal', icon: Notebook, label: 'Journal' },
  { href: '/logs', icon: BookText, label: 'Logs' },
  { href: '/schedule', icon: Calendar, label: 'Schedule' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="p-2 md:p-2 md:pr-0">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-7 w-7 text-primary" />
            <span className="font-headline text-xl font-semibold">Seed Studio</span>
          </div>
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
