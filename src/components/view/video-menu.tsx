import { DropdownMenu, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { MoreVerticalIcon } from "lucide-react";

export default function VideoMenu() {
return (
    <DropdownMenu>
        <DropdownMenuTrigger>
            <MoreVerticalIcon/>
        </DropdownMenuTrigger>
    </DropdownMenu>
)}