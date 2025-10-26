import { supabase } from '../lib/supabaseClient'

// ============================================
// AUTHENTICATION API (Supabase Auth)
// ============================================

export const authAPI = {
  // Register a new user
  async register(userData) {
    const { username, email, password } = userData

    // Sign up with Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
      },
    })

    if (signUpError) {
      throw new Error(signUpError.message)
    }

    // Create user profile
    const { error: profileError } = await supabase.from('user_profiles').insert({
      user_id: authData.user.id,
      username: username,
      email: email,
    })

    if (profileError) {
      throw new Error(profileError.message)
    }

    return { user: authData.user, session: authData.session }
  },

  // Login existing user
  async login(credentials) {
    const { email, password } = credentials

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    return { user: data.user, session: data.session }
  },

  // Logout current user
  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      throw new Error(error.message)
    }
    return data.session
  },

  // Get current user
  async getUser() {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      throw new Error(error.message)
    }
    return data.user
  },
}

// ============================================
// USER PROFILE API
// ============================================

export const profileAPI = {
  // Get user profile
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  },

  // Update user profile
  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  },
}

// ============================================
// GITHUB API
// ============================================

export const githubAPI = {
  // Setup GitHub integration by calling Edge Function
  async setupGitHub(githubUsername) {
    const { data, error } = await supabase.functions.invoke('fetch-github-repos', {
      body: { github_username: githubUsername },
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  },

  // Get user's GitHub repositories
  async getRepositories() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Not authenticated')
    }

    const { data, error } = await supabase
      .from('github_repositories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data
  },
}

// ============================================
// LEETCODE API
// ============================================

export const leetcodeAPI = {
  // Submit a LeetCode problem by calling Edge Function
  async submitProblem(problemData) {
    const { data, error } = await supabase.functions.invoke('process-leetcode-submission', {
      body: problemData,
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  },

  // Get user's LeetCode submissions
  async getSubmissions() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Not authenticated')
    }

    const { data, error } = await supabase
      .from('leetcode_submissions')
      .select('*')
      .eq('user_id', user.id)
      .order('submission_date', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data
  },
}

// ============================================
// LEADERBOARD API
// ============================================

export const leaderboardAPI = {
  // Get top users by total points
  async getLeaderboard(limit = 50) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('username, total_points, github_points, leetcode_points, sustainability_points, avatar_url, level')
      .order('total_points', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(error.message)
    }

    return data
  },
}

// ============================================
// SUSTAINABILITY ACTIONS API
// ============================================

export const sustainabilityAPI = {
  // Create a sustainability action
  async createAction(actionData) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Not authenticated')
    }

    const { data, error } = await supabase
      .from('sustainability_actions')
      .insert({
        user_id: user.id,
        ...actionData,
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // Refresh user points
    await supabase.rpc('refresh_user_points', { p_user_id: user.id })

    return data
  },

  // Get user's sustainability actions
  async getActions() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Not authenticated')
    }

    const { data, error } = await supabase
      .from('sustainability_actions')
      .select('*')
      .eq('user_id', user.id)
      .order('action_date', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data
  },
}

export default {
  authAPI,
  profileAPI,
  githubAPI,
  leetcodeAPI,
  leaderboardAPI,
  sustainabilityAPI,
}
