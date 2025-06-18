"use client";

import { playlists } from '@/data/playlists';
import PlaylistGrid from './PlaylistGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, Music, PlayCircle } from 'lucide-react';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import PlaylistHeader from './PlaylistHeader';

export default function PlaylistView() {
  const userPlaylists = playlists.filter(p => p.isUserCreated);
  const otherPlaylists = playlists.filter(p => !p.isUserCreated);
  
  // Find playlists with recent activity
  const recentlyPlayed = [...playlists]
    .sort((a, b) => {
      if (!a.lastPlayed) return 1;
      if (!b.lastPlayed) return -1;
      return new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime();
    })
    .slice(0, 5);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
    >
      <div className="min-h-screen bg-background">
        <PlaylistHeader />
        
        <div className="container px-4 md:px-6 mx-auto pb-12">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Tus Playlists</h1>
              <p className="text-muted-foreground">Organiza y descubre tu colección de videos</p>
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Nueva Playlist</span>
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="mt-6">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="created">Creadas por ti</TabsTrigger>
              <TabsTrigger value="recent">Reproducciones recientes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-8">
              <PlaylistGrid 
                playlists={userPlaylists} 
                title="Playlists creadas por ti" 
                description="Playlists personalizadas que has creado"
              />
              
              <PlaylistGrid 
                playlists={otherPlaylists} 
                title="Playlists para descubrir" 
                description="Playlists populares que podrían interesarte"
              />
            </TabsContent>
            
            <TabsContent value="created" className="space-y-8">
              <PlaylistGrid 
                playlists={userPlaylists} 
                title="Todas tus playlists"
                description="Playlists personalizadas que has creado"
              />
              
              <div className="mt-6 text-center py-10">
                <div className="inline-flex justify-center items-center p-8 rounded-full bg-muted/50 mb-4">
                  <PlusCircle className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">Crea una nueva playlist</h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  Organiza tus videos favoritos en una nueva colección personalizada
                </p>
                <Button className="mt-4 gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span>Nueva Playlist</span>
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="recent">
              <PlaylistGrid 
                playlists={recentlyPlayed} 
                title="Reproducidas recientemente" 
                description="Playlists que has visto recientemente"
              />
              
              <div className="mt-12 flex justify-center">
                <Button variant="outline" className="gap-2">
                  <PlayCircle className="h-4 w-4" />
                  <span>Ver historial completo</span>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ThemeProvider>
  );
}