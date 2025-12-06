import React from 'react';
import { motion } from 'framer-motion';

import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const EventCard = ({ event, onViewDetails, index }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time?.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getEventTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'workshop': return 'Wrench';
      case 'hackathon': return 'Code';
      case 'seminar': return 'Users';
      case 'competition': return 'Trophy';
      case 'webinar': return 'Video';
      default: return 'Calendar';
    }
  };

  const getEventTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'workshop': return 'text-gray-300';
      case 'hackathon': return 'text-white';
      case 'seminar': return 'text-gray-200';
      case 'competition': return 'text-gray-100';
      case 'webinar': return 'text-gray-300';
      default: return 'text-text-secondary';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-card group cursor-pointer hover:shadow-elevated transition-all duration-300"
      onClick={() => onViewDetails(event)}
    >
      {/* Event Banner */}
      <div className="relative overflow-hidden rounded-t-xl h-44 sm:h-52 lg:h-56">
        <Image
          src={event?.banner}
          alt={event?.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Event Type Badge */}
        <div className="absolute top-4 left-4">
          <div className="flex items-center space-x-2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full">
            <Icon 
              name={getEventTypeIcon(event?.type)} 
              size={14} 
              className={getEventTypeColor(event?.type)} 
            />
            <span className={`text-sm font-medium ${getEventTypeColor(event?.type)}`}>
              {event?.type}
            </span>
          </div>
        </div>

        {/* Registration Status */}
        <div className="absolute top-4 right-4">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            event?.registrationOpen 
              ? 'bg-white/20 text-white border border-white/30' :'bg-gray-600/20 text-gray-400 border border-gray-600/30'
          }`}>
            {event?.registrationOpen ? 'Open' : 'Closed'}
          </div>
        </div>

        {/* Event Date Overlay */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg">
            <div className="text-white text-lg font-bold">
              {new Date(event.date)?.getDate()}
            </div>
            <div className="text-gray-300 text-xs -mt-1">
              {new Date(event.date)?.toLocaleDateString('en-US', { month: 'short' })}
            </div>
          </div>
        </div>
      </div>
      {/* Event Content */}
      <div className="p-4 sm:p-5">
        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-text-primary mb-3 sm:mb-4 group-hover:text-primary transition-colors line-clamp-2">
          {event?.title}
        </h3>

        {/* Event Details - Only Date & Time */}
        <div className="space-y-2 sm:space-y-2.5 mb-3 sm:mb-4">
          {/* Date & Time */}
          <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm">
            <Icon name="Calendar" size={14} className="text-gray-300 flex-shrink-0" />
            <span className="text-text-primary font-medium truncate">
              {formatDate(event?.date)}
            </span>
            <Icon name="Clock" size={14} className="text-gray-300 flex-shrink-0" />
            <span className="text-text-primary">
              {formatTime(event?.time)}
            </span>
          </div>

          {/* Venue */}
          <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm">
            <Icon name="MapPin" size={14} className="text-gray-300 flex-shrink-0" />
            <span className="text-text-primary truncate">
              {event?.venue}
            </span>
          </div>
        </div>

        {/* Registration Info */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <Icon name="Users" size={14} className="text-text-secondary flex-shrink-0" />
            <span className="text-xs sm:text-sm text-text-secondary">
              {event?.registeredCount}/{event?.maxParticipants}
            </span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-white">
            {event?.price === 0 ? 'Free' : `₹${event?.price}`}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-surface rounded-full h-1.5 mb-3 sm:mb-4">
          <div 
            className="bg-gradient-to-r from-gray-600 to-gray-400 h-1.5 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min((event?.registeredCount / event?.maxParticipants) * 100, 100)}%` 
            }}
          />
        </div>

        {/* Action Button */}
        <Button
          variant="default"
          fullWidth
          iconName="ArrowRight"
          iconPosition="right"
          className="group-hover:bg-primary-600 transition-colors text-sm"
          disabled={!event?.registrationOpen}
        >
          {event?.registrationOpen ? 'View Details' : 'Registration Closed'}
        </Button>
      </div>
    </motion.div>
  );
};

export default EventCard;