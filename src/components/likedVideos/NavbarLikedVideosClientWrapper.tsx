"use client";
import { useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { NavbarLikedVideos } from "./likeVideosSection";

export default function NavbarLikedVideosClientWrapper() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { isSignedIn } = useUser();
  const { isLoaded, userId } = useAuth();
  // Puedes obtener el número de videos filtrados desde un contexto global si lo necesitas
  const filteredVideosLength = 0;

  return (
    <NavbarLikedVideos
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      viewMode={viewMode}
      setViewMode={setViewMode}
      filteredVideosLength={filteredVideosLength}
      isLoaded={!!isLoaded}
      isSignedIn={!!isSignedIn}
      userId={userId}
    />
  );
} 