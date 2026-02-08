"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import LogoutButton from "./ui/logout";
import { clientMenu } from "@/lib/layoutMenus";
import * as LucideIcons from "lucide-react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { ModeToggle } from "./ModeToggle";
import { useAuth } from "@/hooks/useAuth";
// Menu items.

interface AppSidebarProps {
  hide?: boolean;
  items: {
    title: string;
    url: string;
    icon: keyof typeof LucideIcons;
  }[];
}
export function AppSidebar({ hide, items = clientMenu }: AppSidebarProps) {
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { role, loading } = useAuth();
  return (
    <Sidebar collapsible="icon" className="flex flex-col h-full">
      <SidebarContent className="flex flex-col h-full">
        {/* TOP MENU ITEMS */}
        <SidebarGroup>
          <SidebarGroupLabel>Sidebar</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const IconComponent = LucideIcons[item.icon] as LucideIcon;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url} className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* BOTTOM SECTION */}
        <div className="mt-auto flex flex-col items-center  ">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* MODE TOGGLE */}
                <SidebarMenuButton asChild>
                  <ModeToggle variant="ghost" showText={!isCollapsed} />
                </SidebarMenuButton>

                {/* LOGOUT / LOGIN */}
                <SidebarMenuButton asChild>
                  {role ? (
                    <LogoutButton showText={!isCollapsed} />
                  ) : (
                    <Link href="/login" className="flex items-center gap-3 ">
                      <LucideIcons.LogIn className="size-4" />
                      {!isCollapsed && <span>Sign In</span>}
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
