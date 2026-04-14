import { supabase, supabaseAdmin } from '@/lib/supabase'
import type { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']
type UserProgress = Database['public']['Tables']['user_progress']['Row']
type UserStreak = Database['public']['Tables']['user_streaks']['Row']
type UserChallenge = Database['public']['Tables']['user_challenges']['Row']
type UserBadge = Database['public']['Tables']['user_badges']['Row']

// ============================================
// USER OPERATIONS
// ============================================

export async function createUser(data: {
    clerkId: string
    email: string
    username?: string
    avatarUrl?: string
    voice_preference?: string
    voice_speed?: number
    voice_pitch?: number
}) {
    const { data: user, error } = await supabaseAdmin
        .from('users')
        .insert({
            clerk_id: data.clerkId,
            email: data.email,
            username: data.username || null,
            avatar_url: data.avatarUrl || null,
            voice_preference: data.voice_preference || 'en-US-Standard-A',
            voice_speed: data.voice_speed || 1.0,
            voice_pitch: data.voice_pitch || 1.0,
        })
        .select()
        .single()

    if (error) throw error
    return user
}

export async function getUserByClerkId(clerkId: string) {
    const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('clerk_id', clerkId)
        .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
}

export async function updateUser(clerkId: string, data: {
    username?: string
    avatarUrl?: string
    voice_preference?: string
    voice_speed?: number
    voice_pitch?: number
}) {
    const updates: Database['public']['Tables']['users']['Update'] = {}

    if (data.username !== undefined) updates.username = data.username
    if (data.avatarUrl !== undefined) updates.avatar_url = data.avatarUrl
    if (data.voice_preference !== undefined) updates.voice_preference = data.voice_preference
    if (data.voice_speed !== undefined) updates.voice_speed = data.voice_speed
    if (data.voice_pitch !== undefined) updates.voice_pitch = data.voice_pitch

    const { data: user, error } = await supabaseAdmin
        .from('users')
        .update(updates)
        .eq('clerk_id', clerkId)
        .select()
        .single()

    if (error) throw error
    return user
}

// ============================================
// VOICE SETTINGS OPERATIONS
// ============================================

export interface VoiceSettings {
    voicePreference: string
    voiceSpeed: number
    voicePitch: number
}

export async function getUserVoiceSettings(userId: string): Promise<VoiceSettings | null> {
    const { data, error } = await supabaseAdmin
        .from('users')
        .select('voice_preference, voice_speed, voice_pitch')
        .eq('id', userId)
        .single()

    if (error && error.code !== 'PGRST116') throw error

    if (!data) return null

    return {
        voicePreference: data.voice_preference || 'en-US-Standard-A',
        voiceSpeed: data.voice_speed || 1.0,
        voicePitch: data.voice_pitch || 1.0,
    }
}

export async function updateUserVoiceSettings(userId: string, settings: VoiceSettings) {
    const { data, error } = await supabaseAdmin
        .from('users')
        .update({
            voice_preference: settings.voicePreference,
            voice_speed: settings.voiceSpeed,
            voice_pitch: settings.voicePitch,
        })
        .eq('id', userId)
        .select('voice_preference, voice_speed, voice_pitch')
        .single()

    if (error) throw error

    return {
        voicePreference: data.voice_preference,
        voiceSpeed: data.voice_speed,
        voicePitch: data.voice_pitch,
    }
}

// ============================================
// PROGRESS OPERATIONS
// ============================================

export async function getUserProgress(userId: string) {
    const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
}

export async function upsertUserProgress(userId: string, progress: {
    totalXp?: number
    level?: number
    lessonsCompleted?: number
    quizzesCompleted?: number
    totalScore?: number
    accuracyRate?: number
}) {
    const { data, error } = await supabase
        .from('user_progress')
        .upsert({
            user_id: userId,
            total_xp: progress.totalXp,
            level: progress.level,
            lessons_completed: progress.lessonsCompleted,
            quizzes_completed: progress.quizzesCompleted,
            total_score: progress.totalScore,
            accuracy_rate: progress.accuracyRate,
        })
        .select()
        .single()

    if (error) throw error
    return data
}

export async function incrementUserXP(userId: string, xpToAdd: number) {
    // Get current progress
    const current = await getUserProgress(userId)
    const currentXp = current?.total_xp || 0
    const newXp = currentXp + xpToAdd

    // Calculate new level (every 100 XP = 1 level)
    const newLevel = Math.floor(newXp / 100) + 1

    return upsertUserProgress(userId, {
        totalXp: newXp,
        level: newLevel,
    })
}

// ============================================
// STREAK OPERATIONS
// ============================================

export async function getUserStreak(userId: string) {
    const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
}

export async function upsertUserStreak(userId: string, streak: {
    currentStreak?: number
    longestStreak?: number
    totalDays?: number
    lastActivityDate?: string
    activityDates?: string[]
}) {
    const { data, error } = await supabase
        .from('user_streaks')
        .upsert({
            user_id: userId,
            current_streak: streak.currentStreak,
            longest_streak: streak.longestStreak,
            total_days: streak.totalDays,
            last_activity_date: streak.lastActivityDate,
            activity_dates: streak.activityDates || [],
        })
        .select()
        .single()

    if (error) throw error
    return data
}

export async function recordActivity(userId: string, date: string = new Date().toISOString().split('T')[0]) {
    const current = await getUserStreak(userId)

    if (!current) {
        // First activity
        return upsertUserStreak(userId, {
            currentStreak: 1,
            longestStreak: 1,
            totalDays: 1,
            lastActivityDate: date,
            activityDates: [date],
        })
    }

    const activityDates = (current.activity_dates as string[]) || []

    // Check if already recorded today
    if (activityDates.includes(date)) {
        return current
    }

    // Add new date
    const newDates = [...activityDates, date].sort()

    // Calculate streak
    const today = new Date(date)
    const lastDate = new Date(current.last_activity_date || date)
    const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

    let newStreak = current.current_streak
    if (daysDiff === 1) {
        // Consecutive day
        newStreak = current.current_streak + 1
    } else if (daysDiff > 1) {
        // Streak broken
        newStreak = 1
    }

    const newLongest = Math.max(current.longest_streak, newStreak)

    return upsertUserStreak(userId, {
        currentStreak: newStreak,
        longestStreak: newLongest,
        totalDays: newDates.length,
        lastActivityDate: date,
        activityDates: newDates,
    })
}

// ============================================
// CHALLENGE OPERATIONS
// ============================================

export async function getUserChallenges(userId: string, date: string = new Date().toISOString().split('T')[0]) {
    const { data, error } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_date', date)
        .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
}

export async function upsertUserChallenge(userId: string, challenge: {
    date?: string
    quizQuestionsCompleted?: number
    sentencesBuilt?: number
    rainfallScore?: number
    dailyCompleted?: boolean
    weeklyStreakDays?: number
    tensesMastered?: number
    perfectScoreAchieved?: boolean
}) {
    const date = challenge.date || new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
        .from('user_challenges')
        .upsert({
            user_id: userId,
            challenge_date: date,
            quiz_questions_completed: challenge.quizQuestionsCompleted,
            sentences_built: challenge.sentencesBuilt,
            rainfall_score: challenge.rainfallScore,
            daily_completed: challenge.dailyCompleted,
            weekly_streak_days: challenge.weeklyStreakDays,
            tenses_mastered: challenge.tensesMastered,
            perfect_score_achieved: challenge.perfectScoreAchieved,
        })
        .select()
        .single()

    if (error) throw error
    return data
}

export async function incrementChallengeProgress(
    userId: string,
    type: 'quiz' | 'sentence' | 'rainfall',
    value: number = 1
) {
    const current = await getUserChallenges(userId)

    const updates: any = {}

    if (type === 'quiz') {
        updates.quizQuestionsCompleted = (current?.quiz_questions_completed || 0) + value
    } else if (type === 'sentence') {
        updates.sentencesBuilt = (current?.sentences_built || 0) + value
    } else if (type === 'rainfall') {
        updates.rainfallScore = Math.max(current?.rainfall_score || 0, value)
    }

    return upsertUserChallenge(userId, updates)
}

// ============================================
// BADGE OPERATIONS
// ============================================

export async function getUserBadges(userId: string) {
    const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })

    if (error) throw error
    return data || []
}

