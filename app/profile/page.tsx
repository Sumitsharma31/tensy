import type { Metadata } from "next"
import { currentUser, auth } from '@clerk/nextjs/server'

export const metadata: Metadata = {
  title: "Your Learner Profile - Track Grammar Progress",
  description: "View your English learning progress, daily streaks, XP, and achievements on Tense Playground. Customize your learning experience and track your goals.",
}
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Zap, Calendar, Target, Volume2 } from 'lucide-react'
import { VoiceSettingsButton } from '@/components/profile/voice-settings-button'
import {
    getUserByClerkId,
    createUser,
    getUserProgress,
    getUserStreak,
    getUserBadges
} from '@/services/database-service'

export default async function ProfilePage() {
    // Middleware already protects this route, so we can directly get the current user
    const user = await currentUser()
    const { userId } = await auth()

    // This should never happen because middleware redirects unauthenticated users
    if (!user || !userId) {
        // Redirect to sign-in if not authenticated
        redirect('/sign-in')
    }

    // Get or create user in database
    let dbUser: any = await getUserByClerkId(userId)

    if (!dbUser) {
        // Create user if doesn't exist - sync with Clerk data
        try {
            dbUser = await createUser({
                clerkId: userId,
                email: user.emailAddresses[0]?.emailAddress || '',
                username: user.username || user.firstName || undefined,
                avatarUrl: user.imageUrl || undefined,
            })
        } catch (error) {
            console.error("Error creating user/syncing:", error)
            // Fallback to allow page load even if DB sync fails
        }
    }

    // Initialize stats with defaults
    let progress: any = null
    let streak: any = null
    let badges: any[] = []

    // Fetch stats if we have a dbUser
    if (dbUser) {
        try {
            const results = await Promise.all([
                getUserProgress(dbUser.id),
                getUserStreak(dbUser.id),
                getUserBadges(dbUser.id),
            ])
            progress = results[0]
            streak = results[1]
            badges = results[2]
        } catch (error) {
            console.error("Error fetching user stats:", error)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* User Header */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            {user?.imageUrl && (
                                <img
                                    src={user.imageUrl}
                                    alt={user.firstName || 'User'}
                                    className="w-20 h-20 rounded-full border-4 border-primary/20"
                                />
                            )}
                            <div>
                                <CardTitle className="text-3xl">
                                    {user?.firstName} {user?.lastName}
                                </CardTitle>
                                <CardDescription className="text-lg">
                                    {user?.emailAddresses[0]?.emailAddress}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
                            <Zap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{progress?.total_xp || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Your experience points
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Level</CardTitle>
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{progress?.level || 1}</div>
                            <p className="text-xs text-muted-foreground">
                                Current level
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Streak</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{streak?.current_streak || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Days in a row
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Badges</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{badges.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Achievements earned
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Achievements */}
                <Card>
                    <CardHeader>
                        <CardTitle>Your Achievements</CardTitle>
                        <CardDescription>Badges you've earned</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {badges.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {badges.map((badge) => (
                                    <Badge key={badge.id} variant="secondary" className="text-lg p-2">
                                        {badge.badge_icon || '🏅'} {badge.badge_name}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="text-lg p-2 opacity-50">🌟 First Steps (Locked)</Badge>
                                <Badge variant="secondary" className="text-lg p-2 opacity-50">⚡ Quick Learner (Locked)</Badge>
                                <p className="text-sm text-muted-foreground w-full mt-2">Start learning to earn badges!</p>
                            </div>
                        )}

                        <p className="text-sm text-muted-foreground mt-4">
                            Stats loaded from database.
                        </p>
                    </CardContent>
                </Card>

                {/* Voice Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Volume2 className="w-5 h-5" />
                            Voice Settings
                        </CardTitle>
                        <CardDescription>Customize how AI responses are read to you</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* We pass userId to help with optimistic updates if needed, though button handles it */}
                        <VoiceSettingsButton />
                    </CardContent>
                </Card>

                {/* Account Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>Your account details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Member since</span>
                            <span className="font-medium">
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">User ID</span>
                            <span className="font-mono text-sm">{user.id.slice(0, 12)}...</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
