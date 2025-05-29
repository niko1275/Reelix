import type { Metadata } from "next";
import { Providers } from "../providers";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { StudioLayoutContent } from "@/components/studio/StudioLayoutContent";

export const metadata: Metadata = {
  title: "Studio",
  description: "Studio section",
};

export default function StudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <SidebarProvider>
        <StudioLayoutContent>
          {children}
        </StudioLayoutContent>
        
      </SidebarProvider>
    </Providers>
  );
} 