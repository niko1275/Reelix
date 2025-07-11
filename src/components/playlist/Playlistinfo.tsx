import React from 'react';
import Image from 'next/image';

interface PlaylistInfoProps {
  title: string;
  channelName: string;
  channelAvatar: string;
  viewCount: number;
  createdAt: string;
}

const PlaylistInfo: React.FC<PlaylistInfoProps> = ({
  title,
  channelName,
  channelAvatar,
  viewCount,
  createdAt
}) => {
  // Format view count (e.g., 1.2M, 4.5K)
  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    }
    return `${count} views`;
  };

  return (
    <div className="p-3">
      {/* Title */}
      <h3 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white line-clamp-2 leading-tight mb-2">
        {title}
      </h3>

      {/* Channel info */}
      <div className="flex items-center gap-2 mb-1">
        <Image
          src={channelAvatar}
          alt={`${channelName} avatar`}
          width={24}
          height={24}
          className="rounded-full object-cover"
        />
        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
          {channelName}
        </span>
      </div>

      {/* Video stats */}
      <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
        <span>{formatViewCount(viewCount)}</span>
        <span className="inline-block mx-0.5">•</span>
        <span>{createdAt}</span>
      </div>
    </div>
  );
};

export default PlaylistInfo;