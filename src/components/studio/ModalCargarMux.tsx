"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/navigation";

interface UploadResponse {
  uploadId: string;
  uploadUrl: string;
}


export function ModalCargarMux() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const createVideoMutation = trpc.video.create.useMutation({
    onSuccess: (data) => {
      console.log("Video created:", data);
      setIsOpen(false);
      router.push(`/studio/videos/${data.video.id}`);
    },
    onError: (error) => {
      console.error("Error creating video:", error);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;

    setIsUploading(true);

    try {
      // Step 1: Create upload URL
      const uploadResponse = await fetch("/api/mux/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
        }),
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to create upload URL");
      }

      const uploadData: UploadResponse = await uploadResponse.json();

      // Step 2: Upload file to Mux
      const uploadToMux = await fetch(uploadData.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadToMux.ok) {
        throw new Error("Failed to upload file to Mux");
      }

      // Step 3: Create asset
      const assetResponse = await fetch("/api/mux/create-asset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uploadId: uploadData.uploadId,
        }),
      });

      if (!assetResponse.ok) {
        throw new Error("Failed to create asset");
      }

      
      // Step 4: Create video in database
      createVideoMutation.mutate();
    } catch (error) {
      console.error("Upload error:", error);
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
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="file">Archivo de video</Label>
            <Input
              id="file"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              required
            />
          </div>
          <Button type="submit" disabled={isUploading || !file}>
            {isUploading ? "Subiendo..." : "Subir Video"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}