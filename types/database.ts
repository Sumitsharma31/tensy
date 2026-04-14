export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    clerk_id: string
                    email: string
                    username: string | null
                    avatar_url: string | null
                    voice_preference: string
                    voice_speed: number
                    voice_pitch: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    clerk_id: string
                    email: string
                    username?: string | null
                    avatar_url?: string | null
                    voice_preference?: string
                    voice_speed?: number
                    voice_pitch?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    clerk_id?: string
                    email?: string
                    username?: string | null
                    avatar_url?: string | null
                    voice_preference?: string
                    voice_speed?: number
                    voice_pitch?: number
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            user_progress: {
                Row: {
                    id: string
                    user_id: string
                    total_xp: number
                    level: number
                    current_streak: number
                    longest_streak: number
                    last_activity_date: string | null
                    lessons_completed: number
                    quizzes_completed: number
                    total_score: number
                    accuracy_rate: number
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    total_xp?: number
                    level?: number
                    current_streak?: number
                    longest_streak?: number
                    last_activity_date?: string | null
                    lessons_completed?: number
                    quizzes_completed?: number
                    total_score?: number
                    accuracy_rate?: number
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    total_xp?: number
                    level?: number
                    current_streak?: number
                    longest_streak?: number
                    last_activity_date?: string | null
                    lessons_completed?: number
                    quizzes_completed?: number
                    total_score?: number
                    accuracy_rate?: number
                    updated_at?: string
                }
                Relationships: []
            }
            user_streaks: {
                Row: {
                    id: string
                    user_id: string
                    current_streak: number
                    longest_streak: number
                    total_days: number
                    last_activity_date: string | null
                    activity_dates: Json
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    current_streak?: number
                    longest_streak?: number
                    total_days?: number
                    last_activity_date?: string | null
                    activity_dates?: Json
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    current_streak?: number
                    longest_streak?: number
                    total_days?: number
                    last_activity_date?: string | null
                    activity_dates?: Json
                    updated_at?: string
                }
                Relationships: []
            }
            user_challenges: {
                Row: {
                    id: string
                    user_id: string
                    challenge_date: string
                    quiz_questions_completed: number
                    sentences_built: number
                    rainfall_score: number
                    daily_completed: boolean
                    weekly_streak_days: number
                    tenses_completed: string[]
                    tenses_mastered: number
                    perfect_score_achieved: boolean
                    weekly_completed: boolean
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    challenge_date?: string
                    quiz_questions_completed?: number
                    sentences_built?: number
                    rainfall_score?: number
                    daily_completed?: boolean
                    weekly_streak_days?: number
                    tenses_completed?: string[]
                    tenses_mastered?: number
                    perfect_score_achieved?: boolean
                    weekly_completed?: boolean
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    challenge_date?: string
                    quiz_questions_completed?: number
                    sentences_built?: number
                    rainfall_score?: number
                    daily_completed?: boolean
                    weekly_streak_days?: number
                    tenses_completed?: string[]
                    tenses_mastered?: number
                    perfect_score_achieved?: boolean
                    weekly_completed?: boolean
                    updated_at?: string
                }
                Relationships: []
            }
            user_badges: {
                Row: {
                    id: string
                    user_id: string
                    badge_id: string
                    badge_name: string
                    earned_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    badge_id: string
                    badge_name: string
                    earned_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    badge_id?: string
                    badge_name?: string
                    earned_at?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            increment_xp: {
                Args: { amount: number }
                Returns: void
            }
            update_streak: {
                Args: {
                    new_current_streak: number
                    new_longest_streak: number
                    new_last_activity_date: string
                }
                Returns: void
            }
            award_badge: {
                Args: {
                    p_badge_id: string
                    p_badge_name: string
                    p_xp_reward: number
                }
                Returns: boolean
            }
        }
        Enums: {
            [_ in never]: never
        }
    }
}
