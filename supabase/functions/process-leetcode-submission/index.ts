// Supabase Edge Function for LeetCode Submission Processing
// Awards +10 points for correct, -5 for wrong

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get authenticated user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse request body
    const { problem_name, problem_difficulty, is_correct, leetcode_username } = await req.json()

    // Validate input
    if (!problem_name || !problem_difficulty || is_correct === undefined) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: problem_name, problem_difficulty, is_correct',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!['easy', 'medium', 'hard'].includes(problem_difficulty.toLowerCase())) {
      return new Response(
        JSON.stringify({
          error: 'problem_difficulty must be one of: easy, medium, hard',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Calculate points
    const points_earned = is_correct ? 10 : -5

    // Insert submission
    const { data: submission, error: insertError } = await supabaseClient
      .from('leetcode_submissions')
      .insert({
        user_id: user.id,
        problem_name: problem_name,
        problem_difficulty: problem_difficulty.toLowerCase(),
        is_correct: is_correct,
        points_earned: points_earned,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to save submission', details: insertError }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Update user profile with LeetCode username if provided
    if (leetcode_username) {
      await supabaseClient
        .from('user_profiles')
        .update({ leetcode_username: leetcode_username })
        .eq('user_id', user.id)
    }

    // Refresh user points (trigger will handle this automatically)
    await supabaseClient.rpc('refresh_user_points', { p_user_id: user.id })

    // Get updated user profile
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('leetcode_points, total_points')
      .eq('user_id', user.id)
      .single()

    return new Response(
      JSON.stringify({
        message: 'LeetCode submission recorded successfully',
        submission: submission,
        points_earned: points_earned,
        current_leetcode_points: profile?.leetcode_points || 0,
        current_total_points: profile?.total_points || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
