import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim()
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()

export const cloudEnabled = Boolean(url && publishableKey)

export const supabase: SupabaseClient | null =
  cloudEnabled && url && publishableKey
    ? createClient(url, publishableKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null

export async function ensureAnonymousSession() {
  if (!supabase) return null
  const { data: existing, error: readError } = await supabase.auth.getSession()
  if (readError) throw readError
  if (existing.session) return existing.session

  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  return data.session
}
