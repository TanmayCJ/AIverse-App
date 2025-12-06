import React from 'react';
import { motion as Motion } from 'framer-motion';

import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Logo from '../../../components/Logo';

const HeroSection = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-white/5 blur-3xl"></div>
        
        {/* Floating Geometric Shapes */}
        <Motion.div
          variants={floatingVariants}
          animate="animate"
          className="absolute top-20 left-20 w-16 h-16 border border-white/20 rounded-lg backdrop-blur-sm hidden lg:block"
        />
        <Motion.div
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '2s' }}
          className="absolute top-40 right-32 w-12 h-12 bg-white/10 rounded-full backdrop-blur-sm hidden lg:block"
        />
        <Motion.div
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '4s' }}
          className="absolute bottom-32 left-40 w-20 h-20 border border-white/20 rounded-full backdrop-blur-sm hidden lg:block"
        />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto mobile-container text-center">
        <Motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 sm:space-y-8"
        >
          {/* Logo and Brand */}
          <Motion.div variants={itemVariants} className="flex items-center justify-center mb-6 sm:mb-8">
            <Logo 
              size="large" 
              showText={false}
              className="justify-center scale-75 sm:scale-100"
            />
          </Motion.div>

          {/* Main Heading */}
          <Motion.div variants={itemVariants} className="space-y-4 sm:space-y-6">
            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight px-4">
              Unlock Your
              <span className="block bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">AI Potential</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
              Join the ultimate AI community platform where students compete, learn, and grow together through challenges, events, and cutting-edge technical content.
            </p>
          </Motion.div>

          {/* Statistics */}
          <Motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 py-6 sm:py-8 px-4">
            <div className="bg-white/5 border border-white/20 backdrop-blur-sm rounded-xl p-4 text-center min-w-[100px] sm:min-w-[120px] hover:bg-white/10 transition-all">
              <div className="text-2xl sm:text-3xl font-bold text-white">1,117</div>
              <div className="text-xs sm:text-sm text-gray-400">Active Members</div>
            </div>
            <div className="bg-white/5 border border-white/20 backdrop-blur-sm rounded-xl p-4 text-center min-w-[100px] sm:min-w-[120px] hover:bg-white/10 transition-all">
              <div className="text-2xl sm:text-3xl font-bold text-white">5</div>
              <div className="text-xs sm:text-sm text-gray-400">Events Hosted</div>
            </div>
            <div className="bg-white/5 border border-white/20 backdrop-blur-sm rounded-xl p-4 text-center min-w-[100px] sm:min-w-[120px] hover:bg-white/10 transition-all">
              <div className="text-2xl sm:text-3xl font-bold text-white">50+</div>
              <div className="text-xs sm:text-sm text-gray-400">Weekly Challenges</div>
            </div>
          </Motion.div>

          {/* Call-to-Action Buttons */}
          <Motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center items-center pt-6 sm:pt-8 px-4">
            <Button
              variant="default"
              size="lg"
              iconName="Calendar"
              iconPosition="left"
              onClick={() => navigate('/events-page')}
              className="btn-hover-lift w-full sm:w-auto tap-target"
            >
              Explore Events
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              iconName="Trophy"
              iconPosition="left"
              onClick={() => navigate('/student-leaderboard')}
              className="btn-hover-lift w-full sm:w-auto tap-target"
            >
              View Leaderboard
            </Button>
            
            <Button
              variant="secondary"
              size="lg"
              iconName="Zap"
              iconPosition="left"
              onClick={() => navigate('/weekly-challenges-page')}
              className="btn-hover-lift w-full sm:w-auto tap-target"
            >
              Weekly Challenges
            </Button>
          </Motion.div>

          {/* Scroll Indicator */}
          <Motion.div
            variants={itemVariants}
            className="hidden md:block absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <Motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center space-y-2 text-text-secondary"
            >
              <span className="text-sm">Scroll to explore</span>
              <Icon name="ChevronDown" size={20} />
            </Motion.div>
          </Motion.div>
        </Motion.div>
      </div>
    </section>
  );
};

export default HeroSection;