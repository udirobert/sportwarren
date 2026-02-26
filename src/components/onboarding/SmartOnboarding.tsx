import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Target, Users, Trophy, Settings, ChevronRight, Check } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  questions: OnboardingQuestion[];
}

interface OnboardingQuestion {
  id: string;
  type: 'single' | 'multiple' | 'scale' | 'text';
  question: string;
  options?: string[];
  min?: number;
  max?: number;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'role',
    title: 'What brings you to SportWarren?',
    description: 'Help us personalize your experience',
    icon: Users,
    questions: [
      {
        id: 'primary_role',
        type: 'single',
        question: 'What\'s your primary role?',
        options: ['Player', 'Team Organizer', 'Coach', 'Fan/Supporter'],
      },
      {
        id: 'experience',
        type: 'single',
        question: 'How would you describe your experience level?',
        options: ['Just starting out', 'Regular player', 'Experienced veteran'],
      },
    ],
  },
  {
    id: 'interests',
    title: 'What matters most to you?',
    description: 'We\'ll prioritize features you care about',
    icon: Target,
    questions: [
      {
        id: 'feature_priorities',
        type: 'multiple',
        question: 'Which features interest you most? (Select all that apply)',
        options: [
          'Tracking my personal stats',
          'Team coordination and scheduling',
          'Social features and banter',
          'Achievements and gamification',
          'Advanced analytics',
          'Match photography and memories',
        ],
      },
      {
        id: 'notification_preference',
        type: 'single',
        question: 'How often would you like notifications?',
        options: ['Only essential updates', 'Moderate notifications', 'Keep me in the loop'],
      },
    ],
  },
  {
    id: 'preferences',
    title: 'Customize your experience',
    description: 'Set up your interface preferences',
    icon: Settings,
    questions: [
      {
        id: 'ui_complexity',
        type: 'single',
        question: 'How much detail do you want to see?',
        options: ['Keep it simple', 'Balanced view', 'Show me everything'],
      },
      {
        id: 'gamification_level',
        type: 'scale',
        question: 'How much do you enjoy achievements and challenges?',
        min: 1,
        max: 5,
      },
    ],
  },
];

