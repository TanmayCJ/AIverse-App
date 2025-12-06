import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const MembersGrid = () => {
  const [selectedMember, setSelectedMember] = useState(null);

  const teamMembers = [
    {
      id: 1,
      name: "Raghav",
      role: "President",
      department: "Leadership",
      avatar: "/images/team/placeholder-avatar.svg",
      bio: "Leading the AIverse community with vision and dedication to foster AI innovation and collaborative learning.",
      expertise: ["Leadership", "AI Strategy", "Community Building"],
      achievements: ["Community Leader", "Event Organizer", "Innovation Driver"],
      gradient: "from-purple-500 to-purple-700",
      iconColor: "text-purple-500",
      borderColor: "border-purple-500/30"
    },
    {
      id: 2,
      name: "Dr Rashmi C",
      role: "Club Coordinator",
      department: "Faculty Advisor",
      avatar: "/images/team/placeholder-avatar.svg",
      bio: "Guiding and mentoring the AIverse community with academic expertise and fostering innovation in AI education.",
      expertise: ["Academic Leadership", "AI Research", "Student Mentorship"],
      achievements: ["Faculty Excellence", "Research Guidance", "Academic Innovation"],
      gradient: "from-pink-500 to-pink-700",
      iconColor: "text-pink-500",
      borderColor: "border-pink-500/30"
    },
    {
      id: 3,
      name: "Tanmay",
      role: "Club Manager",
      department: "Management",
      avatar: "/images/team/placeholder-avatar.svg",
      bio: "Managing day-to-day operations and coordinating between different teams to achieve club objectives.",
      expertise: ["Project Management", "Resource Allocation", "Strategic Planning"],
      achievements: ["Efficiency Expert", "Resource Optimizer", "Team Facilitator"],
      gradient: "from-blue-500 to-blue-700",
      iconColor: "text-blue-500",
      borderColor: "border-blue-500/30"
    },
    {
      id: 4,
      name: "Sreedhana",
      role: "Tech Lead",
      department: "Technology",
      avatar: "/images/team/placeholder-avatar.svg",
      bio: "Driving technical excellence and innovation in all AIverse projects and technical initiatives.",
      expertise: ["AI/ML", "Software Development", "Technical Leadership"],
      achievements: ["Technical Innovation", "Platform Development", "Code Excellence"],
      gradient: "from-cyan-500 to-cyan-700",
      iconColor: "text-cyan-500",
      borderColor: "border-cyan-500/30"
    },
    {
      id: 5,
      name: "Amisha",
      role: "Design Lead",
      department: "Creative",
      avatar: "/images/team/placeholder-avatar.svg",
      bio: "Crafting beautiful and intuitive designs that enhance user experience across all AIverse platforms.",
      expertise: ["UI/UX Design", "Branding", "Visual Communication"],
      achievements: ["Design Excellence", "Brand Identity", "User Experience"],
      gradient: "from-orange-500 to-orange-700",
      iconColor: "text-orange-500",
      borderColor: "border-orange-500/30"
    },
    {
      id: 6,
      name: "Sanjay",
      role: "Events Management Lead",
      department: "Events",
      avatar: "/images/team/placeholder-avatar.svg",
      bio: "Orchestrating engaging events and workshops that bring the AIverse community together.",
      expertise: ["Event Planning", "Logistics", "Community Engagement"],
      achievements: ["Event Excellence", "Workshop Coordination", "Community Engagement"],
      gradient: "from-green-500 to-green-700",
      iconColor: "text-green-500",
      borderColor: "border-green-500/30"
    }
  ];

  const TeamMemberCard = ({ member }) => (
    <div 
      className={`group relative glass rounded-2xl p-6 card-hover cursor-pointer transition-all duration-500 hover:scale-105 border-2 ${member.borderColor}`}
      onClick={() => setSelectedMember(member)}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`}></div>
      
      <div className="relative flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient} rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500`}></div>
          <div className={`relative w-32 h-32 rounded-full overflow-hidden border-4 ${member.borderColor} bg-surface/50 backdrop-blur-sm`}>
            <Image
              src={member.avatar}
              alt={member.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r ${member.gradient} rounded-full`}>
            <span className="text-xs font-bold text-white whitespace-nowrap">{member.role}</span>
          </div>
        </div>
        
        <h3 className="font-bold text-xl text-text-primary mb-2 mt-4">{member.name}</h3>
        <p className={`font-medium text-sm mb-3 ${member.iconColor}`}>{member.department}</p>
        <p className="text-text-secondary text-sm mb-4 line-clamp-2">{member.bio}</p>
        
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {member.expertise.slice(0, 2).map((skill, index) => (
            <span 
              key={index} 
              className="px-3 py-1 bg-surface/80 backdrop-blur-sm text-text-secondary text-xs rounded-full border border-border/50"
            >
              {skill}
            </span>
          ))}
        </div>
        
        <button className={`mt-2 flex items-center space-x-2 px-4 py-2 bg-gradient-to-r ${member.gradient} text-white rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium`}>
          <span>View Profile</span>
          <Icon name="ArrowRight" size={14} />
        </button>
      </div>
    </div>
  );

  const MemberDetailModal = ({ member, onClose }) => {
    if (!member) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
           onClick={onClose}>
        <div className={`relative max-w-2xl w-full glass rounded-2xl p-8 animate-scale-in border-2 ${member.borderColor}`}
             onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 glass rounded-lg hover:bg-surface/50 transition-colors"
          >
            <Icon name="X" size={20} className="text-text-secondary" />
          </button>

          <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-r ${member.gradient} opacity-10 rounded-t-2xl`}></div>

          <div className="relative">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient} rounded-full blur-lg opacity-50`}></div>
                <div className={`relative w-32 h-32 rounded-full overflow-hidden border-4 ${member.borderColor} bg-surface/50`}>
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-text-primary mb-2">{member.name}</h2>
                <p className={`text-xl font-semibold mb-2 ${member.iconColor}`}>{member.role}</p>
                <p className="text-text-secondary mb-4">{member.department}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center">
                <Icon name="User" size={20} className={`${member.iconColor} mr-2`} />
                About
              </h3>
              <p className="text-text-secondary leading-relaxed">{member.bio}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center">
                <Icon name="Award" size={20} className={`${member.iconColor} mr-2`} />
                Expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {member.expertise.map((skill, index) => (
                  <span 
                    key={index} 
                    className="px-4 py-2 bg-surface/80 text-text-primary text-sm rounded-lg border border-border/50 font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center">
                <Icon name="Trophy" size={20} className={`${member.iconColor} mr-2`} />
                Key Achievements
              </h3>
              <ul className="space-y-2">
                {member.achievements.map((achievement, index) => (
                  <li key={index} className="flex items-start">
                    <Icon name="CheckCircle" size={16} className={`${member.iconColor} mr-2 mt-1 flex-shrink-0`} />
                    <span className="text-text-secondary">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Icon name="Users" size={16} />
          <span>Meet Our Team</span>
        </div>
        <h2 className="text-4xl font-bold text-gradient-primary mb-4">AIverse Leadership</h2>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto">
          Passionate individuals driving innovation and building a thriving AI community together.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teamMembers.map(member => (
          <TeamMemberCard key={member.id} member={member} />
        ))}
      </div>

      <div className="mt-16 text-center glass rounded-2xl p-8">
        <Icon name="Heart" size={40} className="text-primary mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-text-primary mb-3">Want to Join Our Team?</h3>
        <p className="text-text-secondary mb-6 max-w-xl mx-auto">
          We're always looking for passionate individuals who want to make a difference in the AI community.
        </p>
        <button className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 font-medium">
          Get Involved
        </button>
      </div>

      {selectedMember && (
        <MemberDetailModal member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}
    </div>
  );
};

export default MembersGrid;
