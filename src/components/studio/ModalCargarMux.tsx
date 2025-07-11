"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/navigation";
import MuxUploader from "@mux/mux-uploader-react";

interface UploadResponse {
  uploadUrl: string;
  uploadId: string;
}

export function ModalCargarMux() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [uploadUrl, setUploadUrl] = useState<string>("");
  const [uploadId, setUploadId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const createVideoMutation = trpc.video.createVideo.useMutation({
    onSuccess: (data) => {
      console.log("Video created:", data);
      setIsOpen(false);
      router.push(`/studio/videos/${data.video.id}`);
    },
    onError: (error) => {
      console.error("Error creating video:", error);
    },
  });

  // Get upload URL when modal opens
  useEffect(() => {
    if (isOpen && !uploadUrl) {
      getUploadUrl();
    }
  }, [isOpen]);

  const getUploadUrl = async () => {
    setIsLoading(true);
    try {
      console.log("🔄 Getting upload URL...");
      const response = await fetch("/api/mux/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: "video.mp4", // Default name, will be overridden
          fileSize: 0, // Will be set by MuxUploader
        }),
      });

      console.log("📡 Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Response error:", errorText);
        throw new Error("Failed to get upload URL");
      }

      const data: UploadResponse = await response.json();
      console.log("✅ Upload data received:", data);
      setUploadUrl(data.uploadUrl);
      setUploadId(data.uploadId);
    } catch (error) {
      console.error("❌ Error getting upload URL:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadComplete = async () => {
    setIsUploading(true);
    try {
      // Create video in database - Mux will create the asset automatically
      createVideoMutation.mutate({
        title,
        description,
        visibility,
        muxUploadId: uploadId,
      });
    } catch (error) {
      console.error("Error creating video:", error);
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Subir Video</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Subir Video</DialogTitle>
        </DialogHeader>
        <form className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del video"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del video"
            />
          </div>
          <div>
            <Label htmlFor="visibility">Visibilidad</Label>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Público</SelectItem>
                <SelectItem value="private">Privado</SelectItem>
                <SelectItem value="unlisted">No listado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Archivo de video</Label>
            {isLoading ? (
              <div className="p-4 text-center">Cargando uploader...</div>
            ) : uploadUrl ? (
              <MuxUploader
                endpoint={uploadUrl}
                onSuccess={handleUploadComplete}
              />
            ) : (
              <div className="p-4 text-center text-red-500">Error al cargar el uploader</div>
            )}
          </div>
          {isUploading && (
            <div className="text-center text-sm text-muted-foreground">
              Subiendo video...
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}