"use client";

import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

function getInitials(displayName?: string) {
  if (!displayName) {
    return "";
  }

  return displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Navbar() {
  const { user, isLoading } = useAuth();
  const initials = getInitials(user?.displayName);

  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      {/* LEFT: logo + menu */}
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="flex size-10 items-center justify-center rounded-full bg-white p-1 md:size-12 lg:size-14"
        >
          <Image
            src="/logo.png"
            alt="Diego Raudales Logo"
            width={64}
            height={64}
            className="size-full object-contain"
            priority
          />
        </Link>

        <NavigationMenu>
          <NavigationMenuList>
            {/* Home */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="/">Home</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* About me */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="/about">About me</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Projects — dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>Projects</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[240px] gap-1 p-2">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="/projects/bluhorizon" className="block rounded-md p-2 hover:bg-accent">BluHorizon AI</Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="/projects/segway" className="block rounded-md p-2 hover:bg-accent">Segway</Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="/projects/boggle" className="block rounded-md p-2 hover:bg-accent">Boggle Buddies</Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="/projects/bricked-up-collector" className="block rounded-md p-2 hover:bg-accent">Bricked Up Collector</Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="/projects/risc-v-cpu" className="block rounded-md p-2 hover:bg-accent">RISC-V CPU</Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="/projects/qoi-parallelism" className="block rounded-md p-2 hover:bg-accent">QOI Parallelism</Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="/projects/calorie-cart" className="block rounded-md p-2 hover:bg-accent">Calorie Cart</Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="/projects/ai-lab" className="block rounded-md p-2 hover:bg-accent">AI-LAB</Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Contact me */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="/contact">Contact me</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Games */}
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="/games">Games</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* RIGHT: authentication */}
      <div className="flex items-center gap-3">
        <Button variant="outline" asChild>
          <Link href={user ? "/account" : "/login"}>
            {isLoading ? "Loading…" : user ? "Account" : "Login"}
          </Link>
        </Button>
        <Avatar>
          <AvatarImage src={user?.profileImageUrl ?? ""} alt={user?.displayName ?? ""} />
          <AvatarFallback>
            {initials || <User className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
