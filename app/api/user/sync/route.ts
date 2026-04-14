import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getUserByClerkId, syncAllUserData, getUserProgress, getUserStreak, getUserChallenges, getUserBadges } from '@/services/database-service'

// GET - Fetch user data from database
export async function GET() {
    try {
        const { userId: clerkId } = await auth()

        if (!clerkId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user from database
        const user = await getUserByClerkId(clerkId)

        if (!user) {
            return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
        }

        // Fetch all user data
        const [progress, streak, challenges, badges] = await Promise.all([
            getUserProgress(user.id),
            getUserStreak(user.id),
            getUserChallenges(user.id),
            getUserBadges(user.id),
        ])

        return NextResponse.json({
            user,
            progress,
            streak,
            challenges,
            badges,
        })
    } catch (error) {
        console.error('Error fetching user data:', error)
        return NextResponse.json(
            { error: 'Failed to fetch user data' },
            { status: 500 }
        )
    }
}

// POST - Sync local data to cloud
export async function POST(request: Request) {
    try {
        const { userId: clerkId } = await auth()

        if (!clerkId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user from database
        const user = await getUserByClerkId(clerkId)

        if (!user) {
            return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
        }

        // Get local data from request
        const localData = await request.json()

        // Sync all data to database
        const result = await syncAllUserData(user.id, localData)

        return NextResponse.json({
            success: true,
            synced: result,
        })
    } catch (error) {
        console.error('Error syncing user data:', error)
        return NextResponse.json(
            { error: 'Failed to sync user data' },
            { status: 500 }
        )
    }
}
