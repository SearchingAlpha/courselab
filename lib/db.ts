import { supabase } from './supabase'

// User operations
export const getUser = async (id: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const getUserByEmail = async (email: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()
  if (error) throw error
  return data
}

export const createUser = async (userData: {
  email: string
  name?: string
  password?: string
  image?: string
}) => {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select()
    .single()
  if (error) throw error
  return data
}

// Course operations
export const getCourses = async (userId: string) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  return data
}

export const createCourse = async (courseData: {
  title: string
  description?: string
  topic: string
  end_goal: string
  knowledge_level: string
  focus: string
  approach: string
  user_id: string
}) => {
  const { data, error } = await supabase
    .from('courses')
    .insert([courseData])
    .select()
    .single()
  if (error) throw error
  return data
}

// Waitlist operations
export const addToWaitlist = async (email: string) => {
  const { data, error } = await supabase
    .from('waitlist')
    .insert([{ email }])
    .select()
    .single()
  if (error) throw error
  return data
}

// Session operations
export const createSession = async (sessionData: {
  session_token: string
  user_id: string
  expires: Date
}) => {
  const { data, error } = await supabase
    .from('sessions')
    .insert([sessionData])
    .select()
    .single()
  if (error) throw error
  return data
}

export const getSession = async (sessionToken: string) => {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('session_token', sessionToken)
    .single()
  if (error) throw error
  return data
}

export const deleteSession = async (sessionToken: string) => {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('session_token', sessionToken)
  if (error) throw error
} 