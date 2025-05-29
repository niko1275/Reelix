import Image from "next/image";

interface videoThumbnailProps {
    imageUrl: string;
}

export default function VideoThumbnail({imageUrl}: videoThumbnailProps) {
    return(
        <div className="relative ">
            <div className="relative w-full overflow-hidden rounded-xl aspect-video">
                <Image src={imageUrl} alt="Video Thumbnail" fill className="object-cover" />
            </div>
        </div>
    )}