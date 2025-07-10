'use client';

import MuxUploader from '@mux/mux-uploader-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ModalCargarMuxProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalCargarMux({ isOpen, onClose }: ModalCargarMuxProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [muxUploadUrl, setMuxUploadUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Cerrar modal con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Obtener la URL de upload cuando se abre el modal
  useEffect(() => {
    if (isOpen && !muxUploadUrl) {
      fetchUploadUrl();
    }
  }, [isOpen, muxUploadUrl]);

  const fetchUploadUrl = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/mux/upload', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      console.log('📋 Respuesta del endpoint de upload:', data);
      
      if (data.url) {
        setMuxUploadUrl(data.url);
        setUploadId(data.uploadId || data.id);
      } else {
        console.error('❌ No se recibió URL de upload');
        setProcessingStatus('Error al obtener URL de upload');
      }
    } catch (error) {
      console.error('Error obteniendo URL de upload:', error);
      setProcessingStatus('Error al obtener URL de upload');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadStart = () => {
    console.log('🚀 Upload iniciado');
    setIsUploading(true);
    setProcessingStatus('Subiendo archivo...');
  };

  const handleUploadSuccess = (detail: any) => {
    console.log('✅ Upload completado:', detail);
    setIsUploading(false);
    setProcessingStatus('Procesando video...');
    
    // Iniciar polling para verificar el estado
    if (uploadId) {
      pollVideoStatus(uploadId);
    }
  };

  const handleUploadError = (error: any) => {
    console.error('❌ Error en upload:', error);
    setIsUploading(false);
    setProcessingStatus('Error al subir el archivo');
  };

  const pollVideoStatus = async (uploadId: string) => {
    const maxAttempts = 120; // 20 minutos máximo
    let attempts = 0;
    
    const poll = async () => {
      try {
        console.log('🔄 Polling intento', attempts + 1, 'para uploadId:', uploadId);
        
        // Obtener información directamente desde Mux usando el uploadId
        const response = await fetch(`/api/mux/get-asset-by-upload/${uploadId}`);
        const data = await response.json();
        
        console.log('🔄 Estado del asset desde Mux:', data);
        
        // Si hay error, puede ser que el upload aún no exista
        if (data.error) {
          console.log('⚠️ Error obteniendo asset:', data.error);
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, 3000); // Poll cada 3 segundos al inicio
            return;
          } else {
            setProcessingStatus('Error: No se pudo obtener información del video');
            return;
          }
        }
        
        // Si el asset está listo y tiene playbackId
        if (data.status === 'ready' && data.playbackId) {
          console.log('✅ Video listo con playbackId:', data.playbackId);
          setProcessingStatus('¡Video listo!');
          
          // Actualizar la base de datos con la información del asset
          await updateVideoInDatabase(uploadId, data);
          
          setTimeout(() => {
            onClose();
            router.refresh();
          }, 1000);
          return;
        }
        
        // Si hay error en el asset
        if (data.status === 'errored') {
          console.error('❌ Asset con error:', data.errors);
          setProcessingStatus('Error al procesar el video');
          return;
        }
        
        // Actualizar estado de procesamiento
        if (data.status === 'uploading') {
          setProcessingStatus('Subiendo archivo...');
        } else if (data.status === 'preparing') {
          setProcessingStatus('Preparando video...');
        } else if (data.status === 'processing') {
          setProcessingStatus('Procesando video...');
        } else if (data.message === 'Asset aún no creado') {
          setProcessingStatus('Esperando que se cree el asset...');
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // Poll cada 5 segundos
        } else {
          setProcessingStatus('Tiempo de espera agotado');
        }
      } catch (error) {
        console.error('Error polling asset status:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        } else {
          setProcessingStatus('Error al verificar estado');
        }
      }
    };
    
    poll();
  };

  const updateVideoInDatabase = async (uploadId: string, assetData: any) => {
    try {
      const response = await fetch('/api/videos/update-from-mux', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uploadId,
          assetData
        }),
      });
      
      if (response.ok) {
        console.log('✅ Video actualizado en la base de datos');
      } else {
        console.error('❌ Error actualizando video en la base de datos');
      }
    } catch (error) {
      console.error('Error actualizando video:', error);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Solo cerrar si se hace clic en el overlay, no en el contenido del modal
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Cargar Video</h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Preparando upload...</p>
          </div>
        ) : muxUploadUrl ? (
          <>
            {/* ✅ MuxUploader con la URL directa de Mux */}
            <MuxUploader
              endpoint={muxUploadUrl}
              onUploadStart={handleUploadStart}
              onSuccess={handleUploadSuccess}
              onError={handleUploadError}
              type="bar"
            />
            
            {processingStatus && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {processingStatus}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-red-600">Error al obtener URL de upload</p>
            <button 
              onClick={fetchUploadUrl}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}