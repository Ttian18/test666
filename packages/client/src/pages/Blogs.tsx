import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, User, Tag } from 'lucide-react';
import LandingNavigation from '@/components/LandingNavigation';

const Blogs: React.FC = () => {
  const navigate = useNavigate();

  const blogPosts = [
    {
      id: 1,
      title: "10 Smart Budget Tips for Young Professionals",
      excerpt: "Learn how to manage your finances effectively in your 20s and 30s with these proven strategies.",
      author: "Sarah Johnson",
      date: "March 15, 2024",
      readTime: "5 min read",
      category: "Budgeting",
      image: "📊"
    },
    {
      id: 2,
      title: "AI-Powered Expense Tracking: The Future is Here",
      excerpt: "Discover how artificial intelligence is revolutionizing personal finance management.",
      author: "Mike Chen",
      date: "March 12, 2024",
      readTime: "7 min read",
      category: "Technology",
      image: "🤖"
    },
    {
      id: 3,
      title: "Restaurant Spending: How to Enjoy Dining Without Breaking the Bank",
      excerpt: "Smart strategies for managing your food budget while still enjoying great meals.",
      author: "Emma Davis",
      date: "March 8, 2024",
      readTime: "4 min read",
      category: "Lifestyle",
      image: "🍽️"
    }
  ];

  return (
    <div className="min-h-screen page-background-landing">
      <LandingNavigation />
      
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-6">
            Financial Insights Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Expert tips, insights, and strategies to help you master your personal finances
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {blogPosts.map((post) => (
            <article key={post.id} className="themed-card overflow-hidden group cursor-pointer">
              <div className="p-8">
                <div className="text-4xl mb-4">{post.image}</div>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {post.category}
                  </span>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{post.date}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="themed-card p-12 text-center">
          <div className="text-6xl mb-6">📝</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">More Articles Coming Soon</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            We're working on bringing you more valuable content about personal finance, budgeting tips, and AI-powered money management.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/signup')}
              className="luxury-button-primary"
            >
              Get Notified
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
  );
};

export default Blogs;
