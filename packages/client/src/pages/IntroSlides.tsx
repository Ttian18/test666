import { useState } from "react";
import { ChevronRight, TrendingUp, Utensils, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { OnboardingUtils } from "@/utils/onboarding";

// Import generated images
import introSlide1 from "@/assets/intro-slide-1.jpg";
import introSlide2 from "@/assets/intro-slide-2.jpg";
import introSlide3 from "@/assets/intro-slide-3.jpg";

const IntroSlides = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const slides = [
    {
      title: "Track Your Spending",
      subtitle: "Monitor your expenses with ease and precision",
      icon: TrendingUp,
      image: introSlide1,
      gradient: "bg-gradient-hero",
    },
    {
      title: "Get Personalized Meal Ideas", 
      subtitle: "AI-powered recommendations based on your budget and preferences",
      icon: Utensils,
      image: introSlide2,
      gradient: "bg-gradient-primary",
    },
    {
      title: "Save Smarter",
      subtitle: "Achieve your financial goals with intelligent budgeting",
      icon: PiggyBank,
      image: introSlide3,
      gradient: "bg-gradient-secondary",
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setShowModal(true);
    }
  };

  const handleGetStarted = (withQuestionnaire: boolean) => {
    OnboardingUtils.markIntroSeen();
    setShowModal(false);
    
    if (withQuestionnaire) {
      navigate('/questionnaire');
    } else {
      // If skipping questionnaire, mark as completed and go to home
      OnboardingUtils.markQuestionnaireCompleted();
      console.log('🏠 Navigating to home after skipping questionnaire');
      navigate('/home');
    }
  };

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative">
      {/* Mobile Container */}
      <div className="w-full max-w-sm mx-auto px-6 py-8">
        {/* Slide Content */}
        <div className="text-center mb-12">
          <div className="w-64 h-64 mx-auto mb-8 rounded-3xl overflow-hidden shadow-strong">
            <img 
              src={currentSlideData.image} 
              alt={currentSlideData.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <h1 className="text-3xl font-bold mb-4 text-foreground">
            {currentSlideData.title}
          </h1>
          
          <p className="text-lg text-muted-foreground leading-relaxed">
            {currentSlideData.subtitle}
          </p>
        </div>

        {/* Pagination Indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentSlide 
                  ? "bg-primary w-6" 
                  : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Next Button */}
        <Button
          onClick={handleNext}
          className="w-full h-12 text-lg font-semibold bg-gradient-primary hover:opacity-90 transition-opacity"
          size="lg"
        >
          {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
          <ChevronRight className="ml-2" size={20} />
        </Button>
      </div>

      {/* Questionnaire Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-center">
              Personalize Your Experience
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-muted-foreground mb-6">
              Would you like to fill out a quick questionnaire to personalize your experience?
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => handleGetStarted(true)}
                className="bg-gradient-primary hover:opacity-90"
              >
                Yes, Let's Personalize
              </Button>
              <Button
                variant="outline"
                onClick={() => handleGetStarted(false)}
              >
                Skip for Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntroSlides;