import axios from 'axios';
import FormData from 'form-data';
import { Readable } from 'stream';

const ANALYTICS_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:5001';

export interface PlayerDetection {
  player_id: string;
  position: { x: number; y: number };
  bbox: { x: number; y: number; width: number; height: number };
  confidence: number;
  team: string;
}

export interface FrameAnalysisResult {
  success: boolean;
  players_detected: number;
  players: PlayerDetection[];
  analytics: {
    field_coverage: number;
    formation: {
      formation: string;
      lines: number;
      confidence: number;
    };
    team_compactness: number;
    player_density: number;
  };
  frame_size: [number, number];
  error?: string;
}

export interface PerformanceMetric {
  player_value: number;
  pro_value: number;
  score: number;
  difference: number;
  percentage_of_pro: number;
}

export interface PerformanceAnalysis {
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

export interface MatchPrediction {
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

export class PlayerAnalyticsAPI {
  private baseUrl: string;

  constructor(baseUrl: string = ANALYTICS_SERVICE_URL) {
    this.baseUrl = baseUrl;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        timeout: 5000,
      });
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('Analytics service health check failed:', error);
      return false;
    }
  }

  async analyzeFrame(imageBuffer: Buffer): Promise<FrameAnalysisResult> {
    try {
      const formData = new FormData();
      formData.append('image', imageBuffer, {
        filename: 'frame.jpg',
        contentType: 'image/jpeg',
      });

      const response = await axios.post(
        `${this.baseUrl}/api/analyze-frame`,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 30000,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Frame analysis error:', error);
      throw new Error('Failed to analyze frame');
    }
  }

  async analyzePerformance(
    playerData: Record<string, number>,
    position: string
  ): Promise<PerformanceAnalysis> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/analyze-performance`,
        {
          player_data: playerData,
          position: position,
        },
        {
          timeout: 10000,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Performance analysis error:', error);
      throw new Error('Failed to analyze performance');
    }
  }

  async predictMatchResult(
    teamStats: Record<string, number>,
    opponentStats: Record<string, number>
  ): Promise<MatchPrediction> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/predict-result`,
        {
          team_stats: teamStats,
          opponent_stats: opponentStats,
        },
        {
          timeout: 10000,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Match prediction error:', error);
      throw new Error('Failed to predict match result');
    }
  }

  async getProBenchmarks(): Promise<Record<string, any>> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/pro-benchmarks`, {
        timeout: 5000,
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get pro benchmarks:', error);
      throw new Error('Failed to get professional benchmarks');
    }
  }

  async analyzeVideoStream(
    videoBuffer: Buffer,
    onFrameAnalyzed?: (result: FrameAnalysisResult) => void
  ): Promise<{
    total_frames: number;
    average_players: number;
    formations_detected: string[];
    highlights: any[];
  }> {
    try {
      // Extract frames from video (simplified - in production use ffmpeg)
      const frames = await this.extractFrames(videoBuffer);
      
      const results: FrameAnalysisResult[] = [];
      
      for (const frame of frames) {
        const result = await this.analyzeFrame(frame);
        results.push(result);
        
        if (onFrameAnalyzed) {
          onFrameAnalyzed(result);
        }
      }

      // Aggregate results
      const totalPlayers = results.reduce((sum, r) => sum + r.players_detected, 0);
      const formations = results
        .map(r => r.analytics?.formation?.formation)
        .filter((f, i, arr) => f && arr.indexOf(f) === i);

      return {
        total_frames: results.length,
        average_players: totalPlayers / results.length,
        formations_detected: formations as string[],
        highlights: this.identifyHighlights(results),
      };
    } catch (error) {
      console.error('Video stream analysis error:', error);
      throw new Error('Failed to analyze video stream');
    }
  }

  private async extractFrames(videoBuffer: Buffer): Promise<Buffer[]> {
    // Simplified frame extraction
    // In production, use ffmpeg to extract frames at intervals
    return [videoBuffer];
  }

  private identifyHighlights(results: FrameAnalysisResult[]): any[] {
    const highlights = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      
      // Detect interesting moments
      if (result.analytics?.player_density > 0.5) {
        highlights.push({
          frame: i,
          type: 'high_action',
          description: 'High player density - potential action moment',
          timestamp: i * 2, // Assuming 2 seconds per frame
        });
      }

      if (result.analytics?.formation?.confidence > 0.8) {
        highlights.push({
          frame: i,
          type: 'formation_change',
          description: `Clear ${result.analytics.formation.formation} formation`,
          timestamp: i * 2,
        });
      }
    }

    return highlights;
  }

  async generateTechniqueReport(
    playerData: Record<string, number>,
    videoAnalysis: any
  ): Promise<{
    overall_rating: number;
    technique_scores: Record<string, number>;
    recommendations: string[];
    comparison_to_pro: Record<string, any>;
  }> {
    try {
      // Generate comprehensive technique report
      const performanceAnalysis = await this.analyzePerformance(
        playerData,
        playerData.position as string || 'midfielder'
      );

      const techniqueScores = {
        positioning: this.calculatePositioningScore(videoAnalysis),
        movement: this.calculateMovementScore(playerData),
        decision_making: this.calculateDecisionMakingScore(playerData),
        technical_ability: performanceAnalysis.overall_score / 100,
      };

      const overallRating =
        Object.values(techniqueScores).reduce((sum, score) => sum + score, 0) /
        Object.keys(techniqueScores).length;

      const recommendations = this.generateRecommendations(
        techniqueScores,
        performanceAnalysis
      );

      return {
        overall_rating: overallRating * 10,
        technique_scores: techniqueScores,
        recommendations,
        comparison_to_pro: performanceAnalysis.metrics,
      };
    } catch (error) {
      console.error('Technique report generation error:', error);
      throw new Error('Failed to generate technique report');
    }
  }

  private calculatePositioningScore(videoAnalysis: any): number {
    if (!videoAnalysis?.analytics) return 0.7;
    
    const { field_coverage, team_compactness } = videoAnalysis.analytics;
    return (field_coverage + team_compactness) / 2;
  }

  private calculateMovementScore(playerData: Record<string, number>): number {
    const avgSpeed = playerData.avg_speed || 0;
    const distance = playerData.distance_per_match || 0;
    
    // Normalize scores
    const speedScore = Math.min(avgSpeed / 30, 1);
    const distanceScore = Math.min(distance / 12, 1);
    
    return (speedScore + distanceScore) / 2;
  }

  private calculateDecisionMakingScore(playerData: Record<string, number>): number {
    const passAccuracy = playerData.pass_accuracy || 0;
    const shotAccuracy = playerData.shot_accuracy || 0;
    
    return (passAccuracy + shotAccuracy) / 2;
  }

  private generateRecommendations(
    scores: Record<string, number>,
    analysis: PerformanceAnalysis
  ): string[] {
    const recommendations: string[] = [];

    // Based on technique scores
    Object.entries(scores).forEach(([skill, score]) => {
      if (score < 0.7) {
        recommendations.push(
          this.getSkillRecommendation(skill, score)
        );
      }
    });

    // Based on performance analysis
    analysis.areas_for_improvement.forEach(area => {
      recommendations.push(area.message);
    });

    // Add general tips
    if (recommendations.length === 0) {
      recommendations.push('Maintain your excellent form!');
      recommendations.push('Focus on consistency in high-pressure situations');
    }

    return recommendations.slice(0, 5); // Top 5 recommendations
  }

  private getSkillRecommendation(skill: string, score: number): string {
    const recommendations = {
      positioning: 'Work on tactical awareness and positioning drills',
      movement: 'Increase sprint training and stamina work',
      decision_making: 'Practice decision-making under pressure scenarios',
      technical_ability: 'Focus on technical skills training',
    };

    return recommendations[skill] || 'Continue improving all aspects of your game';
  }
}

// Export singleton instance
export const playerAnalyticsAPI = new PlayerAnalyticsAPI();
