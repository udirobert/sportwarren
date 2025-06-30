import OpenAI from 'openai';
import { createReadStream } from 'fs';
import { writeFile } from 'fs/promises';

export class ComputerVisionService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeMatchPhoto(imageBuffer: Buffer): Promise<any> {
    try {
      // Save buffer to temporary file
      const tempPath = `/tmp/image_${Date.now()}.jpg`;
      await writeFile(tempPath, imageBuffer);

      // Convert to base64 for OpenAI Vision API
      const base64Image = imageBuffer.toString('base64');

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
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
        ],
        max_tokens: 500,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        try {
          return JSON.parse(content);
        } catch (parseError) {
          return this.createFallbackPhotoAnalysis();
        }
      }

      return this.createFallbackPhotoAnalysis();
    } catch (error) {
      console.error('Photo analysis error:', error);
      return this.createFallbackPhotoAnalysis();
    }
  }

  async analyzeMatchVideo(videoBuffer: Buffer): Promise<any> {
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

  private aggregateVideoAnalysis(analyses: any[]): any {
    const aggregated = {
      scene_types: [],
      total_players: 0,
      key_moments: [],
      emotions: [],
      highlight_timestamps: [],
      suggested_title: '',
      confidence: 0,
    };

    analyses.forEach((analysis, index) => {
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

  private generateVideoTitle(analysis: any): string {
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

  async detectPlayerPositions(imageBuffer: Buffer): Promise<any> {
    try {
      const base64Image = imageBuffer.toString('base64');

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
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
        ],
        max_tokens: 800,
        temperature: 0.2,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        try {
          return JSON.parse(content);
        } catch (parseError) {
          return this.createFallbackPositionAnalysis();
        }
      }

      return this.createFallbackPositionAnalysis();
    } catch (error) {
      console.error('Position detection error:', error);
      return this.createFallbackPositionAnalysis();
    }
  }

  private createFallbackPhotoAnalysis(): any {
    return {
      scene_type: 'other',
      players_visible: 0,
      key_moments: ['Photo uploaded'],
      emotions: ['neutral'],
      suggested_caption: 'Match moment captured 📸',
      confidence: 0.1,
    };
  }

  private createFallbackVideoAnalysis(): any {
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

  private createFallbackPositionAnalysis(): any {
    return {
      formation: 'other',
      player_positions: [],
      tactical_analysis: 'Unable to analyze player positions',
      confidence: 0.1,
    };
  }

  async generateMatchHighlights(videoBuffer: Buffer, events: any[]): Promise<any> {
    try {
      // This would involve more sophisticated video processing
      // For now, return a simplified highlight structure
      
      const highlights = events.map((event, index) => ({
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

  private calculateEventImportance(event: any): number {
    const importanceMap = {
      'goal': 10,
      'red_card': 9,
      'penalty': 8,
      'assist': 7,
      'yellow_card': 5,
      'substitution': 3,
    };

    return importanceMap[event.type] || 1;
  }

  private getSuggestedClipDuration(eventType: string): number {
    const durationMap = {
      'goal': 15,
      'red_card': 10,
      'penalty': 12,
      'assist': 8,
      'yellow_card': 5,
      'substitution': 3,
    };

    return durationMap[eventType] || 5;
  }

  private suggestBackgroundMusic(events: any[]): string {
    const goalCount = events.filter(e => e.type === 'goal').length;
    const cardCount = events.filter(e => e.type === 'red_card' || e.type === 'yellow_card').length;

    if (goalCount >= 3) return 'epic';
    if (cardCount >= 2) return 'dramatic';
    return 'upbeat';
  }
}