export async function awardBadge(userId: string, badgeId: string, badgeName: string) {
    // Check if already has badge
    const { data: existing } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId)
        .eq('badge_id', badgeId)
        .single()

    if (existing) {
        return existing // Already has badge
    }

    const { data, error } = await supabase
        .from('user_badges')
        .insert({
            user_id: userId,
            badge_id: badgeId,
            badge_name: badgeName,
        })
        .select()
        .single()

    if (error) throw error
    return data
}

// ============================================
// LEADERBOARD OPERATIONS
// ============================================

export async function getLeaderboard(limit: number = 100) {
    const { data, error } = await supabase
        .from('user_progress')
        .select(`
      *,
      users!inner (
        id,
        username,
        avatar_url
      )
    `)
        .order('total_xp', { ascending: false })
        .limit(limit)

    if (error) throw error
    return data || []
}

export async function getUserRank(userId: string) {
    const { data, error } = await supabase
        .from('user_progress')
        .select('total_xp')
        .order('total_xp', { ascending: false })

    if (error) throw error

    const userProgress = await getUserProgress(userId)
    if (!userProgress) return null

    const rank = (data || []).findIndex(p => p.total_xp <= userProgress.total_xp) + 1
    return rank
}

// ============================================
// BATCH SYNC OPERATIONS
// ============================================

export async function syncAllUserData(userId: string, localData: {
    progress?: {
        totalXp: number
        level: number
        lessonsCompleted: number
        quizzesCompleted: number
        totalScore: number
        accuracyRate: number
    }
    streak?: {
        currentStreak: number
        longestStreak: number
        totalDays: number
        lastActivityDate: string
        activityDates: string[]
    }
    challenges?: {
        quizQuestionsCompleted: number
        sentencesBuilt: number
        rainfallScore: number
    }
    badges?: Array<{ badgeId: string; badgeName: string }>
}) {
    const results: any = {}

    // Sync progress
    if (localData.progress) {
        results.progress = await upsertUserProgress(userId, localData.progress)
    }

    // Sync streak
    if (localData.streak) {
        results.streak = await upsertUserStreak(userId, localData.streak)
    }

    // Sync challenges
    if (localData.challenges) {
        results.challenges = await upsertUserChallenge(userId, localData.challenges)
    }

    // Sync badges
    if (localData.badges) {
        results.badges = await Promise.all(
            localData.badges.map(b => awardBadge(userId, b.badgeId, b.badgeName))
        )
    }

    return results
}
