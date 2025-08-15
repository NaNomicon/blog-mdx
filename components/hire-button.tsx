'use client'

import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { BriefcaseBusiness, Mail } from "lucide-react";
import { SiBitcoin, SiEthereum, SiFreelancer, SiMastercard, SiTelegram, SiVisa } from "@icons-pack/react-simple-icons";
import { toast } from "sonner";

export default function HireButton() {
    return (<div className={cn("", "")}>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button >
                    <BriefcaseBusiness className="mr-2" />
                    Hire me?
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex flex-col">
                <DropdownMenuGroup className="flex flex-col">
                    <DropdownMenuLabel className="flex flex-row mx-auto gap-2">
                        <SiVisa className="w-4" />
                        <SiMastercard className="w-4" />
                    </DropdownMenuLabel>
                    <DropdownMenuItem className="flex items-center gap-2" onSelect={() => { 
                        window.open("https://www.freelancer.com/u/Linkmez", "_blank");
                    }}>
                        <SiFreelancer />
                        Freelancer
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuGroup className="flex flex-col" >
                    <DropdownMenuLabel className="flex flex-row mx-auto gap-2">
                        <SiBitcoin className="w-4" />
                        <SiEthereum className="w-4" />
                    </DropdownMenuLabel>
                    <DropdownMenuItem className="flex items-center gap-2" onSelect={() => {
                        window.open("https://t.me/NaNomicon", "_blank");
                    }}>
                        <SiTelegram />
                        Telegram
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2" onSelect={() => {
                        navigator.clipboard.writeText("lecongnhan29@gmail.com");
                        toast.info("My email has been copied to your clipboard!");
                    }}>
                        <Mail />
                        Email
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>);
}
