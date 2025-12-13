import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { useUserPreferences } from '../../hooks/useUserPreferences';
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

export const SmartOnboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center animate-scale-in-bounce">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-green-400 rounded-full animate-ping opacity-30"></div>
            </div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <Check className="w-8 h-8 text-white animate-scale-in-bounce" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">All set! 🎉</h2>
          <p className="text-gray-600 mb-4">We're personalizing your SportWarren experience...</p>
          <div className="w-48 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-shimmer" 
                 style={{ 
                   backgroundSize: '200% 100%',
                   width: '100%'
                 }}></div>
          </div>
        </Card>
      </div>
    );
  }

  const step = ONBOARDING_STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full animate-fade-in-up">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-8">
          {ONBOARDING_STEPS.map((_, index) => (
            <React.Fragment key={index}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  index <= currentStep
                    ? 'bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg scale-110'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < currentStep ? <Check className="w-5 h-5 animate-scale-in-bounce" /> : index + 1}
              </div>
              {index < ONBOARDING_STEPS.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${
                  index < currentStep ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gray-200'
                }`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-green-400 rounded-2xl animate-pulse opacity-20"></div>
            </div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
              <Icon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{step.title}</h2>
          <p className="text-gray-600 text-lg">{step.description}</p>
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
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                        answers[question.id] === option
                          ? 'border-green-600 bg-gradient-to-r from-green-50 to-green-100 text-green-900 shadow-lg shadow-green-500/20'
                          : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option}</span>
                        {answers[question.id] === option && (
                          <Check className="w-5 h-5 text-green-600 animate-scale-in-bounce" />
                        )}
                      </div>
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

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-6 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Back
          </button>
          
          <button
            onClick={handleNext}
            disabled={!step.questions.every(q => answers[q.id] !== undefined)}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
          >
            <span>{currentStep === ONBOARDING_STEPS.length - 1 ? 'Complete Setup' : 'Continue'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </Card>
    </div>
  );
};