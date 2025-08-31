import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import LandingNavigation from '@/components/LandingNavigation';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    // For demo purposes, redirect to home after signup
    navigate('/home');
  };

  return (
    <div className="min-h-screen page-background-landing">
      <LandingNavigation />
      
      <div className="max-w-md mx-auto px-6 pt-32 pb-20">
        <div className="luxury-form">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Create Your Account</h1>
            <p className="text-gray-600">Join thousands of users managing their finances smarter</p>
          </div>

          {/* Demo Mode Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="text-center">
              <div className="text-blue-600 mb-2">
                <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-blue-800 mb-2">Demo Mode Active</h3>
              <p className="text-sm text-blue-700 mb-3">
                In demo mode, you can create any account or use existing test credentials.
              </p>
              <Button 
                onClick={() => navigate('/login')}
                className="text-xs luxury-button"
                size="sm"
              >
                Use Existing Demo Account
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="luxury-input pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="luxury-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="luxury-input pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="luxury-input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="luxury-input pl-10"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleSubmit}
                className="luxury-button-primary w-full h-12"
                disabled={!formData.email || !formData.password || !formData.confirmPassword}
              >
                Create Account
              </Button>
              
              <div className="text-center">
                <span className="text-gray-600">Already have an account? </span>
                <button
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in
                </button>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={() => navigate('/')}
                className="luxury-button"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
