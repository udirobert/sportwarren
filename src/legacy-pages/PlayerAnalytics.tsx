import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { 
  Activity, 
  Target, 
  TrendingUp, 
  Video, 
  Upload, 
  BarChart3,
  Users,
  Trophy,
  Zap,
  Eye,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface PerformanceMetric {
  player_value: number;
  pro_value: number;
  score: number;
  difference: number;
  percentage_of_pro: number;
}

interface PerformanceAnalysis {
  position: string;
  metrics: Record<string, PerformanceMetric>;
  comparison: {
    rating: string;
  };
  overall_score: number;
  strengths: Array<{
    metric: string;
    score: number;
    message: string;
  }>;
  areas_for_improvement: Array<{
    metric: string;
    score: number;
    message: string;
  }>;
}

interface MatchPrediction {
  probabilities: {
    win: number;
    draw: number;
    lose: number;
  };
  predicted_score: {
    home: number;
    away: number;
  };
  confidence: number;
  strength_comparison: {
    team: number;
    opponent: number;
    difference: number;
  };
  key_factors: string[];
}

export const PlayerAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'performance' | 'prediction' | 'video'>('performance');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [performanceData, setPerformanceData] = useState<PerformanceAnalysis | null>(null);
  const [predictionData, setPredictionData] = useState<MatchPrediction | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Mock player data - in production, fetch from API
  const currentPlayerData = {
    position: 'striker',
    shot_accuracy: 0.72,
    avg_speed: 27.8,
    distance_per_match: 10.2,
    sprint_count: 42,
    successful_dribbles: 0.65,
    positioning_score: 8.3,
    avg_rating: 8.2,
    recent_form: 7.8,
    goals_scored: 18,
    pass_accuracy: 0.82,
  };

  const teamStats = {
    avg_rating: 7.8,
    recent_form: 7.5,
    goals_scored: 45,
    goals_conceded: 28,
    possession: 52,
    pass_accuracy: 78,
  };

  const opponentStats = {
    avg_rating: 7.5,
    recent_form: 6.8,
    goals_scored: 38,
    goals_conceded: 32,
    possession: 48,
    pass_accuracy: 74,
  };

  useEffect(() => {
    // Simulate API call to analyze performance
    if (activeTab === 'performance') {
      analyzePerformance();
    } else if (activeTab === 'prediction') {
      predictMatch();
    }
  }, [activeTab]);

  const analyzePerformance = async () => {
    setIsAnalyzing(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockAnalysis: PerformanceAnalysis = {
        position: 'striker',
        overall_score: 89.5,
        comparison: {
          rating: 'Professional'
        },
        metrics: {
          shot_accuracy: {
            player_value: 0.72,
            pro_value: 0.75,
            score: 96,
            difference: -0.03,
            percentage_of_pro: 96
          },
          avg_speed: {
            player_value: 27.8,
            pro_value: 28.5,
            score: 97.5,
            difference: -0.7,
            percentage_of_pro: 97.5
          },
          distance_per_match: {
            player_value: 10.2,
            pro_value: 10.5,
            score: 97.1,
            difference: -0.3,
            percentage_of_pro: 97.1
          },
          sprint_count: {
            player_value: 42,
            pro_value: 45,
            score: 93.3,
            difference: -3,
            percentage_of_pro: 93.3
          }
        },
        strengths: [
          {
            metric: 'avg_speed',
            score: 97.5,
            message: 'Excellent speed and acceleration'
          },
          {
            metric: 'distance_per_match',
            score: 97.1,
            message: 'Outstanding work rate'
          }
        ],
        areas_for_improvement: [
          {
            metric: 'sprint_count',
            score: 93.3,
            message: 'Increase explosive sprint frequency'
          }
        ]
      };
      
      setPerformanceData(mockAnalysis);
      setIsAnalyzing(false);
    }, 1500);
  };

  const predictMatch = async () => {
    setIsAnalyzing(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockPrediction: MatchPrediction = {
        probabilities: {
          win: 0.58,
          draw: 0.25,
          lose: 0.17
        },
        predicted_score: {
          home: 2,
          away: 1
        },
        confidence: 0.72,
        strength_comparison: {
          team: 68.5,
          opponent: 62.3,
          difference: 6.2
        },
        key_factors: [
          'Your team is in better form',
          'Higher average player rating',
          'Superior attacking threat'
        ]
      };
      
      setPredictionData(mockPrediction);
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      // In production, send to API for analysis
      alert('Video uploaded! Analysis coming soon...');
    }
  };

  const renderPerformanceTab = () => {
    if (isAnalyzing) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing your performance...</p>
          </div>
        </div>
      );
    }

    if (!performanceData) return null;

    return (
      <div className="space-y-6">
        {/* Overall Score */}
        <Card>
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Overall Performance Score</h3>
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="text-6xl font-bold text-green-600">
                {performanceData.overall_score.toFixed(1)}
              </div>
              <div className="text-left">
                <p className="text-2xl font-semibold text-gray-900">
                  {performanceData.comparison.rating}
                </p>
                <p className="text-sm text-gray-600">Level</p>
              </div>
            </div>
            <div className="max-w-md mx-auto">
              <div className="bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${performanceData.overall_score}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Metrics Comparison */}
        <Card>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Performance vs Professional Players</h3>
          <div className="space-y-4">
            {Object.entries(performanceData.metrics).map(([metric, data]) => (
              <div key={metric} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 capitalize">
                    {metric.replace(/_/g, ' ')}
                  </h4>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                    data.score >= 90 
                      ? 'bg-green-100 text-green-700' 
                      : data.score >= 70 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {data.score.toFixed(1)}% of Pro
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Your Performance</p>
                    <p className="text-lg font-bold text-gray-900">{data.player_value}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Pro Average</p>
                    <p className="text-lg font-bold text-gray-700">{data.pro_value}</p>
                  </div>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      data.score >= 90 
                        ? 'bg-green-600' 
                        : data.score >= 70 
                        ? 'bg-yellow-600' 
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${Math.min(data.score, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Strengths and Improvements */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-bold text-gray-900">Key Strengths</h3>
            </div>
            <div className="space-y-3">
              {performanceData.strengths.map((strength, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <Trophy className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{strength.message}</p>
                    <p className="text-sm text-gray-600 capitalize">{strength.metric.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-2 mb-4">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-bold text-gray-900">Areas to Improve</h3>
            </div>
            <div className="space-y-3">
              {performanceData.areas_for_improvement.map((area, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                  <Target className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{area.message}</p>
                    <p className="text-sm text-gray-600 capitalize">{area.metric.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderPredictionTab = () => {
    if (isAnalyzing) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Calculating match predictions...</p>
          </div>
        </div>
      );
    }

    if (!predictionData) return null;

    return (
      <div className="space-y-6">
        {/* Match Outcome Prediction */}
        <Card>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Match Outcome Prediction</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Win</p>
              <p className="text-3xl font-bold text-green-600">
                {(predictionData.probabilities.win * 100).toFixed(0)}%
              </p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Draw</p>
              <p className="text-3xl font-bold text-yellow-600">
                {(predictionData.probabilities.draw * 100).toFixed(0)}%
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Lose</p>
              <p className="text-3xl font-bold text-red-600">
                {(predictionData.probabilities.lose * 100).toFixed(0)}%
              </p>
            </div>
          </div>
          
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Predicted Final Score</p>
            <p className="text-4xl font-bold text-gray-900">
              {predictionData.predicted_score.home} - {predictionData.predicted_score.away}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Confidence: {(predictionData.confidence * 100).toFixed(0)}%
            </p>
          </div>
        </Card>

        {/* Strength Comparison */}
        <Card>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Team Strength Comparison</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Your Team</span>
                <span className="text-lg font-bold text-green-600">
                  {predictionData.strength_comparison.team.toFixed(1)}
                </span>
              </div>
              <div className="bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full"
                  style={{ width: `${predictionData.strength_comparison.team}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Opponent</span>
                <span className="text-lg font-bold text-red-600">
                  {predictionData.strength_comparison.opponent.toFixed(1)}
                </span>
              </div>
              <div className="bg-gray-200 rounded-full h-3">
                <div
                  className="bg-red-600 h-3 rounded-full"
                  style={{ width: `${predictionData.strength_comparison.opponent}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Strength Difference:</strong> +{predictionData.strength_comparison.difference.toFixed(1)} points in your favor
            </p>
          </div>
        </Card>

        {/* Key Factors */}
        <Card>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Key Factors</h3>
          <div className="space-y-2">
            {predictionData.key_factors.map((factor, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Zap className="w-5 h-5 text-blue-600" />
                <p className="text-gray-700">{factor}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  const renderVideoTab = () => {
    return (
      <div className="space-y-6">
        <Card>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Video Analysis</h3>
          <p className="text-gray-600 mb-6">
            Upload match footage to analyze your technique, positioning, and movement patterns in real-time.
          </p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700 font-medium mb-2">Upload Match Video</p>
            <p className="text-sm text-gray-500 mb-4">
              MP4, MOV, or AVI up to 500MB
            </p>
            <label className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 mr-2" />
              Choose File
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
            </label>
            {videoFile && (
              <p className="text-sm text-green-600 mt-4">
                Selected: {videoFile.name}
              </p>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">What We Analyze</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Eye className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Player Detection</h4>
                <p className="text-sm text-gray-600">Track all players on the field</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Activity className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Movement Analysis</h4>
                <p className="text-sm text-gray-600">Speed, distance, and positioning</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Formation Detection</h4>
                <p className="text-sm text-gray-600">Identify team tactics and structure</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <BarChart3 className="w-5 h-5 text-orange-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Performance Metrics</h4>
                <p className="text-sm text-gray-600">Detailed statistical analysis</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Player Analytics</h1>
          <p className="text-gray-600 mt-1">
            AI-powered performance analysis and match predictions
          </p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
          <Zap className="w-5 h-5" />
          <span className="font-semibold">Powered by Roboflow + SAM3</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('performance')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'performance'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Performance Analysis</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('prediction')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'prediction'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Match Prediction</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'video'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Video className="w-4 h-4" />
              <span>Video Analysis</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'performance' && renderPerformanceTab()}
        {activeTab === 'prediction' && renderPredictionTab()}
        {activeTab === 'video' && renderVideoTab()}
      </div>
    </div>
  );
};
