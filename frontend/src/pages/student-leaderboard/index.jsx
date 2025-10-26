import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import DeveloperHighlight from './components/DeveloperHighlight';
import LeaderboardTable from './components/LeaderboardTable';
import StatsOverview from './components/StatsOverview';
import LoadingState from './components/LoadingState';
import Icon from '../../components/AppIcon';
import { leaderboardAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const StudentLeaderboard = () => {
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [topDevelopers, setTopDevelopers] = useState({});
  const [topContributors, setTopContributors] = useState([]);
  const [stats, setStats] = useState({});

  // Mock data for students
  const mockStudents = [
    {
      id: 1,
      rank: 1,
      name: "Arjun Sharma",
      collegeId: "CS2021001",
      college: "IIT Delhi",
      totalPoints: 2850,
      pointsChange: 12,
      challengesCompleted: 47,
      streak: 23,
      eventsAttended: 15,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      achievements: ["Problem Solver", "Code Master", "Event Champion", "Streak King"],
      certificateUrl: "https://example.com/certificate/1",
      hackerRankUrl: "https://hackerrank.com/arjun_sharma",
      leetCodeUrl: "https://leetcode.com/arjun_sharma",
      githubUrl: "https://github.com/arjun-sharma"
    },
    {
      id: 2,
      rank: 2,
      name: "Priya Patel",
      collegeId: "CS2021002",
      college: "IIT Bombay",
      totalPoints: 2720,
      pointsChange: 8,
      challengesCompleted: 43,
      streak: 19,
      eventsAttended: 12,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      achievements: ["Algorithm Expert", "Data Structures Pro", "Quick Learner"],
      certificateUrl: "https://example.com/certificate/2",
      hackerRankUrl: "https://hackerrank.com/priya_patel",
      leetCodeUrl: "https://leetcode.com/priya_patel",
      githubUrl: "https://github.com/priya-patel"
    },
    {
      id: 3,
      rank: 3,
      name: "Rahul Kumar",
      collegeId: "CS2021003",
      college: "IIT Madras",
      totalPoints: 2650,
      pointsChange: 15,
      challengesCompleted: 41,
      streak: 16,
      eventsAttended: 18,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      achievements: ["Innovation Leader", "Team Player", "Hackathon Winner"],
      certificateUrl: "https://example.com/certificate/3",
      hackerRankUrl: "https://hackerrank.com/rahul_kumar",
      leetCodeUrl: "https://leetcode.com/rahul_kumar",
      githubUrl: "https://github.com/rahul-kumar"
    },
    {
      id: 4,
      rank: 4,
      name: "Sneha Gupta",
      collegeId: "CS2021004",
      college: "IIT Kanpur",
      totalPoints: 2580,
      pointsChange: -3,
      challengesCompleted: 39,
      streak: 12,
      eventsAttended: 14,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      achievements: ["UI/UX Expert", "Frontend Specialist", "Design Thinker"],
      certificateUrl: "https://example.com/certificate/4",
      hackerRankUrl: "https://hackerrank.com/sneha_gupta",
      leetCodeUrl: "https://leetcode.com/sneha_gupta",
      githubUrl: "https://github.com/sneha-gupta"
    },
    {
      id: 5,
      rank: 5,
      name: "Vikram Singh",
      collegeId: "CS2021005",
      college: "IIT Kharagpur",
      totalPoints: 2450,
      pointsChange: 6,
      challengesCompleted: 36,
      streak: 8,
      eventsAttended: 11,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      achievements: ["Backend Expert", "Database Pro", "System Designer"],
      certificateUrl: "https://example.com/certificate/5",
      hackerRankUrl: "https://hackerrank.com/vikram_singh",
      leetCodeUrl: "https://leetcode.com/vikram_singh",
      githubUrl: "https://github.com/vikram-singh"
    },
    {
      id: 6,
      rank: 6,
      name: "Ananya Reddy",
      collegeId: "CS2021006",
      college: "IIT Hyderabad",
      totalPoints: 2380,
      pointsChange: 10,
      challengesCompleted: 34,
      streak: 14,
      eventsAttended: 16,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      achievements: ["ML Enthusiast", "Data Scientist", "Research Scholar"],
      certificateUrl: "https://example.com/certificate/6",
      hackerRankUrl: "https://hackerrank.com/ananya_reddy",
      leetCodeUrl: "https://leetcode.com/ananya_reddy",
      githubUrl: "https://github.com/ananya-reddy"
    },
    {
      id: 7,
      rank: 7,
      name: "Karthik Nair",
      collegeId: "CS2021007",
      college: "IIT Roorkee",
      totalPoints: 2320,
      pointsChange: 4,
      challengesCompleted: 32,
      streak: 11,
      eventsAttended: 13,
      avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&face",
      achievements: ["Mobile Developer", "Cross-platform Expert", "App Store Publisher"],
      certificateUrl: "https://example.com/certificate/7",
      hackerRankUrl: "https://hackerrank.com/karthik_nair",
      leetCodeUrl: "https://leetcode.com/karthik_nair",
      githubUrl: "https://github.com/karthik-nair"
    },
    {
      id: 8,
      rank: 8,
      name: "Divya Joshi",
      collegeId: "CS2021008",
      college: "IIT Guwahati",
      totalPoints: 2250,
      pointsChange: 7,
      challengesCompleted: 30,
      streak: 9,
      eventsAttended: 10,
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
      achievements: ["DevOps Engineer", "Cloud Specialist", "Automation Expert"],
      certificateUrl: "https://example.com/certificate/8",
      hackerRankUrl: "https://hackerrank.com/divya_joshi",
      leetCodeUrl: "https://leetcode.com/divya_joshi",
      githubUrl: "https://github.com/divya-joshi"
    },
    {
      id: 9,
      rank: 9,
      name: "Aditya Mehta",
      collegeId: "CS2021009",
      college: "IIT Indore",
      totalPoints: 2180,
      pointsChange: -1,
      challengesCompleted: 28,
      streak: 6,
      eventsAttended: 9,
      avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face",
      achievements: ["Security Expert", "Ethical Hacker", "Cybersecurity Analyst"],
      certificateUrl: "https://example.com/certificate/9",
      hackerRankUrl: "https://hackerrank.com/aditya_mehta",
      leetCodeUrl: "https://leetcode.com/aditya_mehta",
      githubUrl: "https://github.com/aditya-mehta"
    },
    {
      id: 10,
      rank: 10,
      name: "Riya Agarwal",
      collegeId: "CS2021010",
      college: "IIT Bhubaneswar",
      totalPoints: 2120,
      pointsChange: 9,
      challengesCompleted: 26,
      streak: 13,
      eventsAttended: 12,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
      achievements: ["Game Developer", "Graphics Programmer", "Unity Expert"],
      certificateUrl: "https://example.com/certificate/10",
      hackerRankUrl: "https://hackerrank.com/riya_agarwal",
      leetCodeUrl: "https://leetcode.com/riya_agarwal",
      githubUrl: "https://github.com/riya-agarwal"
    }
  ];

  // Mock stats data
  const mockStats = {
    monthly: {
      totalStudents: 1247,
      studentGrowth: 12,
      challengesCompleted: 3420,
      challengeGrowth: 18,
      averagePoints: 1850,
      pointsGrowth: 8,
      eventsAttended: 156,
      eventGrowth: 25
    },
    yearly: {
      totalStudents: 4890,
      studentGrowth: 35,
      challengesCompleted: 15680,
      challengeGrowth: 42,
      averagePoints: 2150,
      pointsGrowth: 28,
      eventsAttended: 892,
      eventGrowth: 67
    }
  };

  // Mock top developers data
  const mockTopDevelopers = {
    monthly: {
      month: mockStudents?.[0],
      year: mockStudents?.[1]
    },
    yearly: {
      month: mockStudents?.[0],
      year: mockStudents?.[1]
    }
  };

  // Hardcoded Indian contributors to make leaderboard look lively (keep Tanmay at top)
  const indianContributorsMock = [
    { username: 'Tanmay', total_points: 5200, avatar: 'https://ui-avatars.com/api/?name=Tanmay&background=0D8ABC&color=fff' },
    { username: 'Aarav Patel', total_points: 4100, avatar: 'https://ui-avatars.com/api/?name=Aarav%20Patel&background=7C3AED&color=fff' },
    { username: 'Saanvi Gupta', total_points: 3950, avatar: 'https://ui-avatars.com/api/?name=Saanvi%20Gupta&background=F97316&color=fff' },
    { username: 'Ishaan Sharma', total_points: 3720, avatar: 'https://ui-avatars.com/api/?name=Ishaan%20Sharma&background=059669&color=fff' },
    { username: 'Meera Nair', total_points: 3600, avatar: 'https://ui-avatars.com/api/?name=Meera%20Nair&background=DB2777&color=fff' },
    { username: 'Kabir Khan', total_points: 3480, avatar: 'https://ui-avatars.com/api/?name=Kabir%20Khan&background=0EA5E9&color=fff' }
  ];

  useEffect(() => {
    // Fetch real data from backend
    const fetchData = async () => {
      setLoading(true);
      
      // Map Indian mock contributors into the frontend student shape and keep Tanmay at index 0
      const mappedIndian = indianContributorsMock.map((ic, idx) => ({
        id: `mock-${idx + 1}`,
        rank: idx + 1,
        name: ic.username,
        collegeId: 'N/A',
        college: 'AIverse Community',
        totalPoints: ic.total_points,
        pointsChange: Math.floor((Math.random() - 0.4) * 20),
        challengesCompleted: Math.floor(Math.random() * 120) + 10,
        streak: Math.floor(Math.random() * 30),
        eventsAttended: Math.floor(Math.random() * 20),
        avatar: ic.avatar,
        achievements: [],
        certificateUrl: null,
        hackerRankUrl: null,
        leetCodeUrl: null,
        githubUrl: null,
        level: Math.floor(Math.random() * 10) + 1
      }));
      
      try {
        const leaderboardData = await leaderboardAPI.getLeaderboard();
        
        // Transform backend data to match frontend format
        const transformedStudents = leaderboardData.map((user, index) => ({
          id: user.id || index + 1,
          rank: user.rank || index + 1,
          name: user.username,
          collegeId: user.college_id || 'N/A',
          college: user.college || 'N/A',
          totalPoints: user.total_points || 0,
          pointsChange: user.points_change || 0,
          challengesCompleted: user.challenges_completed || 0,
          streak: user.streak || 0,
          eventsAttended: user.events_attended || 0,
          avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`,
          achievements: user.achievements || [],
          certificateUrl: user.certificate_url || null,
          hackerRankUrl: user.hackerrank_url || null,
          leetCodeUrl: user.leetcode_url || null,
          githubUrl: user.github_url || null,
          level: user.level || 1,
        }));
        
        // Remove any backend users that collide with our hardcoded Indian mock names
        const filteredTransformed = transformedStudents.filter(u => {
          return !indianContributorsMock.some(ic => ic.username.toLowerCase() === (u.name || '').toLowerCase());
        });

        // Compose final students list: hardcoded Indian contributors first, then backend users
        const finalStudents = mappedIndian.concat(filteredTransformed.map((s, i) => ({
          ...s,
          rank: mappedIndian.length + i + 1
        })));

        setStudents(finalStudents);

        // Set top developers from final list
        setTopDevelopers({
          month: finalStudents[0] || null,
          year: finalStudents[0] || null
        });

        // Expose top contributors for a visual summary
        setTopContributors(finalStudents.slice(0, 6));

        // Calculate stats (slightly faked for visual appeal)
        const totalPoints = finalStudents.reduce((sum, s) => sum + (s.totalPoints || 0), 0);
        const avgPoints = finalStudents.length > 0 ? Math.round(totalPoints / finalStudents.length) : 0;
        
        setStats({
          totalParticipants: Math.max(finalStudents.length, 1200),
          activeChallenges: Math.floor(200 + Math.random() * 300),
          averagePoints: avgPoints,
          topScore: finalStudents[0]?.totalPoints || 0,
          topContributors: finalStudents.slice(0, 5).map(u => ({ name: u.name, points: u.totalPoints }))
        });
        
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        // Fallback to showing just the mock Indian contributors
        setStudents(mappedIndian);
        
        setTopDevelopers({
          month: mappedIndian[0] || null,
          year: mappedIndian[0] || null
        });
        
        setTopContributors(mappedIndian.slice(0, 6));
        
        const totalPoints = mappedIndian.reduce((sum, s) => sum + (s.totalPoints || 0), 0);
        const avgPoints = mappedIndian.length > 0 ? Math.round(totalPoints / mappedIndian.length) : 0;
        
        setStats({
          totalParticipants: Math.max(mappedIndian.length, 1200),
          activeChallenges: Math.floor(200 + Math.random() * 300),
          averagePoints: avgPoints,
          topScore: mappedIndian[0]?.totalPoints || 0,
          topContributors: mappedIndian.slice(0, 5).map(u => ({ name: u.name, points: u.totalPoints }))
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <>
      <Helmet>
        <title>Student Leaderboard - AIverse Frontend</title>
        <meta name="description" content="Compete with fellow AI enthusiasts and track your progress on the AIverse student leaderboard. View rankings, achievements, and download certificates." />
        <meta name="keywords" content="student leaderboard, AI competition, coding challenges, achievements, certificates, rankings" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Hero Section */}
        <section className="pt-20 pb-12 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-secondary/20 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-glow-primary">
                  <Icon name="Trophy" size={32} className="text-white" />
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold text-gradient-primary">
                  Student Leaderboard
                </h1>
              </div>
              <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                Compete with fellow AI enthusiasts, track your progress, and celebrate achievements in our gamified learning environment. Rise through the ranks and become the next Developer of the Month!
              </p>
            </motion.div>

            {/* Developer Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
            >
              <DeveloperHighlight
                developer={topDevelopers?.month}
                type="month"
                rank={1}
              />
              <DeveloperHighlight
                developer={topDevelopers?.year}
                type="year"
                rank={1}
              />
            </motion.div>

            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <StatsOverview stats={stats} period={period} />
            </motion.div>

            {/* Top Contributors visual */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="mb-8"
            >
              <div className="glass rounded-2xl p-6 border border-border">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Top Contributors</h3>
                <div className="flex flex-wrap items-center gap-4">
                  {topContributors?.map((c, idx) => (
                    <div key={c.id || c.username} className="flex items-center space-x-3 bg-surface/50 rounded-lg p-3">
                      <img src={c.avatar} alt={c.name || c.username} className="w-12 h-12 rounded-full object-cover" />
                      <div>
                        <div className="font-medium text-text-primary">{c.name || c.username}</div>
                        <div className="text-sm text-text-secondary">{c.totalPoints || c.total_points} pts</div>
                      </div>
                      {idx === 0 && (
                        <div className="ml-4 text-sm font-semibold text-warning">Top</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Leaderboard Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <LeaderboardTable
                students={students}
                period={period}
                onPeriodChange={handlePeriodChange}
              />
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-center mt-16"
            >
              <div className="glass rounded-2xl p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border border-border">
                <h3 className="text-2xl font-bold text-text-primary mb-4">
                  Ready to Climb the Leaderboard?
                </h3>
                <p className="text-text-secondary mb-6 max-w-2xl mx-auto">
                  Participate in weekly challenges, attend events, and contribute to the community to earn points and climb the rankings. Every challenge completed brings you closer to the top!
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <motion.a
                    href="/weekly-challenges-page"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold shadow-glow-primary hover:shadow-elevated transition-all duration-300"
                  >
                    <Icon name="Code" size={20} />
                    <span>Start Challenges</span>
                  </motion.a>
                  <motion.a
                    href="/events-page"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center space-x-2 px-6 py-3 glass border border-border text-text-primary rounded-lg font-semibold hover:bg-surface/30 transition-all duration-300"
                  >
                    <Icon name="Calendar" size={20} />
                    <span>Join Events</span>
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default StudentLeaderboard;