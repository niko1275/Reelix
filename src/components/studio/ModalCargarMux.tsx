'use client';

import MuxUploader from '@mux/mux-uploader-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ModalCargarMuxProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalCargarMux({ isOpen, onClose }: ModalCargarMuxProps) {
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetch('/api/mux/upload')
        .then(res => res.json())
        .then(data => {
          if (data.url) {
            setUploadUrl(data.url);
          }
        })
        .catch(error => {
          console.error('Error al obtener la URL de upload:', error);
        });
    }
  }, [isOpen]);

  const handleUploadSuccess = () => {
    setIsUploading(false);
    onClose();
    router.refresh(); // Refrescar la página para mostrar el nuevo video
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 ">Cargar Video</h2>
        {uploadUrl && (
          <MuxUploader 
            endpoint={uploadUrl}
            onUploadStart={() => setIsUploading(true)}
            onSuccess={handleUploadSuccess}
          />
        )}
        <div className="flex justify-end space-x-2 mt-4">
          <button 
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            {isUploading ? 'Subiendo...' : 'Cancelar'}
          </button>
        </div>
      </div>
    </div>
  );
}