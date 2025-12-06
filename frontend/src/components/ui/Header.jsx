import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon from '../AppIcon';
import Button from './Button';
import Logo from '../Logo';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Challenge Available', message: 'Weekly AI Challenge #47 is now live!', time: '2 min ago', unread: true },
    { id: 2, title: 'Achievement Unlocked', message: 'You earned the "Problem Solver" badge!', time: '1 hour ago', unread: true },
    { id: 3, title: 'Event Reminder', message: 'AI Workshop starts in 30 minutes', time: '30 min ago', unread: false },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, isAuthenticated, logout } = useAuth();

  const navigationItems = [
    { name: 'Home', path: '/landing-page', icon: 'Home' },
    { name: 'Events', path: '/events-page', icon: 'Calendar' },
    { name: 'Articles', path: '/articles-technical-news-feed', icon: 'BookOpen' },
    { name: 'Leaderboard', path: '/student-leaderboard', icon: 'Trophy' },
    { name: 'Challenges', path: '/weekly-challenges-page', icon: 'Zap' },
    { name: 'Community', path: '/alverse-section', icon: 'Users' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event?.target?.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
      if (!event?.target?.closest('.user-menu-dropdown')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchQuery?.trim()) {
      navigate(`/articles-technical-news-feed?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleNotificationClick = (notificationId) => {
    setNotifications(prev => 
      prev?.map(notif => 
        notif?.id === notificationId ? { ...notif, unread: false } : notif
      )
    );
  };

  const unreadCount = notifications?.filter(n => n?.unread)?.length;

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    console.log('Logout button clicked');
    try {
      setShowUserMenu(false);
      console.log('Calling logout function...');
      await logout();
      console.log('Logout successful, redirecting...');
      // Use window.location for a full page reload to clear all state
      window.location.href = '/landing-page';
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to sign out: ' + error.message);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'glass backdrop-blur-xl border-b border-border' :'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
          {/* Logo */}
          <Logo 
            size="small" 
            showText={false}
            onClick={() => navigate('/landing-page')}
            className="sm:scale-110 md:scale-125"
          />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems?.map((item) => (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActivePath(item?.path)
                    ? 'bg-primary/20 text-primary border border-primary/30' :'text-text-secondary hover:text-text-primary hover:bg-surface/50'
                }`}
              >
                <Icon name={item?.icon} size={18} />
                <span className="font-medium">{item?.name}</span>
              </button>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center">
            <form onSubmit={handleSearch} className="relative">
              <div className={`flex items-center transition-all duration-250 ${
                isSearchFocused ? 'w-96' : 'w-64'
              }`}>
                <input
                  type="text"
                  placeholder="Search articles, challenges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full px-4 py-2 pl-10 bg-surface/50 border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 backdrop-blur-sm"
                />
                <Icon 
                  name="Search" 
                  size={18} 
                  className="absolute left-3 text-text-secondary" 
                />
              </div>
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            {/* Mobile Search */}
            <button className="md:hidden p-1.5 sm:p-2 text-text-secondary hover:text-text-primary transition-colors">
              <Icon name="Search" size={18} className="sm:w-5 sm:h-5" />
            </button>

            {/* Notifications */}
            <div className="relative notification-dropdown">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 sm:p-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <Icon name="Bell" size={18} className="sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-error text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center animate-pulse-glow">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 glass rounded-xl border border-border shadow-elevated animate-modal-enter">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-semibold text-text-primary">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications?.map((notification) => (
                      <div
                        key={notification?.id}
                        onClick={() => handleNotificationClick(notification?.id)}
                        className={`p-4 border-b border-border cursor-pointer hover:bg-surface/30 transition-colors ${
                          notification?.unread ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification?.unread ? 'bg-primary' : 'bg-transparent'
                          }`}></div>
                          <div className="flex-1">
                            <h4 className="font-medium text-text-primary text-sm">{notification?.title}</h4>
                            <p className="text-text-secondary text-sm mt-1">{notification?.message}</p>
                            <p className="text-text-muted text-xs mt-2">{notification?.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-border">
                    <Button variant="ghost" size="sm" className="w-full">
                      View All Notifications
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative user-menu-dropdown">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1 rounded-lg hover:bg-surface/50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {userProfile?.username?.substring(0, 2)?.toUpperCase() || user?.email?.substring(0, 2)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <Icon name="ChevronDown" size={16} className="text-text-secondary" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-12 w-56 glass rounded-xl border border-border shadow-elevated animate-modal-enter">
                    <div className="p-4 border-b border-border">
                      <p className="font-semibold text-text-primary">{userProfile?.username || user?.email || 'User'}</p>
                      <p className="text-text-secondary text-sm">Student</p>
                    </div>
                    <div className="py-2">
                      <button 
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/profile-integration');
                        }}
                        className="w-full px-4 py-2 text-left text-text-secondary hover:text-text-primary hover:bg-surface/30 transition-colors flex items-center space-x-2"
                      >
                        <Icon name="User" size={16} />
                        <span>Profile</span>
                      </button>
                      <button 
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/profile-integration');
                        }}
                        className="w-full px-4 py-2 text-left text-text-secondary hover:text-text-primary hover:bg-surface/30 transition-colors flex items-center space-x-2"
                      >
                        <Icon name="Settings" size={16} />
                        <span>Settings</span>
                      </button>
                      <button 
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/profile-integration');
                        }}
                        className="w-full px-4 py-2 text-left text-text-secondary hover:text-text-primary hover:bg-surface/30 transition-colors flex items-center space-x-2"
                      >
                        <Icon name="Award" size={16} />
                        <span>Achievements</span>
                      </button>
                      <div className="border-t border-border my-2"></div>
                      <button 
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-error hover:bg-error/10 transition-colors flex items-center space-x-2"
                      >
                        <Icon name="LogOut" size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <div className="flex items-center space-x-2 text-text-secondary">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-surface/50 border border-border rounded-full flex items-center justify-center">
                    <Icon name="User" size={14} className="sm:w-4 sm:h-4" />
                  </div>
                  <span className="text-xs sm:text-sm hidden md:inline">Guest</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="text-xs sm:text-sm px-2 sm:px-3">
                  Sign In
                </Button>
                <Button variant="default" size="sm" onClick={() => navigate('/auth')} className="text-xs sm:text-sm px-2 sm:px-3">
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <Icon name={isMenuOpen ? "X" : "Menu"} size={20} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/20 animate-slide-down shadow-2xl">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  className="w-full px-4 py-3 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                />
                <Icon name="Search" size={18} className="absolute left-3 top-3.5 text-white/70" />
              </form>

              {/* Mobile Navigation Items */}
              <nav className="space-y-2">
                {navigationItems?.map((item) => (
                  <button
                    key={item?.path}
                    onClick={() => handleNavigation(item?.path)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActivePath(item?.path)
                        ? 'bg-white/20 text-white border border-white/40 font-semibold' :'text-white/80 hover:text-white hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <Icon name={item?.icon} size={20} />
                    <span className="font-medium text-base">{item?.name}</span>
                  </button>
                ))}
              </nav>

              {/* Mobile Auth Buttons (if not authenticated) */}
              {!isAuthenticated && (
                <div className="pt-4 border-t border-white/20 space-y-2">
                  <Button 
                    variant="ghost" 
                    size="md" 
                    onClick={() => { navigate('/auth'); setIsMenuOpen(false); }}
                    className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/30"
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="default" 
                    size="md" 
                    onClick={() => { navigate('/auth'); setIsMenuOpen(false); }}
                    className="w-full bg-white text-black hover:bg-white/90"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;