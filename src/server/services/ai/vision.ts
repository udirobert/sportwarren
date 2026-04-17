import { generateInference } from '@/lib/ai/inference';

export interface PhotoAnalysisResult {
  scene_type: 'goal_celebration' | 'team_photo' | 'action_shot' | 'crowd' | 'other';
  players_visible: number;
  key_moments: string[];
  emotions: string[];
  suggested_caption: string;
  confidence: number;
}

export interface VideoAnalysisResult {
  scene_types: string[];
  total_players: number;
  key_moments: string[];
  emotions: string[];
  highlight_timestamps: number[];
  suggested_title: string;
  confidence: number;
}

export interface PositionDetectionResult {
  formation: '4-4-2' | '3-5-2' | '4-3-3' | 'other';
  player_positions: Array<{
    position: 'GK' | 'DF' | 'MF' | 'FW';
    x: number;
    y: number;
    team: 'home' | 'away';
  }>;
  tactical_analysis: string;
  confidence: number;
}

interface HighlightEventInput {
  minute: number;
  type: string;
  description: string;
}

interface MatchHighlight {
  timestamp: number;
  type: string;
  description: string;
  importance: number;
  suggested_clip_duration: number;
}

interface MatchHighlightsResult {
  highlights: MatchHighlight[];
  total_duration: number;
  suggested_music: string;
  confidence: number;
}

export class ComputerVisionService {
  constructor() {}

