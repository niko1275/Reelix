

import FormSectionVideo from "@/components/studio/Form-Section";
import { HydrateClient } from "@/server/server";

export default function VideoPage({ params: { id } }: { params: { id: string } }) {
    return (
      <div>
       <HydrateClient>
            <FormSectionVideo videoId={id} />
       </HydrateClient>
      </div>
    );
  }
  