import { defineStore } from 'pinia'
import { supabase } from '../supabase'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    user.value = data.user
    return data
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
  }

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user ?? null
    // También podrías escuchar cambios en la autenticación:
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
    })
  }

  return { user, login, logout, checkUser }
})