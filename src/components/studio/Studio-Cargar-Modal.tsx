import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { Button } from "../ui/button";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { ResponsiveModal } from "./Responsive-modal";
import { StudioUploader } from "./StudioUploader";

export const StudioCargarModal = () => {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const createVideo = trpc.video.create.useMutation({
    onSuccess: () => {
      toast.success("Video creado correctamente");
      utils.video.getMany.invalidate();
      setOpen(false);
    },
    onError: () => {
      toast.error("Ocurrió un error");
    },
  });

  return (
    <>
      <ResponsiveModal open={open} onOpenChange={setOpen} title="Cargar video">
        <Button
          variant="secondary"
          onClick={() => createVideo.mutate()}
          disabled={createVideo.isPending}
        >
            {createVideo.data?.uploadUrl ? <StudioUploader endpoint={createVideo.data.uploadUrl} onsuccess={() => {}}/> : <Loader2Icon/>}
       
          <span className="ml-2">Crear video</span>
        </Button>
      </ResponsiveModal>
    </>
  )
}
