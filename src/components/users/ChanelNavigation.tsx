"use client"
import { cn } from "@/lib/utils";

interface Tab {
  name: string;
  isActive: boolean;
}

interface ChannelNavigationProps {
  tabs: Tab[];
  className?: string;
}

export function ChanelNavigation({ tabs, className }: ChannelNavigationProps) {
  return (
    <div className={cn("border-b", className)}>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex space-x-4 px-6 py-2">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              className={cn(
                "whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors relative",
                tab.isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.name}
              {tab.isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}