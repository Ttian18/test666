import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Zap, Crown, ArrowLeft } from 'lucide-react';
import LandingNavigation from '@/components/LandingNavigation';

const Pricing: React.FC = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for getting started with basic expense tracking",
      icon: <Sparkles className="w-6 h-6" />,
      features: [
        "Up to 50 expenses per month",
        "Basic receipt scanning",
        "Simple budget tracking",
        "Mobile app access",
        "Email support"
      ],
      popular: false,
      buttonText: "Get Started Free",
      buttonVariant: "luxury-button" as const
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "/month",
      description: "Advanced features for serious budget managers",
      icon: <Zap className="w-6 h-6" />,
      features: [
        "Unlimited expenses",
        "AI-powered categorization",
        "Advanced analytics & insights",
        "Custom budget categories",
        "Receipt OCR with 99% accuracy",
        "Export to Excel/CSV",
        "Priority email support",
        "Mobile & web access"
      ],
      popular: true,
      buttonText: "Start Pro Trial",
      buttonVariant: "luxury-button-primary" as const
    },
    {
      name: "Premium",
      price: "$19.99",
      period: "/month",
      description: "Everything you need for complete financial control",
      icon: <Crown className="w-6 h-6" />,
      features: [
        "Everything in Pro",
        "AI budget recommendations",
        "Investment tracking",
        "Bill reminders & alerts",
        "Multiple account sync",
        "Tax preparation assistance",
        "Personal finance advisor chat",
        "API access for developers",
        "White-label options",
        "24/7 phone support"
      ],
      popular: false,
      buttonText: "Go Premium",
      buttonVariant: "luxury-button" as const
    }
  ];

  return (
    <div className="min-h-screen page-background-landing">
      <LandingNavigation />
      
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your financial management needs. All plans include our core features with no hidden fees.
          </p>
          
          <div className="inline-flex items-center gap-3 bg-blue-50 px-6 py-3 rounded-full">
            <span className="text-blue-600 font-medium">🎉 Special Launch Offer:</span>
            <span className="text-gray-700">50% off Pro & Premium plans for the first 3 months!</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`themed-card p-8 relative ${
                plan.popular ? 'ring-2 ring-blue-500 ring-opacity-50 transform scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-bold text-blue-600">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                onClick={() => navigate('/signup')}
                className={`${plan.buttonVariant} w-full text-center`}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="themed-card p-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and you'll be prorated accordingly.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                All paid plans come with a 14-day free trial. No credit card required to start your trial.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and bank transfers. All payments are processed securely.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Is my data secure?
              </h3>
              <p className="text-gray-600">
                Absolutely. We use bank-level encryption and never store your banking credentials. Your data is always protected.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
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

export default Pricing;
