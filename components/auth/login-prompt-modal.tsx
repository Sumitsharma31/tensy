"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { X, Lock, Shield, Cloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

const DISMISS_KEY = "login-prompt-dismissed"
const DISMISS_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export function LoginPromptModal() {
    const { isSignedIn, isLoaded } = useUser()
    const [isOpen, setIsOpen] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const router = useRouter()

    // Prevent hydration mismatch by only running client-side logic after mount
    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (!isMounted) return

        // Don't show if user is signed in or auth is still loading
        if (!isLoaded || isSignedIn) {
            return
        }

        // Safely check if user dismissed it recently on the client side
        try {
            const dismissedAt = localStorage.getItem(DISMISS_KEY)
            if (dismissedAt) {
                const timeSinceDismiss = Date.now() - parseInt(dismissedAt)
                if (timeSinceDismiss < DISMISS_DURATION) {
                    return // Still within cooldown period
                }
            }
        } catch (error) {
            console.error("Error accessing localStorage:", error)
        }

        // Show modal after 3 seconds
        const timer = setTimeout(() => {
            setIsOpen(true)
        }, 3000)

        return () => clearTimeout(timer)
    }, [isSignedIn, isLoaded, isMounted])

    const handleDismiss = () => {
        setIsOpen(false)
        try {
            localStorage.setItem(DISMISS_KEY, Date.now().toString())
        } catch (error) {
            console.error("Error setting localStorage:", error)
        }
    }

    const handleSignIn = () => {
        router.push("/sign-in")
        handleDismiss()
    }

    // Hydration-safe rendering
    if (!isMounted || !isLoaded || isSignedIn) {
        return null
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
            <DialogContent className="sm:max-w-md">
                <button
                    onClick={handleDismiss}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>

                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-future bg-clip-text text-transparent">
                        Unlock the Full Experience! 🚀
                    </DialogTitle>
                    <DialogDescription className="space-y-4 pt-4">
                        <p className="text-base">
                            Sign in to save your progress across all devices and never lose your achievements!
                        </p>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-start gap-3">
                                <Cloud className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-foreground">Cloud Sync</p>
                                    <p className="text-sm text-muted-foreground">
                                        Access your progress from anywhere
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-foreground">Privacy First</p>
                                    <p className="text-sm text-muted-foreground">
                                        We don't use your personal data
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Lock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-foreground">Secure & Safe</p>
                                    <p className="text-sm text-muted-foreground">
                                        Your data is encrypted and protected
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button onClick={handleSignIn} className="flex-1 bg-gradient-to-r from-primary to-future hover:opacity-90">
                                Sign In Now
                            </Button>
                            <Button onClick={handleDismiss} variant="outline" className="flex-1">
                                Maybe Later
                            </Button>
                        </div>

                        <p className="text-xs text-center text-muted-foreground pt-2">
                            You can continue using the app without signing in. Some features may be limited.
                        </p>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}
