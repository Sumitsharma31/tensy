import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getUserByClerkId, createUser, updateUser, getUserProgress, getUserStreak, getUserBadges } from '@/services/database-service'

export const dynamic = 'force-dynamic'

// GET - Fetch user profile with stats
export async function GET() {
    console.log('API: GET /api/user/profile hit')
    try {
        const { userId: clerkId } = await auth()

        if (!clerkId) {
            // Return empty settings for anonymous users instead of 401
            // This allows the frontend (VoiceSettingsProvider) to fall back to defaults gracefully
            return NextResponse.json({
                user: null,
                stats: null,
                voiceSettings: null,
                badges: []
            })
        }

        const clerkUser = await currentUser()

        // Get or create user in database
        let dbUser = await getUserByClerkId(clerkId)

        if (!dbUser && clerkUser) {
            // Create user if doesn't exist
            dbUser = await createUser({
                clerkId,
                email: clerkUser.emailAddresses[0]?.emailAddress || '',
                username: clerkUser.username || clerkUser.firstName || undefined,
                avatarUrl: clerkUser.imageUrl || undefined,
            })
        }

        if (!dbUser) {
            return NextResponse.json({ error: 'Failed to get user' }, { status: 500 })
        }

        // Fetch user stats
        const [progress, streak, badges] = await Promise.all([
            getUserProgress(dbUser.id),
            getUserStreak(dbUser.id),
            getUserBadges(dbUser.id),
        ])

        return NextResponse.json({
            user: dbUser,
            stats: {
                totalXp: progress?.total_xp || 0,
                level: progress?.level || 1,
                lessonsCompleted: progress?.lessons_completed || 0,
                quizzesCompleted: progress?.quizzes_completed || 0,
                currentStreak: streak?.current_streak || 0,
                longestStreak: streak?.longest_streak || 0,
                badgesEarned: badges.length,
            },
            voiceSettings: {
                voicePreference: dbUser.voice_preference || 'en-US-Standard-A',
                voiceSpeed: dbUser.voice_speed || 1.0,
                voicePitch: dbUser.voice_pitch || 1.0,
            },
            badges,
        })
    } catch (error) {
        console.error('Error fetching user profile:', error)
        return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: 500 }
        )
    }
}

// PATCH - Update user profile
export async function PATCH(request: Request) {
    console.log('🚀 DEBUG: PATCH handler entered')
    try {
        const { userId: clerkId } = await auth()
        console.log('🚀 DEBUG: Clerk ID:', clerkId)

        if (!clerkId) {
            console.log('🚀 DEBUG: No Clerk ID, returning 401')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { username, avatarUrl, voicePreference, voiceSpeed, voicePitch } = body

        // Build update object dynamically
        const updates: any = {}
        if (username !== undefined) updates.username = username
        if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl
        if (voicePreference !== undefined) updates.voice_preference = voicePreference
        if (voiceSpeed !== undefined) updates.voice_speed = voiceSpeed
        if (voicePitch !== undefined) updates.voice_pitch = voicePitch

        try {
            const updatedUser = await updateUser(clerkId, updates)
            return NextResponse.json(updatedUser)
        } catch (dbError: any) {
            // Handle case where user doesn't exist yet (PGRST116 = 0 rows)
            if (dbError.code === 'PGRST116' || dbError.message?.includes('0 rows')) {
                console.log('🚀 DEBUG: User not found in DB, attempting creation...')
                const clerkUser = await currentUser()
                console.log('🚀 DEBUG: Current User from Clerk:', clerkUser?.id)

                if (!clerkUser) {
                    console.log('🚀 DEBUG: Clerk says currentUser is null, returning 404')
                    return NextResponse.json({ error: 'User not found' }, { status: 404 })
                }

                // Create user with provided preferences
                const newUser = await createUser({
                    clerkId,
                    email: clerkUser.emailAddresses[0]?.emailAddress || '',
                    username: username || clerkUser.username || clerkUser.firstName || undefined,
                    avatarUrl: avatarUrl || clerkUser.imageUrl || undefined,
                    voice_preference: voicePreference,
                    voice_speed: voiceSpeed,
                    voice_pitch: voicePitch
                })
                return NextResponse.json(newUser)
            }
            throw dbError // Re-throw other errors
        }
    } catch (error) {
        console.error('Error updating profile:', error)
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        )
    }
}
