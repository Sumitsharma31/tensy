"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { type GameMode } from "./types"

interface GameModeTabsProps {
    value: GameMode
    onValueChange: (value: GameMode) => void
    className?: string
    disabled?: boolean
}

export function GameModeTabs({ value, onValueChange, className, disabled }: GameModeTabsProps) {
    return (
        <Tabs
            value={value}
            onValueChange={(v) => onValueChange(v as GameMode)}
            className={cn("gap-0", className)}
            aria-disabled={disabled}
        >
            <TabsList
                className={cn(
                    "grid w-full grid-cols-2 gap-0",
                    disabled && "pointer-events-none opacity-60",
                )}
            >
                <TabsTrigger
                    value="sentence"
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                >
                    Sentence
                </TabsTrigger>
                <TabsTrigger
                    value="category"
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                >
                    Category
                </TabsTrigger>
            </TabsList>
        </Tabs>
    )
}
