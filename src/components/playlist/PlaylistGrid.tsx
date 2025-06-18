"use client";

import { Playlist } from '@/types/playlist';
import PlaylistCard from './PlaylistCard';
import { useState } from 'react';
import { Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { playlistGetUserPlaylistsAndVideosPlaylistsOutput } from '@/modules/videos/types';

interface PlaylistGridProps {
  playlists: playlistGetUserPlaylistsAndVideosPlaylistsOutput[];
  title: string;
  description?: string;
  className?: string;
}

export default function PlaylistGrid({ playlists, title, description, className }: PlaylistGridProps) {
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'count'>('recent');

  const getSortedPlaylists = () => {
    switch (sortBy) {
      case 'recent':
        return [...playlists].sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      case 'name':
        return [...playlists].sort((a, b) => 
          a.name.localeCompare(b.name)
        );
      case 'count':
        return [...playlists].sort((a, b) => 
          (b.videos?.length || 0) - (a.videos?.length || 0)
        );
      default:
        return playlists;
    }
  };

  const sortedPlaylists = getSortedPlaylists();
  
  return (
    <section className={cn("py-6", className)}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm flex gap-3">
            <button 
              onClick={() => setSortBy('recent')}
              className={cn(
                "transition-colors hover:text-foreground",
                sortBy === 'recent' ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              Recientes
            </button>
            <button 
              onClick={() => setSortBy('name')}
              className={cn(
                "transition-colors hover:text-foreground",
                sortBy === 'name' ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              A-Z
            </button>
            <button 
              onClick={() => setSortBy('count')}
              className={cn(
                "transition-colors hover:text-foreground",
                sortBy === 'count' ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              Cantidad
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {sortedPlaylists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </div>
    </section>
  );
}