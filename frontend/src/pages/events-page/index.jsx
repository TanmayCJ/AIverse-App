import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import EventCard from './components/EventCard';
import EventDetailsModal from './components/EventDetailsModal';
import RegistrationModal from './components/RegistrationModal';
import RegistrationSuccessModal from './components/RegistrationSuccessModal';
import AdminRegistrationTable from './components/AdminRegistrationTable';
import EventFilters from './components/EventFilters';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [showAdminView, setShowAdminView] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date-asc');

  // Real events data
  const mockEvents = [
    // PAST EVENTS
    {
      id: 1,
      title: "Interviews for Non-Technical Students",
      description: "Selection process for students from diverse academic backgrounds including School of Commerce, Management Studies, CSA, and School of Applied Sciences to join AIverse community.",
      fullDescription: `On 9th September, interviews were conducted for students across multiple departments including the School of Commerce, Management Studies, CSA, and the School of Applied Sciences. 

A total of four students were selected to represent each department in our AIverse community activities. These interviews were aimed at ensuring inclusive representation and encouraging participation from diverse academic backgrounds.

This initiative demonstrates our commitment to making AI accessible to students from all disciplines, recognizing that diverse perspectives are crucial for innovative AI solutions.`,
      type: "Seminar",
      date: "2024-09-09",
      time: "10:00",
      venue: "Various Departments",
      organizer: "AIverse Team",
      banner: "https://images.unsplash.com/photo-1560439514-4e9645039924?w=800&h=400&fit=crop",
      registrationOpen: false,
      maxParticipants: 50,
      registeredCount: 50,
      price: 0,
      learningOutcomes: [
        "Inclusive representation across departments",
        "Building diverse AI community",
        "Encouraging cross-disciplinary collaboration",
        "Fostering AI awareness in non-technical fields"
      ],
      prerequisites: ["Open to all departments", "Interest in AI and Technology"]
    },
    {
      id: 2,
      title: "Workshop for School of ECE on AI Tools",
      description: "Hands-on workshop introducing modern AI tools to 90 enthusiastic students from Electronics and Communication Engineering, focusing on practical applications in data analysis, automation, and software development.",
      fullDescription: `Held on 11th September, this hands-on workshop saw participation from around 90 enthusiastic students from the School of Electronics and Communication Engineering. 

The session focused on introducing modern AI tools and how they are applied across domains including data analysis, automation, and software development. Students learned to leverage cutting-edge AI platforms and integrate them into their engineering projects.

The workshop covered practical demonstrations of AI tools relevant to ECE students, including signal processing applications, embedded AI, and IoT integration with machine learning models.`,
      type: "Workshop",
      date: "2024-09-11",
      time: "14:00",
      venue: "School of ECE",
      organizer: "AIverse & ECE Department",
      banner: "/images/events/ece-workshop.jpeg",
      registrationOpen: false,
      maxParticipants: 100,
      registeredCount: 90,
      price: 0,
      learningOutcomes: [
        "Introduction to modern AI tools",
        "Practical applications in ECE domain",
        "Data analysis and automation techniques",
        "Hands-on experience with AI platforms",
        "Integration of AI in engineering projects"
      ],
      prerequisites: ["ECE students", "Basic programming knowledge helpful"]
    },
    {
      id: 3,
      title: "Workshop for School of CSE on AI Tools",
      description: "Comprehensive session for 80 Computer Science students covering practical demonstrations of trending AI utilities including Google Colab, ChatGPT, HuggingFace, and GitHub Copilot.",
      fullDescription: `Conducted on 12th September, this session engaged around 80 students from the School of Computer Science. 

The event covered practical demonstrations of trending AI utilities, APIs, and platforms such as Google Colab, ChatGPT, HuggingFace, and GitHub Copilot, empowering students with hands-on AI integration techniques.

Students learned how to leverage these powerful tools for their development projects, understand API integration, and explore the latest advancements in generative AI and code assistance technologies.`,
      type: "Workshop",
      date: "2024-09-12",
      time: "14:00",
      venue: "School of CSE",
      organizer: "AIverse & CSE Department",
      banner: "/images/events/cse-workshop.jpeg",
      registrationOpen: false,
      maxParticipants: 100,
      registeredCount: 80,
      price: 0,
      learningOutcomes: [
        "Master Google Colab for ML projects",
        "Leverage ChatGPT and LLMs effectively",
        "Explore HuggingFace model hub",
        "Boost productivity with GitHub Copilot",
        "API integration techniques",
        "Practical AI tool implementation"
      ],
      prerequisites: ["CSE students", "Python programming", "Laptop required"]
    },
    // UPCOMING EVENTS
    {
      id: 4,
      title: "GitHub Workshop - Version Control Mastery",
      description: "Comprehensive workshop on Git and GitHub, covering version control, collaboration, open source contributions, and professional development workflows.",
      fullDescription: `Join us for an intensive GitHub workshop designed to take your development skills to the next level. Learn industry-standard version control practices, collaboration workflows, and open source contribution strategies.

This hands-on session will cover Git fundamentals, branching strategies, pull requests, code reviews, GitHub Actions for CI/CD, and best practices for managing large projects. Perfect for students looking to build their professional development portfolio and contribute to open source projects.

The workshop includes live coding sessions, real-world scenarios, and collaborative exercises where you'll work with fellow developers to simulate industry workflows.`,
      type: "Workshop",
      date: "2024-11-15",
      time: "14:00",
      venue: "Computer Lab, Main Campus",
      organizer: "AIverse Team",
      banner: "/images/events/github-workshop.jpeg",
      registrationOpen: true,
      maxParticipants: 100,
      registeredCount: 0,
      price: 0,
      learningOutcomes: [
        "Master Git commands and workflows",
        "Learn GitHub collaboration features",
        "Understand branching and merging strategies",
        "Contribute to open source projects",
        "Set up CI/CD with GitHub Actions",
        "Build professional developer portfolio"
      ],
      prerequisites: ["Basic programming knowledge", "Laptop with Git installed", "GitHub account"]
    },
    {
      id: 5,
      title: "AI Utsav 2024 - The Grand Launch",
      description: "The biggest AI event of the year! Join us for AI Utsav, a spectacular celebration of artificial intelligence featuring workshops, competitions, keynote speakers, project showcases, and exciting prizes.",
      fullDescription: `Get ready for AI Utsav 2024 - the most anticipated AI event of the year! This grand launch event marks the official beginning of an exciting journey into the world of artificial intelligence at our institution.

AI Utsav is a comprehensive multi-day celebration featuring expert keynote sessions, hands-on workshops, coding competitions, hackathons, project showcases, industry networking sessions, and panel discussions with AI leaders from top companies and research institutions.

Experience cutting-edge AI demonstrations, participate in exciting challenges with prizes worth lakhs, network with industry professionals, and be part of the AI revolution. Whether you're a beginner or an advanced practitioner, AI Utsav has something incredible for everyone.

This flagship event will feature renowned speakers from Google, Microsoft, NVIDIA, and leading AI startups, along with exclusive internship and placement opportunities for outstanding participants.`,
      type: "Competition",
      date: "2024-11-07",
      time: "09:00",
      venue: "Main Auditorium & Campus-wide",
      organizer: "AIverse Team",
      banner: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
      registrationOpen: true,
      maxParticipants: 500,
      registeredCount: 0,
      price: 0,
      learningOutcomes: [
        "Explore latest AI trends and technologies",
        "Learn from industry experts and researchers",
        "Participate in exciting competitions",
        "Network with AI professionals",
        "Showcase your AI projects",
        "Win amazing prizes and opportunities",
        "Get industry exposure and placement opportunities"
      ],
      prerequisites: ["Open to all students", "Passion for AI and Innovation", "Register early to secure your spot!"]
    }
  ];

  useEffect(() => {
    // Simulate API call
    const loadEvents = async () => {
      setLoading(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEvents(mockEvents);
      } catch (error) {
        console.error('Failed to load events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  useEffect(() => {
    let filtered = [...events];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered?.filter(event =>
        event?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        event?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        event?.organizer?.toLowerCase()?.includes(searchQuery?.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered?.filter(event =>
        event?.type?.toLowerCase() === selectedCategory?.toLowerCase()
      );
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      const now = new Date();
      filtered = filtered?.filter(event => {
        const eventDate = new Date(event.date);
        switch (selectedStatus) {
          case 'open':
            return event?.registrationOpen;
          case 'closed':
            return !event?.registrationOpen;
          case 'upcoming':
            return eventDate > now;
          case 'ongoing':
            return eventDate?.toDateString() === now?.toDateString();
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered?.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'title-asc':
          return a?.title?.localeCompare(b?.title);
        case 'title-desc':
          return b?.title?.localeCompare(a?.title);
        case 'popularity':
          return (b?.registeredCount / b?.maxParticipants) - (a?.registeredCount / a?.maxParticipants);
        default:
          return 0;
      }
    });

    setFilteredEvents(filtered);
  }, [events, searchQuery, selectedCategory, selectedStatus, sortBy]);

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleRegister = (event) => {
    setSelectedEvent(event);
    setShowRegistrationModal(true);
    setShowEventDetails(false);
  };

  const handleRegistrationSuccess = (registration) => {
    setRegistrationData(registration);
    setShowSuccessModal(true);
    setShowRegistrationModal(false);
    
    // Update event registration count
    setEvents(prevEvents =>
      prevEvents?.map(event =>
        event?.id === registration?.eventId
          ? { ...event, registeredCount: event?.registeredCount + 1 }
          : event
      )
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSortBy('date-asc');
  };

  const getEventStats = () => {
    const totalEvents = events?.length;
    const openRegistrations = events?.filter(e => e?.registrationOpen)?.length;
    const totalRegistrations = events?.reduce((sum, e) => sum + e?.registeredCount, 0);
    const upcomingEvents = events?.filter(e => new Date(e.date) > new Date())?.length;

    return { totalEvents, openRegistrations, totalRegistrations, upcomingEvents };
  };

  const stats = getEventStats();

  return (
    <>
      <Helmet>
        <title>Events - AIverse Frontend</title>
        <meta name="description" content="Discover and register for AI-focused events, workshops, hackathons, and seminars. Join the AIverse community and enhance your artificial intelligence skills." />
        <meta name="keywords" content="AI events, machine learning workshops, hackathons, AI seminars, artificial intelligence, tech events" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 overflow-hidden">
          <div className="absolute inset-0 gradient-mesh opacity-10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gradient-primary mb-6">
                AI Events & Workshops
              </h1>
              <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-8">
                Discover cutting-edge AI events, workshops, and competitions. Join our community of learners and innovators shaping the future of artificial intelligence.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
                <div className="glass-card p-4">
                  <div className="text-2xl font-bold text-primary">{stats?.totalEvents}</div>
                  <div className="text-sm text-text-secondary">Total Events</div>
                </div>
                <div className="glass-card p-4">
                  <div className="text-2xl font-bold text-accent">{stats?.openRegistrations}</div>
                  <div className="text-sm text-text-secondary">Open Registration</div>
                </div>
                <div className="glass-card p-4">
                  <div className="text-2xl font-bold text-secondary">{stats?.totalRegistrations}</div>
                  <div className="text-sm text-text-secondary">Total Registrations</div>
                </div>
                <div className="glass-card p-4">
                  <div className="text-2xl font-bold text-success">{stats?.upcomingEvents}</div>
                  <div className="text-sm text-text-secondary">Upcoming Events</div>
                </div>
              </div>

              {/* Admin Toggle */}
              <div className="flex justify-center">
                <Button
                  variant={showAdminView ? "default" : "outline"}
                  iconName="Settings"
                  iconPosition="left"
                  onClick={() => setShowAdminView(!showAdminView)}
                >
                  {showAdminView ? 'Hide Admin View' : 'Show Admin View'}
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filters */}
            <EventFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onClearFilters={handleClearFilters}
            />

            {/* Events Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 })?.map((_, index) => (
                  <div key={index} className="glass-card animate-pulse">
                    <div className="h-48 bg-surface/30 rounded-t-xl" />
                    <div className="p-6 space-y-4">
                      <div className="h-4 bg-surface/30 rounded w-3/4" />
                      <div className="h-4 bg-surface/30 rounded w-1/2" />
                      <div className="space-y-2">
                        <div className="h-3 bg-surface/30 rounded" />
                        <div className="h-3 bg-surface/30 rounded w-5/6" />
                      </div>
                      <div className="h-10 bg-surface/30 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredEvents?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEvents?.map((event, index) => (
                  <EventCard
                    key={event?.id}
                    event={event}
                    onViewDetails={handleViewDetails}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-surface/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon name="Calendar" size={48} className="text-text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-4">No Events Found</h3>
                <p className="text-text-secondary mb-8 max-w-md mx-auto">
                  We couldn't find any events matching your criteria. Try adjusting your filters or check back later for new events.
                </p>
                <Button
                  variant="outline"
                  iconName="RefreshCw"
                  iconPosition="left"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
              </motion.div>
            )}

            {/* Admin Registration Table */}
            <AdminRegistrationTable isVisible={showAdminView} />
          </div>
        </section>

        {/* Modals */}
        <EventDetailsModal
          event={selectedEvent}
          isOpen={showEventDetails}
          onClose={() => setShowEventDetails(false)}
          onRegister={handleRegister}
        />

        <RegistrationModal
          event={selectedEvent}
          isOpen={showRegistrationModal}
          onClose={() => setShowRegistrationModal(false)}
          onSuccess={handleRegistrationSuccess}
        />

        <RegistrationSuccessModal
          registration={registrationData}
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
        />
      </div>
    </>
  );
};

export default EventsPage;