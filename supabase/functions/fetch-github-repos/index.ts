// Supabase Edge Function for GitHub Integration
// This function fetches GitHub repositories and awards points

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
    const { github_username } = await req.json()

    if (!github_username) {
      return new Response(
        JSON.stringify({ error: 'github_username is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Fetch GitHub repositories
    const githubResponse = await fetch(
      `https://api.github.com/users/${github_username}/repos?per_page=100`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'AIverse-App',
        },
      }
    )

    if (!githubResponse.ok) {
      const errorText = await githubResponse.text()
      return new Response(
        JSON.stringify({
          error: `GitHub API error: ${githubResponse.status}`,
          details: errorText,
        }),
        {
          status: githubResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const repos = await githubResponse.json()

    // Delete existing repos for this user (re-sync)
    await supabaseClient
      .from('github_repositories')
      .delete()
      .eq('user_id', user.id)

    // Insert new repositories
    const reposToInsert = repos.map((repo: any) => ({
      user_id: user.id,
      repo_name: repo.name,
      repo_url: repo.html_url,
      description: repo.description,
      stars: repo.stargazers_count,
      language: repo.language,
      points_awarded: 10, // 10 points per repo
    }))

    const { error: insertError } = await supabaseClient
      .from('github_repositories')
      .insert(reposToInsert)

    if (insertError) {
      console.error('Insert error:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to save repositories', details: insertError }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Update user profile with GitHub username
    const { error: updateError } = await supabaseClient
      .from('user_profiles')
      .update({
        github_username: github_username,
        github_repo_count: repos.length,
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Update error:', updateError)
    }

    // Refresh user points (trigger will handle this automatically)
    await supabaseClient.rpc('refresh_user_points', { p_user_id: user.id })

    return new Response(
      JSON.stringify({
        message: 'GitHub repositories synced successfully',
        repos_count: repos.length,
        points_awarded: repos.length * 10,
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
