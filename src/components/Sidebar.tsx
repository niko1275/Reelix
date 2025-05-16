import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Home, 
  Compass, 
  Library, 
  History, 
  Clock, 
  ThumbsUp, 
  Settings,
  HelpCircle
} from "lucide-react"

export function Sidebar() {
  return (
    <aside className="w-64 bg-background border-r h-screen fixed left-0 top-0">
      <div className="p-6">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/images/Reelix.png"
            alt="Reelix Logo"
            width={120}
            height={40}
            className="object-contain"
          />
        </Link>
      </div>
      <ScrollArea className="h-[calc(100vh-5rem)]">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Discover
            </h2>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/" className="flex items-center space-x-2">
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/explore" className="flex items-center space-x-2">
                  <Compass className="h-5 w-5" />
                  <span>Explore</span>
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/library" className="flex items-center space-x-2">
                  <Library className="h-5 w-5" />
                  <span>Library</span>
                </Link>
              </Button>
            </div>
          </div>
          <Separator />
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              History
            </h2>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/history" className="flex items-center space-x-2">
                  <History className="h-5 w-5" />
                  <span>History</span>
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/watch-later" className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Watch Later</span>
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/liked" className="flex items-center space-x-2">
                  <ThumbsUp className="h-5 w-5" />
                  <span>Liked Videos</span>
                </Link>
              </Button>
            </div>
          </div>
          <Separator />
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Settings
            </h2>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/settings" className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/help" className="flex items-center space-x-2">
                  <HelpCircle className="h-5 w-5" />
                  <span>Help</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  )
} 