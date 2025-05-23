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

const  CategoryCarousel =() => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get("category")
  const [categories] = trpc.category.getAll.useSuspenseQuery()

  const handleCategoryClick = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("category", slug)
    router.push(`?${params.toString()}`)
  }



  return (
    <div className="w-full">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {categories.map((category) => (
            <CarouselItem key={category.id} className="md:basis-1/4 lg:basis-1/6">
              <div className="p-1">
                <Card 
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-accent",
                    selectedCategory === category.name.toLowerCase() && "bg-accent"
                  )}
                  onClick={() => handleCategoryClick(category.name.toLowerCase())}
                >
                  <CardContent className="flex items-center justify-center p-4">
                    <span className={cn(
                      "text-lg font-medium",
                      selectedCategory === category.name.toLowerCase() && "text-foreground"
                    )}>
                      {category.name}
                    </span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
} 