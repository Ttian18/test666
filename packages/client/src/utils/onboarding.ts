// Utility functions for handling onboarding state

export const OnboardingUtils = {
  // Set onboarding completion and trigger update events
  markIntroSeen: () => {
    localStorage.setItem('hasSeenIntro', 'true');
    window.dispatchEvent(new Event('onboardingUpdate'));
    console.log('🎯 Intro marked as seen');
  },

  markQuestionnaireCompleted: () => {
    localStorage.setItem('hasCompletedQuestionnaire', 'true');
    window.dispatchEvent(new Event('onboardingUpdate'));
    console.log('🎯 Questionnaire marked as completed');
  },

  // Get current onboarding status
  getOnboardingStatus: () => {
    const hasSeenIntro = localStorage.getItem('hasSeenIntro') === 'true';
    const hasCompletedQuestionnaire = localStorage.getItem('hasCompletedQuestionnaire') === 'true';
    
    return {
      hasSeenIntro,
      hasCompletedQuestionnaire,
      isOnboardingComplete: hasSeenIntro && hasCompletedQuestionnaire
    };
  },

  // Reset onboarding (for testing)
  resetOnboarding: () => {
    localStorage.removeItem('hasSeenIntro');
    localStorage.removeItem('hasCompletedQuestionnaire');
    localStorage.removeItem('userProfile');
    window.dispatchEvent(new Event('onboardingUpdate'));
    console.log('🔄 Onboarding reset');
  },

  // Debug function to log current state
  logOnboardingState: () => {
    const status = OnboardingUtils.getOnboardingStatus();
    console.log('📊 Onboarding Status:', status);
    return status;
  }
};

export default OnboardingUtils;
