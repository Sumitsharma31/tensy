'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@clerk/nextjs'
import { Volume2 } from 'lucide-react'
import { VoiceSettingsDialog } from './voice-settings-dialog'

export function VoiceSettingsButton() {
    const [dialogOpen, setDialogOpen] = useState(false)
    const { isSignedIn } = useAuth()

    if (!isSignedIn) return null

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(true)}
                className="gap-2"
            >
                <Volume2 className="w-4 h-4" />
                Voice Settings
            </Button>
            <VoiceSettingsDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        </>
    )
}
