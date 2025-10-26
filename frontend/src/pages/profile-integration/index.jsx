import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../context/AuthContext';
import { githubAPI } from '../../services/api';

const ProfileIntegration = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // GitHub state
  const [githubUsername, setGithubUsername] = useState('');
  const [githubRepos, setGithubRepos] = useState([]);
  const [githubPoints, setGithubPoints] = useState(0);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchGitHubRepos();
    }
  }, [isAuthenticated]);

  const fetchGitHubRepos = async () => {
    try {
      const repos = await githubAPI.getRepositories();
      setGithubRepos(repos);
      if (repos.length > 0) {
        setGithubPoints(repos.length * 10);
      }
    } catch (error) {
      console.error('Error fetching repos:', error);
    }
  };

  const handleGitHubSetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await githubAPI.setupGitHub(githubUsername);
      setMessage({
        type: 'success',
        text: `Successfully integrated! Found ${response.repo_count} repositories. Earned ${response.points_earned} points!`
      });
      setGithubUsername('');
      fetchGitHubRepos();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to setup GitHub integration'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <Icon name="Lock" size={64} className="mx-auto text-text-secondary mb-6" />
          <h1 className="text-3xl font-bold text-text-primary mb-4">
            Authentication Required
          </h1>
          <p className="text-text-secondary mb-8">
            Please log in to access profile and integrations
          </p>
          <Button onClick={() => window.location.href = '/login'}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Profile & Integrations - AIverse</title>
        <meta name="description" content="Manage your GitHub and LeetCode integrations" />
      </Helmet>

      <Header />

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Profile & Integrations
          </h1>
          <p className="text-text-secondary text-lg">
            Connect your GitHub to track your repositories and earn points
          </p>
        </motion.div>

        {/* Message Alert */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-success/10 border border-success/20 text-success'
                : 'bg-error/10 border border-error/20 text-error'
            }`}
          >
            <div className="flex items-center">
              <Icon
                name={message.type === 'success' ? 'CheckCircle' : 'AlertCircle'}
                size={20}
                className="mr-2"
              />
              <span>{message.text}</span>
            </div>
          </motion.div>
        )}

        {/* GitHub Integration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl border border-border p-6 max-w-2xl mx-auto"
        >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-4">
                <Icon name="Github" size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-primary">GitHub Integration</h2>
                <p className="text-text-secondary text-sm">+10 points per repository</p>
              </div>
            </div>

            <form onSubmit={handleGitHubSetup} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  GitHub Username
                </label>
                <Input
                  type="text"
                  placeholder="e.g., torvalds"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" variant="primary" fullWidth disabled={loading}>
                {loading ? 'Connecting...' : 'Connect GitHub'}
              </Button>
            </form>

            {/* GitHub Stats */}
            {githubRepos.length > 0 && (
              <div className="mt-6 p-4 bg-surface/30 rounded-lg border border-border">
                <h3 className="font-semibold text-text-primary mb-3">Your Repositories</h3>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-text-secondary">Total Repositories:</span>
                  <span className="font-bold text-text-primary">{githubRepos.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Points Earned:</span>
                  <span className="font-bold text-success">{githubPoints} points</span>
                </div>
              </div>
            )}
        </motion.div>

        {/* GitHub Stats Summary */}
        {githubRepos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 glass rounded-2xl border border-border p-8 max-w-2xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">Your GitHub Stats</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <Icon name="GitBranch" size={40} className="mx-auto text-purple-500 mb-3" />
                <p className="text-text-secondary mb-2">Total Repositories</p>
                <p className="text-3xl font-bold text-text-primary">{githubRepos.length}</p>
              </div>
              <div className="text-center">
                <Icon name="Trophy" size={40} className="mx-auto text-warning mb-3" />
                <p className="text-text-secondary mb-2">GitHub Points</p>
                <p className="text-3xl font-bold text-primary">{githubPoints}</p>
              </div>
            </div>
            
            {/* Repository List */}
            <div className="mt-8">
              <h3 className="font-semibold text-text-primary mb-4">Recent Repositories</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {githubRepos.slice(0, 10).map((repo, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-surface/30 rounded-lg border border-border">
                    <div className="flex items-center space-x-3">
                      <Icon name="GitBranch" size={16} className="text-purple-500" />
                      <span className="text-text-primary font-medium">{repo.repo_name}</span>
                    </div>
                    <span className="text-success text-sm">+10 pts</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProfileIntegration;
