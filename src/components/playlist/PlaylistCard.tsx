import React from 'react';
import { Play } from 'lucide-react';
import { playlistGetUserPlaylistsAndVideosPlaylistsOutput } from '@/modules/videos/types';
import PlaylistInfo from './PlaylistThumbnail';
import VideoThumbnail from '../studio/VideoThumnail';
import { cn } from '@/lib/utils';

type PlaylistItem = playlistGetUserPlaylistsAndVideosPlaylistsOutput[number];

interface PlaylistCardProps {
  playlist: PlaylistItem;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
  return (
    <div className="group w-full transition-all duration-300 hover:transform hover:translate-y-[-2px]">
      <div className="bg-white dark:bg-zinc-900 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="relative aspect-video">
          <VideoThumbnail
            imageUrl={playlist.firstVideo?.thumbnailUrl ?? ""}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
            <button className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-300 flex items-center gap-1">
              <Play size={16} fill="white" />
              <span className="text-sm font-medium">Play All</span>
            </button>
          </div>
        </div>

        <div className="p-2">
          <h3 className="font-medium text-sm line-clamp-1">
            {playlist.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {playlist.user.name} • {playlist.firstVideo ? "1 video" : "Sin videos"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlaylistCard;