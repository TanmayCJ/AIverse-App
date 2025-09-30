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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background-secondary to-background-tertiary">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="gradient-mesh absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 blur-3xl"></div>
        <div className="gradient-mesh absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15 blur-3xl"></div>
        
        {/* Floating Geometric Shapes */}
        <Motion.div
          variants={floatingVariants}
          animate="animate"
          className="absolute top-20 left-20 w-16 h-16 border border-primary/30 rounded-lg backdrop-blur-sm"
        />
        <Motion.div
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '2s' }}
          className="absolute top-40 right-32 w-12 h-12 bg-secondary/20 rounded-full backdrop-blur-sm"
        />
        <Motion.div
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '4s' }}
          className="absolute bottom-32 left-40 w-20 h-20 border border-accent/30 rounded-full backdrop-blur-sm"
        />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Logo and Brand */}
          <Motion.div variants={itemVariants} className="flex items-center justify-center mb-8">
            <Logo 
              size="xlarge" 
              showText={false}
              className="justify-center"
            />
          </Motion.div>

          {/* Main Heading */}
          <Motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-5xl md:text-7xl font-bold text-text-primary leading-tight">
              Unlock Your
              <span className="text-gradient-primary block">AI Potential</span>
            </h2>
            <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              Join the ultimate AI community platform where students compete, learn, and grow together through challenges, events, and cutting-edge technical content.
            </p>
          </Motion.div>

          {/* Statistics */}
          <Motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-8 py-8">
            <div className="glass-card text-center min-w-[120px]">
              <div className="text-3xl font-bold text-gradient-primary">2,500+</div>
              <div className="text-text-secondary">Active Students</div>
            </div>
            <div className="glass-card text-center min-w-[120px]">
              <div className="text-3xl font-bold text-gradient-accent">150+</div>
              <div className="text-text-secondary">Events Hosted</div>
            </div>
            <div className="glass-card text-center min-w-[120px]">
              <div className="text-3xl font-bold text-gradient-primary">50+</div>
              <div className="text-text-secondary">Weekly Challenges</div>
            </div>
          </Motion.div>

          {/* Call-to-Action Buttons */}
          <Motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
            <Button
              variant="default"
              size="lg"
              iconName="Calendar"
              iconPosition="left"
              onClick={() => navigate('/events-page')}
              className="btn-hover-lift w-full sm:w-auto"
            >
              Explore Events
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              iconName="Trophy"
              iconPosition="left"
              onClick={() => navigate('/student-leaderboard')}
              className="btn-hover-lift w-full sm:w-auto"
            >
              View Leaderboard
            </Button>
            
            <Button
              variant="secondary"
              size="lg"
              iconName="Zap"
              iconPosition="left"
              onClick={() => navigate('/weekly-challenges-page')}
              className="btn-hover-lift w-full sm:w-auto"
            >
              Weekly Challenges
            </Button>
          </Motion.div>

          {/* Scroll Indicator */}
          <Motion.div
            variants={itemVariants}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
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