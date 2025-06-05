import Image from "next/image";
import { cn } from "@/lib/utils";

interface ChannelBannerProps {
  bannerUrl: string;
  className?: string;
}

export function ChannelBanner({ bannerUrl, className }: ChannelBannerProps) {
  return (
    <div className={cn("relative w-full h-[25vh] max-h-[250px] min-h-[120px] overflow-hidden", className)}>
      <Image
        src={bannerUrl}
        alt="Channel banner"
        fill
        priority
        className="object-cover"
      />
    </div>
  );
}