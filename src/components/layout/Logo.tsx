import { Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    iconClassName?: string;
    showText?: boolean;
}

export function Logo({ className, iconClassName, showText = true }: LogoProps) {
    return (
        <div className={cn("flex items-center gap-2 select-none", className)}>
            <div className={cn("flex items-center justify-center p-1.5 rounded-lg bg-accent text-white", iconClassName)}>
                <Rocket className="h-5 w-5 fill-current" />
            </div>
            {showText && (
                <div className="flex flex-col">
                    <span className="font-serif text-xl font-bold leading-none tracking-tight text-foreground">
                        Startup<span className="text-accent">Saga</span>
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium leading-none mt-0.5">
                        .in
                    </span>
                </div>
            )}
        </div>
    );
}
