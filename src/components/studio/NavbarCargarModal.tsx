import { useState } from "react";
import { Button } from "../ui/button";
import { ResponsiveModal } from "./Responsive-modal";
import { StudioUploader } from "./StudioUploader";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

export function NavbarCargarModal() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const utils = trpc.useUtils();

    const createVideo = trpc.video.create.useMutation({
        onSuccess: () => {
            toast.success("Video creado correctamente");
            utils.video.getMany.invalidate();
        },
        onError: () => {
            toast.error("Ocurrió un error al crear el video");
        },
    });

    const handleUploadSuccess = () => {
        toast.success("Video subido correctamente");
        setSelectedFile(null);
        utils.video.getMany.invalidate();
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            // Creamos el video solo cuando se selecciona un archivo
            createVideo.mutate();
        }
    };

    return (
        <div>
            <Button onClick={() => setIsOpen(true)} className="bg-black/20 text-black font-bold">+Cargar</Button>
            <ResponsiveModal 
                open={isOpen} 
                onOpenChange={setIsOpen}
                title="Cargar Contenido"
            >
                {!createVideo.data?.uploadUrl && !createVideo.isPending && (
                    <div className="p-8 text-center">
                        <div className="mb-6">
                            <label 
                                htmlFor="video-upload" 
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                    <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">Haz clic para seleccionar</span> o arrastra y suelta
                                    </p>
                                    <p className="text-xs text-gray-500">MP4, MOV o AVI (MAX. 100MB)</p>
                                </div>
                                <input 
                                    id="video-upload" 
                                    type="file" 
                                    className="hidden" 
                                    accept="video/*"
                                    onChange={handleFileSelect}
                                />
                            </label>
                        </div>

                        {selectedFile && (
                            <div className="mb-6">
                                <p className="text-sm text-gray-600">
                                    Archivo seleccionado: {selectedFile.name}
                                </p>
                            </div>
                        )}
                    </div>
                )}
                
                {createVideo.isPending && (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                )}

                {createVideo.data?.uploadUrl && (
                    <StudioUploader 
                        endpoint={createVideo.data.uploadUrl} 
                        onsuccess={handleUploadSuccess}
                    />
                )}

                {createVideo.isError && (
                    <div className="p-4 text-center text-gray-500">
                        Error al crear el video. Por favor, intente nuevamente.
                    </div>
                )}
            </ResponsiveModal>
        </div>
    );
}
