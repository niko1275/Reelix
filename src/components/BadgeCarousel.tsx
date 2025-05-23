"use client"

import * as React from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const badges = [
  { id: 1, name: "React", variant: "default" },
  { id: 2, name: "TypeScript", variant: "secondary" },
  { id: 3, name: "Next.js", variant: "destructive" },
  { id: 4, name: "Node.js", variant: "outline" },
  { id: 5, name: "Tailwind", variant: "default" },
  { id: 6, name: "tRPC", variant: "secondary" },
  { id: 7, name: "Prisma", variant: "destructive" },
  { id: 8, name: "PostgreSQL", variant: "outline" },
]

export function BadgeCarousel() {
  return (
    <div className="w-full max-w-sm mx-auto">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {badges.map((badge) => (
            <CarouselItem key={badge.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card>
                  <CardContent className="flex items-center justify-center p-6">
                    <Badge variant={badge.variant as any} className="text-lg">
                      {badge.name}
                    </Badge>
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