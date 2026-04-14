import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import type { WebhookEvent } from '@clerk/nextjs/server'
import { createUser } from '@/services/database-service'

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
        console.error('CLERK_WEBHOOK_SECRET not configured')
        return NextResponse.json(
            { error: 'Webhook secret not configured' },
            { status: 500 }
        )
    }

    // Get headers
    const headerPayload = await headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return NextResponse.json(
            { error: 'Missing svix headers' },
            { status: 400 }
        )
    }

    // Get body
    const payload = await req.json()
    const body = JSON.stringify(payload)

    // Create Svix instance with secret
    const wh = new Webhook(WEBHOOK_SECRET)

    let evt: WebhookEvent

    // Verify webhook
    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent
    } catch (err) {
        console.error('Webhook verification failed:', err)
        return NextResponse.json(
            { error: 'Verification failed' },
            { status: 400 }
        )
    }

    // Handle the webhook
    const eventType = evt.type

    if (eventType === 'user.created') {
        const { id, email_addresses, username, image_url, first_name } = evt.data

        try {
            // Create user in Supabase
            await createUser({
                clerkId: id,
                email: email_addresses[0]?.email_address || '',
                username: username || first_name || undefined,
                avatarUrl: image_url || undefined,
            })

            console.log('✅ User created in database:', id)
        } catch (error) {
            console.error('❌ Failed to create user in database:', error)
            // Don't fail the webhook - user will be created on first login
        }
    }

    if (eventType === 'user.updated') {
        // Handle user update if needed
        console.log('User updated:', evt.data.id)
    }

    if (eventType === 'user.deleted') {
        // Handle user deletion if needed
        console.log('User deleted:', evt.data.id)
    }

    return NextResponse.json({ received: true })
}
