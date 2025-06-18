'use client';

import MuxUploader from '@mux/mux-uploader-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

interface ModalCargarMuxProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalCargarMux({ isOpen, onClose }: ModalCargarMuxProps) {
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSelect = async (event: any) => {
    const file = event.target.files?.[0];
    console.log("file", file);
    if (!file) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/mux/upload', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.url) {
        setUploadUrl(data.url);
      }
    } catch (error) {
      console.error('Error al obtener la URL de upload:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setIsUploading(false);
    setUploadUrl(null);
    onClose();
    router.refresh();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Cargar Video</h2>
        
        <MuxUploader 
          endpoint={'/api/mux/upload'}
          onUploadStart={() => setIsUploading(true)}
          onSuccess={handleUploadSuccess}
     
          type="bar"
        />
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUploading || isLoading}
          >
            {isUploading ? 'Subiendo...' : isLoading ? 'Cargando...' : 'Cancelar'}
          </Button>
        </div>
      </div>
    </div>
  );
}