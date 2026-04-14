
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types/database'

// Test client inference
const supabase = createClient<Database>('url', 'key')

async function test() {
    // Check if 'users' table is recognized
    const { data: users, error } = await supabase.from('users').select('*')

    if (users) {
        const u = users[0]
        console.log(u.voice_preference) // Should be string
    }

    // Check insert
    await supabase.from('users').insert({
        clerk_id: '123',
        email: 'test',
        voice_preference: 'test'
    })
}
