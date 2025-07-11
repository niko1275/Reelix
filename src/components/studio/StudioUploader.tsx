import MuxUploader, { MuxUploaderDrop, MuxUploaderProgress, MuxUploaderStatus } from '@mux/mux-uploader-react'

interface StudioUploaderProps {
    endpoint: string;
    onsuccess: () => void;
}

export const StudioUploader = ({endpoint, onsuccess}: StudioUploaderProps) => {
    if (!endpoint) return null;

    return (
        <div className="w-full">
            <MuxUploader
                endpoint={endpoint}
                onSuccess={onsuccess}
                className="w-full"
            >
                <MuxUploaderDrop className="w-full h-48 border-4 border-dashed border-gray-400 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    <div className="text-center">
                        <p className="text-lg font-medium text-gray-600">Arrastra y suelta tu video aquí</p>
                        <p className="text-sm text-gray-500 mt-2">o haz clic para seleccionar</p>
                    </div>
                </MuxUploaderDrop>
                <div className="mt-4">
                    <MuxUploaderProgress className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-300" />
                    </MuxUploaderProgress>
                    <MuxUploaderStatus className="mt-2 text-sm text-gray-500" />
                </div>
            </MuxUploader>
        </div>
    )
}
