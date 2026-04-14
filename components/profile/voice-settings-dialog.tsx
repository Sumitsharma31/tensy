'use client'

import { useState, useEffect } from 'react'
import { useVoiceSettings } from '@/hooks/use-voice-settings'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Volume2, Loader2, Save, Play } from 'lucide-react'

interface VoiceSettingsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function VoiceSettingsDialog({ open, onOpenChange }: VoiceSettingsDialogProps) {
    const {
        voiceSettings,
        updateVoiceSettings,
        playDemo,
        isPlaying,
        isSaving,
        availableVoices,
    } = useVoiceSettings()

    const [localSettings, setLocalSettings] = useState(voiceSettings)

    // Sync local settings with hook when dialog opens
    useEffect(() => {
        if (open) {
            setLocalSettings(voiceSettings)
        }
    }, [open, voiceSettings])

    const handleSave = () => {
        updateVoiceSettings(localSettings)
        onOpenChange(false)
    }

    const handleDemo = () => {
        const demoText = "Hello! This is how I sound. I will help you learn English grammar."
        playDemo(demoText, localSettings.voice, localSettings.speed, localSettings.pitch)
    }

    // Group voices by language for better display
    const groupedVoices = availableVoices.reduce((acc, voice) => {
        const lang = voice.lang.split('-')[0] // Get language code (en, es, fr, etc.)
        if (!acc[lang]) acc[lang] = []
        acc[lang].push(voice)
        return acc
    }, {} as Record<string, SpeechSynthesisVoice[]>)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Volume2 className="w-5 h-5" />
                        Voice Settings
                    </DialogTitle>
                    <DialogDescription>
                        Customize how AI responses are read aloud to you.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Voice Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="voice">Voice</Label>
                        <div className="flex gap-2">
                            <Select
                                value={localSettings.voice}
                                onValueChange={(value) =>
                                    setLocalSettings({ ...localSettings, voice: value })
                                }
                            >
                                <SelectTrigger id="voice" className="flex-1">
                                    <SelectValue placeholder="Select a voice" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    {Object.entries(groupedVoices).map(([lang, voices]) => (
                                        voices.map((voice) => (
                                            <SelectItem key={voice.name} value={voice.name}>
                                                {voice.name} {voice.localService ? '(Local)' : ''}
                                            </SelectItem>
                                        ))
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleDemo}
                                disabled={isPlaying}
                            >
                                {isPlaying ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Play className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Preview the voice with the play button
                        </p>
                    </div>

                    {/* Speed Control */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="speed">Speed</Label>
                            <span className="text-sm text-muted-foreground">
                                {localSettings.speed.toFixed(2)}x
                            </span>
                        </div>
                        <Slider
                            id="speed"
                            min={0.25}
                            max={4.0}
                            step={0.25}
                            value={[localSettings.speed]}
                            onValueChange={([value]) =>
                                setLocalSettings({ ...localSettings, speed: value })
                            }
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Slow (0.25x)</span>
                            <span>Normal (1.0x)</span>
                            <span>Fast (4.0x)</span>
                        </div>
                    </div>

                    {/* Pitch Control */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="pitch">Pitch</Label>
                            <span className="text-sm text-muted-foreground">
                                {localSettings.pitch.toFixed(2)}
                            </span>
                        </div>
                        <Slider
                            id="pitch"
                            min={0.5}
                            max={2.0}
                            step={0.1}
                            value={[localSettings.pitch]}
                            onValueChange={([value]) =>
                                setLocalSettings({ ...localSettings, pitch: value })
                            }
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Low (0.5)</span>
                            <span>Normal (1.0)</span>
                            <span>High (2.0)</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
