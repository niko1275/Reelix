"use client";

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';



export type Category = {
    id: string;
    name: string;
  };
  
  export const categories: Category[] = [
    { id: 'all', name: 'All' },
    { id: 'music', name: 'Music' },
    { id: 'gaming', name: 'Gaming' },
    { id: 'news', name: 'News' },
    { id: 'movies', name: 'Movies' },
    { id: 'live', name: 'Live' },
    { id: 'learning', name: 'Learning' },
    { id: 'fashion', name: 'Fashion & Beauty' },
    { id: 'sports', name: 'Sports' },
    { id: 'technology', name: 'Technology' },
    { id: 'cooking', name: 'Cooking' },
    { id: 'travel', name: 'Travel' },
    { id: 'comedy', name: 'Comedy' },
    { id: 'fitness', name: 'Fitness' },
    { id: 'podcasts', name: 'Podcasts' },
    { id: 'animation', name: 'Animation' },
    { id: 'documentaries', name: 'Documentaries' },
  ];

const CategoryCarousel = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0].id);
  const [showLeftArrow, setShowLeftArrow] = useState<boolean>(false);
  const [showRightArrow, setShowRightArrow] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  
  const checkScrollPosition = () => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
  };

  // Handle scrolling with arrows
  const handleScroll = (direction: 'left' | 'right') => {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    const targetScroll = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial check
    checkScrollPosition();

    // Add scroll event listener
    container.addEventListener('scroll', checkScrollPosition);
    
    // Add resize listener to recheck on window resize
    window.addEventListener('resize', checkScrollPosition);

    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, []);

  return (
    <div className="relative group">
      {/* Left navigation arrow */}
      {showLeftArrow && (
        <button 
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-10 h-10 bg-background/90 backdrop-blur-sm rounded-full shadow-md text-foreground hover:bg-background transition-all duration-200"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      
      {/* Shadow gradient for left scroll indicator */}
      {showLeftArrow && (
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-[1] pointer-events-none"></div>
      )}

      {/* Categories container */}
      <div 
        ref={containerRef}
        className="flex items-center overflow-x-auto scrollbar-hide py-2 px-1 -mx-1 snap-x scroll-px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              "flex-none px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium mr-2 transition-all duration-200 snap-start select-none",
              selectedCategory === category.id 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
            )}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      {/* Shadow gradient for right scroll indicator */}
      {showRightArrow && (
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-[1] pointer-events-none"></div>
      )}

      {/* Right navigation arrow */}
      {showRightArrow && (
        <button 
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-10 h-10 bg-background/90 backdrop-blur-sm rounded-full shadow-md text-foreground hover:bg-background transition-all duration-200"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
};

export default CategoryCarousel;