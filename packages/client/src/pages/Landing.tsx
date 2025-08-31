import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, TrendingUp, Shield, Zap, Star } from 'lucide-react';
import LandingNavigation from '@/components/LandingNavigation';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen page-background-landing relative overflow-hidden">
      <LandingNavigation />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Spinning Dots */}
        <div className="absolute top-20 left-20 w-32 h-32">
          <div className="absolute inset-0 rounded-full border-2 border-blue-200/30 animate-spin-slow"></div>
          <div className="absolute inset-4 rounded-full border border-blue-300/40 animate-spin-reverse"></div>
          <div className="absolute inset-8 rounded-full border border-blue-400/50 animate-spin-slow"></div>
          <div className="absolute inset-12 w-2 h-2 bg-blue-400/60 rounded-full animate-pulse"></div>
        </div>
        
        {/* Floating Lines */}
        <div className="absolute top-40 right-32 w-48 h-48">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-300/50 to-transparent animate-float"></div>
          <div className="absolute top-8 left-4 w-3/4 h-0.5 bg-gradient-to-r from-blue-200/40 to-transparent animate-float animation-delay-1000"></div>
          <div className="absolute top-16 left-8 w-1/2 h-0.5 bg-gradient-to-r from-transparent to-blue-400/60 animate-float animation-delay-2000"></div>
        </div>
        
        {/* Large Blur Orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse animation-delay-3000"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300/15 rounded-full blur-3xl animate-pulse animation-delay-1500"></div>
        
        {/* Geometric Lines */}
        <div className="absolute bottom-32 left-1/4 w-64 h-64 opacity-30">
          <svg viewBox="0 0 200 200" className="w-full h-full animate-spin-very-slow">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2"/>
                <stop offset="50%" stopColor="rgb(37, 99, 235)" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="rgb(29, 78, 216)" stopOpacity="0.2"/>
              </linearGradient>
            </defs>
            <path d="M20,20 L180,20 L180,180 L20,180 Z" fill="none" stroke="url(#lineGradient)" strokeWidth="1"/>
            <path d="M40,40 L160,40 L160,160 L40,160 Z" fill="none" stroke="url(#lineGradient)" strokeWidth="0.5"/>
            <circle cx="100" cy="100" r="30" fill="none" stroke="url(#lineGradient)" strokeWidth="1"/>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-400 rounded-full animate-ping"></div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent mb-6 leading-tight">
            MealMint AI
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
            Your AI-powered financial companion for smart budget management
          </p>
          
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Track expenses, upload receipts, and get personalized recommendations with advanced AI technology
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => navigate('/login')}
              className="luxury-button-primary text-lg px-8 py-4 h-auto"
            >
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              onClick={() => navigate('/signup')}
              className="luxury-button text-lg px-8 py-4 h-auto"
            >
              Create Account
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="themed-card p-8 text-center group">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Smart Analytics</h3>
            <p className="text-gray-600 leading-relaxed">
              AI-powered insights to help you understand your spending patterns and make better financial decisions.
            </p>
          </div>
          
          <div className="themed-card p-8 text-center group">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Secure & Private</h3>
            <p className="text-gray-600 leading-relaxed">
              Bank-level security with end-to-end encryption to keep your financial data safe and protected.
            </p>
          </div>
          
          <div className="themed-card p-8 text-center group">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Instant Processing</h3>
            <p className="text-gray-600 leading-relaxed">
              Upload receipts and get instant expense categorization with our advanced OCR technology.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="themed-card p-12 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Trusted by thousands of users
            </h2>
            <p className="text-xl text-gray-600">
              Join the growing community of smart budget managers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">1M+</div>
              <div className="text-gray-600">Receipts Processed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">$5M+</div>
              <div className="text-gray-600">Budget Managed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">4.9★</div>
              <div className="text-gray-600">User Rating</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="themed-card p-12">
            <div className="flex items-center justify-center gap-2 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Ready to take control of your finances?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Start your journey to smarter budget management with MealMint AI today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/signup')}
                className="luxury-button-primary text-lg px-8 py-4 h-auto"
              >
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                onClick={() => navigate('/about')}
                className="luxury-button text-lg px-8 py-4 h-auto"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
