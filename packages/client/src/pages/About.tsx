import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Target, Users, Award, Sparkles, Heart, Globe } from 'lucide-react';
import LandingNavigation from '@/components/LandingNavigation';

const About: React.FC = () => {
  const navigate = useNavigate();

  const teamMembers = [
    {
      name: "Sarah Chen",
      role: "CEO & Co-Founder",
      bio: "Former Goldman Sachs analyst with 8+ years in fintech",
      avatar: "👩‍💼"
    },
    {
      name: "Michael Rodriguez",
      role: "CTO & Co-Founder", 
      bio: "Ex-Google engineer specializing in AI and machine learning",
      avatar: "👨‍💻"
    },
    {
      name: "Emily Johnson",
      role: "Head of Product",
      bio: "Product leader with experience at Square and Stripe",
      avatar: "👩‍🎨"
    },
    {
      name: "David Kim",
      role: "Head of AI",
      bio: "PhD in Computer Science, former OpenAI researcher",
      avatar: "🧠"
    }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "User-Centric",
      description: "Every feature we build starts with understanding our users' real financial challenges."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Inclusive Finance",
      description: "Making smart financial management accessible to everyone, regardless of income level."
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Innovation",
      description: "Pushing the boundaries of what's possible with AI in personal finance."
    }
  ];

  return (
    <div className="min-h-screen page-background-landing">
      <LandingNavigation />
      
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-6">
            About LaiSpend
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to make personal finance management as easy as taking a photo of your receipt.
          </p>
        </div>

        {/* Mission Section */}
        <div className="themed-card p-12 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Personal finance shouldn't be complicated. Traditional budgeting apps are either too simple to be useful 
                or too complex for everyday people. We're building the intelligent middle ground.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Using cutting-edge AI technology, we automatically categorize your expenses, provide personalized insights, 
                and help you make smarter financial decisions without the manual work.
              </p>
            </div>
            <div className="text-center">
              <div className="text-8xl mb-6">🎯</div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">10K+</div>
                  <div className="text-sm text-gray-600">Happy Users</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">1M+</div>
                  <div className="text-sm text-gray-600">Receipts Processed</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">4.9★</div>
                  <div className="text-sm text-gray-600">App Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="themed-card p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="themed-card p-12 mb-16">
          <div className="flex items-center gap-3 justify-center mb-12">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Meet Our Team</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <div className="text-6xl mb-4">{member.avatar}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Story Section */}
        <div className="themed-card p-12 mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Our Story</h2>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              MealMint AI was born out of frustration with existing financial apps. Our founders, Sarah and Michael, 
              were tired of manually categorizing hundreds of expenses every month just to understand where their money went.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              "There had to be a better way," Sarah recalls. "We're living in the age of AI, yet personal finance 
              apps still felt like they were built in the 2000s."
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              After months of development and testing with hundreds of beta users, we launched MealMint AI in early 2024. 
              Today, we're proud to help thousands of people take control of their finances with minimal effort.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              This is just the beginning. We're working on even more intelligent features to make financial wellness 
              accessible to everyone.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="themed-card p-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Ready to Join Our Mission?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Experience the future of personal finance management today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/signup')}
                className="luxury-button-primary"
              >
                Start Your Journey
              </Button>
              <Button 
                onClick={() => navigate('/')}
                className="luxury-button"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
