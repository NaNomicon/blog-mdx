'use client'

import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Button } from "./ui/button";
import { BriefcaseBusiness } from "lucide-react";
import { SiFreelancer, SiTelegram } from "@icons-pack/react-simple-icons";
import { SiLinkedin } from "react-icons/si";
import { IoMail } from "react-icons/io5";
import { toast } from "sonner";
import { usePathname } from "next/dist/client/components/navigation";

export default function HireButton() {
    const pathname = usePathname();
    
    return (<div className={cn("", "")}>
        <Tooltip>
            <TooltipTrigger asChild>
                <div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative group hover:bg-primary/10 hover:text-primary transition-all duration-300">
                                <BriefcaseBusiness className="h-[1.2rem] w-[1.2rem] transition-all duration-300 group-hover:rotate-12" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background border border-border/50 shadow-lg flex flex-col">
                            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer transition-all duration-300 hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary" onSelect={() => { 
                                window.open("https://www.freelancer.com/u/Linkmez", "_blank");
                            }} data-umami-event="clicked_freelancer" data-umami-event-path={pathname}>
                                <SiFreelancer className="w-4 h-4" />
                                Freelancer
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer transition-all duration-300 hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary" onSelect={() => {
                                window.open("https://www.linkedin.com/in/NaNomicon", "_blank");
                            }} data-umami-event="clicked_linkedin" data-umami-event-path={pathname}>
                                <SiLinkedin className="w-4 h-4" />
                                LinkedIn
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer transition-all duration-300 hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary" onSelect={() => {
                                window.open("https://t.me/NaNomicon", "_blank");
                            }} data-umami-event="clicked_telegram" data-umami-event-path={pathname}>
                                <SiTelegram className="w-4 h-4" />
                                Telegram
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer transition-all duration-300 hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary" onSelect={() => {
                                navigator.clipboard.writeText("lecongnhan29@gmail.com");
                                toast.info("My email has been copied to your clipboard!");
                            }} data-umami-event="clicked_email" data-umami-event-path={pathname}>
                                <IoMail className="w-4 h-4" />
                                Email
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p>Hire me</p>
            </TooltipContent>
        </Tooltip>
    </div>);
}