  async analyzeMatchPhoto(imageData: Buffer | ArrayBuffer | string, userId?: string, _matchId?: string): Promise<PhotoAnalysisResult> {
     try {
       let imageBuffer: Buffer;
       if (Buffer.isBuffer(imageData)) {
         imageBuffer = imageData;
       } else if (typeof imageData === 'string') {
         imageBuffer = Buffer.from(imageData, 'base64');
       } else {
         imageBuffer = Buffer.from(imageData as ArrayBuffer);
       }

       // Convert to base64 for Vision API (gpt-4o or similar)
       const base64Image = imageBuffer.toString('base64');

       const messages: Parameters<typeof generateInference>[0] = [
         {
           role: 'user',
           content: [
             {
               type: 'text',
              text: `Analyze this football match photo and extract relevant information.
                     Return a JSON object with:
                     {
                       "scene_type": "goal_celebration" | "team_photo" | "action_shot" | "crowd" | "other",
                       "players_visible": number,
                       "key_moments": ["description of what's happening"],
                       "emotions": ["celebration", "disappointment", "concentration", etc.],
                       "suggested_caption": "engaging caption for social media",
                       "confidence": number between 0 and 1
                     }`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: 'high'
              }
            }
          ]
        }
      ];

      const result = await generateInference(messages, {
        modelOverride: 'gpt-4o', // Use vision-capable model
        max_tokens: 500,
        temperature: 0.3,
        userId,
        tier: 'vision'
      });

      if (result?.content) {
        try {
          const cleanContent = result.content.replace(/```json|```/g, '').trim();
          return JSON.parse(cleanContent);
        } catch (_parseError) {
          return this.createFallbackPhotoAnalysis();
        }
      }

      return this.createFallbackPhotoAnalysis();
    } catch (error) {
      console.error('Photo analysis error:', error);
      return this.createFallbackPhotoAnalysis();
    }
  }

   async analyzeMatchVideo(videoBuffer: Buffer): Promise<VideoAnalysisResult> {
    try {
      // For video analysis, we'd typically extract frames first
      // This is a simplified version - in production, you'd use specialized video processing

      const frames = await this.extractVideoFrames(videoBuffer);
      const analyses = [];

      for (const frame of frames.slice(0, 5)) { // Analyze first 5 frames
        const analysis = await this.analyzeMatchPhoto(frame);
        analyses.push(analysis);
      }

      return this.aggregateVideoAnalysis(analyses);
    } catch (error) {
      console.error('Video analysis error:', error);
      return this.createFallbackVideoAnalysis();
    }
  }

  private async extractVideoFrames(videoBuffer: Buffer): Promise<Buffer[]> {
    // This would use ffmpeg or similar to extract frames
    // For now, return the original buffer as a single frame
    return [videoBuffer];
  }

   private aggregateVideoAnalysis(analyses: PhotoAnalysisResult[]): VideoAnalysisResult {
     const aggregated: VideoAnalysisResult = {
      scene_types: [],
      total_players: 0,
      key_moments: [],
      emotions: [],
      highlight_timestamps: [],
      suggested_title: '',
      confidence: 0,
    };

    analyses.forEach((analysis) => {
      if (analysis.scene_type) {
        aggregated.scene_types.push(analysis.scene_type);
      }
      if (analysis.players_visible) {
        aggregated.total_players = Math.max(aggregated.total_players, analysis.players_visible);
      }
      if (analysis.key_moments) {
        aggregated.key_moments.push(...analysis.key_moments);
      }
      if (analysis.emotions) {
        aggregated.emotions.push(...analysis.emotions);
      }
      aggregated.confidence += analysis.confidence || 0;
    });

    aggregated.confidence = aggregated.confidence / analyses.length;
    aggregated.suggested_title = this.generateVideoTitle(aggregated);

    return aggregated;
  }

   private generateVideoTitle(analysis: VideoAnalysisResult): string {
    const sceneTypes = analysis.scene_types;

    if (sceneTypes.includes('goal_celebration')) {
      return '🔥 Epic Goal Celebration!';
    } else if (sceneTypes.includes('action_shot')) {
      return '⚽ Match Highlights';
    } else if (sceneTypes.includes('team_photo')) {
      return '📸 Squad Ready for Battle';
    } else {
      return '🏆 Match Moments';
    }
  }

   async detectPlayerPositions(imageBuffer: Buffer, userId?: string): Promise<PositionDetectionResult> {
    try {
      const base64Image = imageBuffer.toString('base64');

       const messages: Parameters<typeof generateInference>[0] = [
         {
           role: 'user',
           content: [
             {
               type: 'text',
              text: `Analyze this football field image and detect player positions.
                     Return a JSON object with:
                     {
                       "formation": "4-4-2" | "3-5-2" | "4-3-3" | "other",
                       "player_positions": [
                         {
                           "position": "GK" | "DF" | "MF" | "FW",
                           "x": number (0-100, left to right),
                           "y": number (0-100, top to bottom),
                           "team": "home" | "away"
                         }
                       ],
                       "tactical_analysis": "brief description of formation and positioning",
                       "confidence": number between 0 and 1
                     }`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: 'high'
              }
            }
          ]
        }
      ];

      const result = await generateInference(messages, {
        modelOverride: 'gpt-4o',
        max_tokens: 800,
        temperature: 0.2,
        userId,
        tier: 'vision'
      });

       if (result?.content) {
         try {
           const cleanContent = result.content.replace(/```json|```/g, '').trim();
           const parsed = JSON.parse(cleanContent) as PositionDetectionResult;
           return parsed;
         } catch (_parseError) {
           return this.createFallbackPositionAnalysis();
         }
       }

       return this.createFallbackPositionAnalysis();
    } catch (error) {
      console.error('Position detection error:', error);
      return this.createFallbackPositionAnalysis();
    }
  }

   async detectMatchEvents(imageData: Buffer | ArrayBuffer | string): Promise<string[]> {
     try {
       // Logic for match event detection from photo
       // For now, call analyzeMatchPhoto as it already includes scene/moment analysis
       const analysis = await this.analyzeMatchPhoto(imageData);
       return analysis.key_moments || [];
     } catch (error) {
       console.error('Event detection error:', error);
       return [];
     }
   }

   private createFallbackPhotoAnalysis(): PhotoAnalysisResult {
     return {
      scene_type: 'other',
      players_visible: 0,
      key_moments: ['Photo uploaded'],
      emotions: ['neutral'],
      suggested_caption: 'Match moment captured 📸',
      confidence: 0.1,
    };
  }

   private createFallbackVideoAnalysis(): VideoAnalysisResult {
     return {
      scene_types: ['other'],
      total_players: 0,
      key_moments: ['Video uploaded'],
      emotions: ['neutral'],
      highlight_timestamps: [],
      suggested_title: '🎥 Match Video',
      confidence: 0.1,
    };
  }

   private createFallbackPositionAnalysis(): PositionDetectionResult {
     return {
      formation: 'other',
      player_positions: [],
      tactical_analysis: 'Unable to analyze player positions',
      confidence: 0.1,
    };
  }

   async generateMatchHighlights(_videoBuffer: Buffer, events: HighlightEventInput[]): Promise<MatchHighlightsResult> {
     try {
       // This would involve more sophisticated video processing
       // For now, return a simplified highlight structure

       const highlights = events.map((event, _index) => ({
         timestamp: event.minute * 60, // Convert minutes to seconds
         type: event.type,
         description: event.description,
         importance: this.calculateEventImportance(event),
         suggested_clip_duration: this.getSuggestedClipDuration(event.type),
       }));

       return {
         highlights: highlights.sort((a, b) => b.importance - a.importance),
         total_duration: highlights.reduce((sum, h) => sum + h.suggested_clip_duration, 0),
         suggested_music: this.suggestBackgroundMusic(events),
         confidence: 0.8,
       };
     } catch (error) {
       console.error('Highlight generation error:', error);
       return {
         highlights: [],
         total_duration: 0,
         suggested_music: 'upbeat',
         confidence: 0.1,
       };
     }
   }

   private calculateEventImportance(event: HighlightEventInput): number {
     const importanceMap: Record<string, number> = {
      'goal': 10,
      'red_card': 9,
      'penalty': 8,
      'assist': 7,
      'yellow_card': 5,
      'substitution': 3,
    };

    return importanceMap[event.type as string] || 1;
  }

  private getSuggestedClipDuration(eventType: string): number {
    const durationMap: Record<string, number> = {
      'goal': 15,
      'red_card': 10,
      'penalty': 12,
      'assist': 8,
      'yellow_card': 5,
      'substitution': 3,
    };

    return durationMap[eventType] || 5;
  }

   private suggestBackgroundMusic(events: HighlightEventInput[]): string {
    const goalCount = events.filter(e => e.type === 'goal').length;
    const cardCount = events.filter(e => e.type === 'red_card' || e.type === 'yellow_card').length;

    if (goalCount >= 3) return 'epic';
    if (cardCount >= 2) return 'dramatic';
    return 'upbeat';
  }
}