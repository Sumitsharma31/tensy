'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

export function useSync() {
    const { isSignedIn, userId } = useAuth()
    const { user } = useUser()
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

    // Sync local data to cloud
    const syncToCloud = useCallback(async (data: any) => {
        if (!isSignedIn || !userId) {
            console.log('Not signed in, skipping cloud sync')
            return false
        }

        try {
            setSyncStatus('syncing')

            const response = await fetch('/api/user/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                throw new Error('Failed to sync data')
            }

            const result = await response.json()
            setSyncStatus('synced')
            setLastSyncTime(new Date())

            // Auto-reset status after 3 seconds
            setTimeout(() => setSyncStatus('idle'), 3000)

            return true
        } catch (error) {
            console.error('Error syncing to cloud:', error)
            setSyncStatus('error')
            setTimeout(() => setSyncStatus('idle'), 3000)
            return false
        }
    }, [isSignedIn, userId])

    // Load data from cloud
    const loadFromCloud = useCallback(async () => {
        if (!isSignedIn || !userId) {
            return null
        }

        try {
            const response = await fetch('/api/user/sync')

            if (!response.ok) {
                throw new Error('Failed to load data')
            }

            const data = await response.json()
            return data
        } catch (error) {
            console.error('Error loading from cloud:', error)
            return null
        }
    }, [isSignedIn, userId])

    // Auto-sync when user signs in
    useEffect(() => {
        if (isSignedIn && userId) {
            // Small delay to ensure components are ready
            const timer = setTimeout(() => {
                loadFromCloud()
            }, 1000)

            return () => clearTimeout(timer)
        }
    }, [isSignedIn, userId, loadFromCloud])

    return {
        syncToCloud,
        loadFromCloud,
        syncStatus,
        lastSyncTime,
        isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
        canSync: isSignedIn && userId != null,
    }
}

// Helper hook to automatically sync specific data types
export function useAutoSync(
    dataKey: string,
    getData: () => any,
    interval: number = 30000 // 30 seconds default
) {
    const { syncToCloud, canSync } = useSync()

    useEffect(() => {
        if (!canSync) return

        // Sync immediately
        const data = getData()
        if (data) {
            syncToCloud({ [dataKey]: data })
        }

        // Then sync at intervals
        const timer = setInterval(() => {
            const data = getData()
            if (data) {
                syncToCloud({ [dataKey]: data })
            }
        }, interval)

        return () => clearInterval(timer)
    }, [canSync, dataKey, getData, interval, syncToCloud])
}
