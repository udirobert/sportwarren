import OpenAI from 'openai';
import { createReadStream } from 'fs';
import { writeFile } from 'fs/promises';

export class VoiceProcessingService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async transcribeAudio(audioBuffer: Buffer, language: string = 'en'): Promise<string> {
    try {
      // Save buffer to temporary file
      const tempPath = `/tmp/audio_${Date.now()}.wav`;
      await writeFile(tempPath, audioBuffer);

      // Transcribe using Whisper
      const response = await this.openai.audio.transcriptions.create({
        file: createReadStream(tempPath),
        model: 'whisper-1',
        language,
        response_format: 'text',
        temperature: 0.2, // Lower temperature for more accurate transcription
      });

      return response;
    } catch (error) {
      console.error('Voice transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  async processVoiceMatchLog(transcription: string): Promise<any> {
    try {
      const prompt = `
        Extract structured match data from this voice transcription of a football match:
        "${transcription}"
        
        Return a JSON object with this exact structure:
        {
          "events": [
            {
              "type": "goal" | "assist" | "substitution" | "yellow_card" | "red_card" | "penalty",
              "player": "player name",
              "minute": number,
              "description": "description of what happened"
            }
          ],
          "score": {
            "home": number,
            "away": number
          },
          "opponent": "opponent team name",
          "result": "win" | "loss" | "draw",
          "summary": "brief summary of the match",
          "confidence": number between 0 and 1
        }
        
        If you can't extract specific information, use null values.
        Be conservative with confidence scores - only use high confidence for clear, unambiguous information.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that extracts structured sports data from natural language descriptions. Always return valid JSON with the exact structure requested.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 800,
        temperature: 0.1, // Very low temperature for consistent structured output
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        try {
          const parsed = JSON.parse(content);
          return this.validateMatchData(parsed);
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
          return this.createFallbackResponse(transcription);
        }
      }

      return this.createFallbackResponse(transcription);
    } catch (error) {
      console.error('Voice processing error:', error);
      return this.createFallbackResponse(transcription);
    }
  }

  private validateMatchData(data: any): any {
    // Validate and sanitize the extracted data
    const validated = {
      events: Array.isArray(data.events) ? data.events.filter(event => 
        event.type && ['goal', 'assist', 'substitution', 'yellow_card', 'red_card', 'penalty'].includes(event.type)
      ) : [],
      score: {
        home: typeof data.score?.home === 'number' ? data.score.home : null,
        away: typeof data.score?.away === 'number' ? data.score.away : null,
      },
      opponent: typeof data.opponent === 'string' ? data.opponent : null,
      result: ['win', 'loss', 'draw'].includes(data.result) ? data.result : null,
      summary: typeof data.summary === 'string' ? data.summary : null,
      confidence: typeof data.confidence === 'number' ? Math.max(0, Math.min(1, data.confidence)) : 0.5,
    };

    return validated;
  }

  private createFallbackResponse(transcription: string): any {
    return {
      events: [],
      score: { home: null, away: null },
      opponent: null,
      result: null,
      summary: transcription,
      confidence: 0.1,
      error: 'Could not extract structured data from transcription',
    };
  }

  async generateMatchNarrative(matchData: any): Promise<string> {
    try {
      const prompt = `
        Create an engaging match report for a grassroots football match with the following details:
        
        Teams: ${matchData.homeTeam} vs ${matchData.awayTeam}
        Score: ${matchData.homeScore}-${matchData.awayScore}
        Key Events: ${JSON.stringify(matchData.events)}
        Player Stats: ${JSON.stringify(matchData.playerStats)}
        
        Write it in a fun, engaging style that captures the spirit of grassroots football.
        Focus on the drama, key moments, and standout performances.
        Keep it under 200 words and make it feel like a local sports journalist wrote it.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a sports journalist who specializes in grassroots football. Write engaging, fun match reports that celebrate the spirit of amateur football. Use vivid language and capture the emotion of the game.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || 'Match completed successfully!';
    } catch (error) {
      console.error('Narrative generation error:', error);
      return 'Match completed successfully!';
    }
  }

  async processRealTimeCommentary(audioChunk: Buffer): Promise<any> {
    try {
      // For real-time processing, we might use streaming transcription
      const transcription = await this.transcribeAudio(audioChunk);
      
      // Quick extraction of immediate events
      const quickEvents = await this.extractQuickEvents(transcription);
      
      return {
        transcription,
        events: quickEvents,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Real-time commentary processing error:', error);
      return null;
    }
  }

  private async extractQuickEvents(transcription: string): Promise<any[]> {
    // Quick pattern matching for immediate events
    const events = [];
    const text = transcription.toLowerCase();

    // Goal detection
    if (text.includes('goal') || text.includes('scored')) {
      events.push({
        type: 'goal',
        confidence: 0.8,
        timestamp: Date.now(),
      });
    }

    // Card detection
    if (text.includes('yellow card') || text.includes('booked')) {
      events.push({
        type: 'yellow_card',
        confidence: 0.7,
        timestamp: Date.now(),
      });
    }

    if (text.includes('red card') || text.includes('sent off')) {
      events.push({
        type: 'red_card',
        confidence: 0.9,
        timestamp: Date.now(),
      });
    }

    return events;
  }
}