export const SmartOnboarding: React.FC<{ onComplete: () => void; onSkip?: () => void }> = ({ onComplete, onSkip }) => {
  const { preferences, savePreferences } = useUserPreferences();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isCompleting, setIsCompleting] = useState(false);

  // Skip onboarding if already completed
  useEffect(() => {
    if (preferences.usagePatterns.completedOnboarding) {
      onComplete();
    }
  }, [preferences.usagePatterns.completedOnboarding, onComplete]);

  const handleSkip = () => {
    // Save minimal preferences and mark as skipped
    savePreferences({
      ...preferences,
      usagePatterns: {
        ...preferences.usagePatterns,
        onboardingSkipped: true,
        onboardingSkippedAt: new Date().toISOString(),
      },
    });
    onSkip?.();
  };

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    setIsCompleting(true);

    // Process answers into preferences
    const newPreferences: Partial<typeof preferences> = {
      primaryRole: mapRole(answers.primary_role),
      experienceLevel: mapExperience(answers.experience),
      preferredFeatures: {
        statistics: mapStatisticsPreference(answers.feature_priorities),
        social: mapSocialPreference(answers.feature_priorities),
        gamification: mapGamificationPreference(answers.feature_priorities, answers.gamification_level),
        notifications: mapNotificationPreference(answers.notification_preference),
      },
      uiComplexity: mapUIComplexity(answers.ui_complexity),
      dashboardLayout: mapDashboardLayout(answers.ui_complexity),
      usagePatterns: {
        ...preferences.usagePatterns,
        completedOnboarding: true,
      },
      unlockedFeatures: determineInitialFeatures(answers),
    };

    savePreferences(newPreferences);
    
    setTimeout(() => {
      setIsCompleting(false);
      onComplete();
    }, 1000);
  };

  // Mapping functions
  const mapRole = (role: string): 'player' | 'organizer' | 'fan' | 'coach' => {
    switch (role) {
      case 'Team Organizer': return 'organizer';
      case 'Coach': return 'coach';
      case 'Fan/Supporter': return 'fan';
      default: return 'player';
    }
  };

  const mapExperience = (exp: string): 'beginner' | 'intermediate' | 'advanced' => {
    switch (exp) {
      case 'Just starting out': return 'beginner';
      case 'Experienced veteran': return 'advanced';
      default: return 'intermediate';
    }
  };

  const mapStatisticsPreference = (priorities: string[]): 'basic' | 'detailed' | 'advanced' => {
    if (priorities?.includes('Advanced analytics')) return 'advanced';
    if (priorities?.includes('Tracking my personal stats')) return 'detailed';
    return 'basic';
  };

  const mapSocialPreference = (priorities: string[]): 'minimal' | 'moderate' | 'active' => {
    if (priorities?.includes('Social features and banter')) return 'active';
    if (priorities?.includes('Team coordination and scheduling')) return 'moderate';
    return 'minimal';
  };

  const mapGamificationPreference = (priorities: string[], level: number): 'none' | 'light' | 'full' => {
    if (priorities?.includes('Achievements and gamification') && level >= 4) return 'full';
    if (priorities?.includes('Achievements and gamification') || level >= 3) return 'light';
    return 'none';
  };

  const mapNotificationPreference = (pref: string): 'essential' | 'moderate' | 'all' => {
    switch (pref) {
      case 'Only essential updates': return 'essential';
      case 'Keep me in the loop': return 'all';
      default: return 'moderate';
    }
  };

  const mapUIComplexity = (pref: string): 'simple' | 'standard' | 'advanced' => {
    switch (pref) {
      case 'Keep it simple': return 'simple';
      case 'Show me everything': return 'advanced';
      default: return 'standard';
    }
  };

  const mapDashboardLayout = (pref: string): 'minimal' | 'balanced' | 'comprehensive' => {
    switch (pref) {
      case 'Keep it simple': return 'minimal';
      case 'Show me everything': return 'comprehensive';
      default: return 'balanced';
    }
  };

  const determineInitialFeatures = (answers: Record<string, any>): string[] => {
    const base = ['dashboard', 'match-tracker', 'basic-stats'];
    const features = [...base];

    if (answers.feature_priorities?.includes('Team coordination and scheduling')) {
      features.push('squad-management', 'scheduling');
    }
    if (answers.feature_priorities?.includes('Social features and banter')) {
      features.push('social-feed', 'community');
    }
    if (answers.feature_priorities?.includes('Achievements and gamification')) {
      features.push('achievements', 'challenges');
    }
    if (answers.feature_priorities?.includes('Advanced analytics')) {
      features.push('advanced-analytics', 'performance-insights');
    }

    return features;
  };

  if (isCompleting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">All set!</h2>
          <p className="text-gray-600">We're personalizing your SportWarren experience...</p>
        </Card>
      </div>
    );
  }

  const step = ONBOARDING_STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-8">
          {ONBOARDING_STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index <= currentStep
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
          <p className="text-gray-600">{step.description}</p>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {step.questions.map((question) => (
            <div key={question.id}>
              <h3 className="font-medium text-gray-900 mb-3">{question.question}</h3>
              
              {question.type === 'single' && (
                <div className="space-y-2">
                  {question.options?.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(question.id, option)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        answers[question.id] === option
                          ? 'border-green-600 bg-green-50 text-green-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {question.type === 'multiple' && (
                <div className="space-y-2">
                  {question.options?.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        const current = answers[question.id] || [];
                        const updated = current.includes(option)
                          ? current.filter((item: string) => item !== option)
                          : [...current, option];
                        handleAnswer(question.id, updated);
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        (answers[question.id] || []).includes(option)
                          ? 'border-green-600 bg-green-50 text-green-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {question.type === 'scale' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Not important</span>
                  <div className="flex space-x-2">
                    {Array.from({ length: 5 }, (_, i) => i + 1).map((value) => (
                      <button
                        key={value}
                        onClick={() => handleAnswer(question.id, value)}
                        className={`w-10 h-10 rounded-full border-2 transition-colors ${
                          answers[question.id] === value
                            ? 'border-green-600 bg-green-600 text-white'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">Very important</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Skip option */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleSkip}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Skip for now →
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">
            You can always personalize your experience later from settings
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-600 disabled:opacity-50"
          >
            Back
          </button>
          
          <button
            onClick={handleNext}
            disabled={!step.questions.every(q => answers[q.id] !== undefined)}
            className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{currentStep === ONBOARDING_STEPS.length - 1 ? 'Complete' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </Card>
    </div>
  );
};