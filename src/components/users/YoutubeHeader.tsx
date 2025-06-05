"use client";

import { Search, Menu, Mic, Video, Bell, User, MoonStar, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export function YouTubeHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-x-4">
          <Button variant="ghost" size="icon" className="mr-2">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <span className="text-xl font-bold text-red-600">YouTube</span>
          </div>
        </div>
        
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="flex w-full max-w-2xl items-center">
            <div className="relative flex-1">
              <Input
                placeholder="Search"
                className="pr-10 border-r-0 rounded-r-none h-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <Button 
              variant="outline" 
              className="h-10 rounded-l-none border-l-0 px-4"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="ml-2">
              <Mic className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="mr-2"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <MoonStar className="h-5 w-5" />
            )}
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}