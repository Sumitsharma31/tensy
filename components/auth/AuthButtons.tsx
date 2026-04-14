'use client'

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { LogIn, User } from 'lucide-react'

export function AuthButtons() {
    return (
        <>
            <SignedOut>
                <SignInButton mode="modal">
                    <Button variant="default" size="sm" className="gap-2">
                        <LogIn className="h-4 w-4" />
                        <span className="hidden sm:inline">Sign In</span>
                    </Button>
                </SignInButton>
            </SignedOut>

            <SignedIn>
                <UserButton
                    appearance={{
                        elements: {
                            avatarBox: 'w-8 h-8'
                        }
                    }}
                    afterSignOutUrl="/"
                    userProfileMode="navigation"
                    userProfileUrl="/profile"
                >
                    <UserButton.MenuItems>
                        <UserButton.Link
                            label="Profile"
                            labelIcon={<User className="h-4 w-4" />}
                            href="/profile"
                        />
                    </UserButton.MenuItems>
                </UserButton>
            </SignedIn>
        </>
    )
}
