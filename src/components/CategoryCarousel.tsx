"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { trpc } from "@/utils/trpc"
import { Suspense } from "react"

export default function CategorySection() {
  return (
   <Suspense fallback={<div>Loading categories...</div>}>
    <CategoryCarousel />
   </Suspense>
  )
}

const CategoryCarousel = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get("category")
  const [categories] = trpc.category.getAll.useSuspenseQuery()

  const handleCategoryClick = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (selectedCategory === categoryId) {
      params.delete("category")
    } else {
      params.set("category", categoryId)
    }
    router.push(`?${params.toString()}`)
  }

  const handleSearch = (searchTerm: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 flex justify-center">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full max-w-[90vw] sm:max-w-[80vw] md:max-w-[70vw]"
      >
        <CarouselContent>
          {categories.map((category) => (
            <CarouselItem key={category.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
              <div className="p-1">
                <Card 
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-accent",
                    selectedCategory === category.id.toString() && "bg-accent"
                  )}
                  onClick={() => handleCategoryClick(category.id.toString())}
                >
                  <CardContent className="flex items-center justify-center p-2 sm:p-3 md:p-4">
                    <span className={cn(
                      "text-sm sm:text-base md:text-lg font-medium text-center break-words",
                      selectedCategory === category.id.toString() && "text-foreground"
                    )}>
                      {category.name}
                    </span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </div>
  )
} 