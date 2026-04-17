import { generateInference, AIMessage } from '@/lib/ai/inference';
import OpenAI from 'openai';
import { createReadStream } from 'fs';
import { writeFile } from 'fs/promises';

export type AudioInput = Buffer | Uint8Array;

export interface VoiceExtractedMatchData {
  events: Array<{
    type: 'goal' | 'assist' | 'substitution' | 'yellow_card' | 'red_card' | 'penalty';
    player?: string;
    minute: number;
    description?: string;
  }>;
  score: { home: number | null; away: number | null };
  opponent: string | null;
  result: 'win' | 'loss' | 'draw' | null;
  summary: string | null;
  confidence: number;
  error?: string;
}

export interface VoiceCommandResult extends VoiceExtractedMatchData {
  matchId?: string;
  transcription: string;
}

export interface RealtimeEvent {
  type: string;
  confidence: number;
  timestamp: number;
}

export interface MatchNarrativeInput {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  events: unknown[];
  playerStats?: unknown[];
}

export class VoiceProcessingService {
  private openai: OpenAI | null = null;

  constructor() {}

  private getClient(): OpenAI {
    if (!this.openai) {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY environment variable is not set');
      }
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    return this.openai;
  }

  async transcribeAudio(audioBuffer: Buffer, userId?: string, language: string = 'en'): Promise<string> {
    try {
      // Check guard
      const { inferenceGuard } = await import('./inference-guard');
      const guard = await inferenceGuard.checkLimit(userId, 'voice');
      if (!guard.allowed) {
        throw new Error(`Voice transcription blocked: ${guard.reason}`);
      }

      // Save buffer to temporary file
      const tempPath = `/tmp/audio_${Date.now()}.wav`;
      const buffer = Buffer.isBuffer(audioBuffer) ? audioBuffer : Buffer.from(audioBuffer as ArrayBuffer);
      await writeFile(tempPath, buffer);

      // Transcribe using Whisper
      const response = await this.getClient().audio.transcriptions.create({
        file: createReadStream(tempPath),
        model: 'whisper-1',
        language,
        response_format: 'text',
        temperature: 0.2, // Lower temperature for more accurate transcription
      });

      // Track usage
      await inferenceGuard.trackUsage(userId, 'voice', 'openai-whisper');

      return response;
    } catch (error) {
      console.error('Voice transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  async processVoiceCommand(audioData: AudioInput, userId?: string, matchId?: string): Promise<VoiceCommandResult> {
    try {
      const audioBuffer = Buffer.isBuffer(audioData) ? audioData : Buffer.from(audioData);
      const transcription = await this.transcribeAudio(audioBuffer, userId);
      const processed = await this.processVoiceMatchLog(transcription, userId);
      return {
        ...processed,
        matchId,
        transcription
      };
    } catch (error) {
      console.error('Voice command processing error:', error);
      throw error;
    }
  }

  async processVoiceMatchLog(transcription: string, userId?: string): Promise<VoiceExtractedMatchData> {
    try {
      const messages: AIMessage[] = [
        { role: 'user', content: transcription }
      ];

      const result = await generateInference(messages, {
        systemPrompt: 'You are an AI assistant that extracts structured sports data from natural language descriptions. Always return valid JSON with the exact structure requested.',
        temperature: 0.1,
        max_tokens: 800,
        userId,
        tier: 'voice'
      });

      if (result?.content) {
        try {
          const cleanContent = result.content.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(cleanContent);
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

  private validateMatchData(data: unknown): VoiceExtractedMatchData {
    // Validate and sanitize the extracted data
    if (typeof data !== 'object' || data === null) {
      return this.createFallbackResponse('') as VoiceExtractedMatchData;
    }
    
    const raw = data as Record<string, unknown>;
    const validEvents = Array.isArray(raw.events) ? raw.events.filter((event): event is Record<string, unknown> => {
      if (typeof event !== 'object' || event === null) return false;
      const e = event as Record<string, unknown>;
      return typeof e.type === 'string' && ['goal', 'assist', 'substitution', 'yellow_card', 'red_card', 'penalty'].includes(e.type);
    }) : [];
    
    const validated: VoiceExtractedMatchData = {
      events: validEvents.map(e => {
        const event = e as Record<string, unknown>;
        return {
          type: event.type as VoiceExtractedMatchData['events'][number]['type'],
          player: typeof event.player === 'string' ? event.player : undefined,
          minute: typeof event.minute === 'number' ? event.minute : 0,
          description: typeof event.description === 'string' ? event.description : undefined,
        };
      }),
      score: (() => {
        const scoreObj = raw.score as { home?: number; away?: number } | undefined;
        return {
          home: typeof scoreObj?.home === 'number' ? scoreObj.home : null,
          away: typeof scoreObj?.away === 'number' ? scoreObj.away : null,
        };
      })(),
      opponent: typeof raw.opponent === 'string' ? raw.opponent : null,
      result: ['win', 'loss', 'draw'].includes(raw.result as string) ? raw.result as 'win' | 'loss' | 'draw' : null,
      summary: typeof raw.summary === 'string' ? raw.summary : null,
      confidence: typeof raw.confidence === 'number' ? Math.max(0, Math.min(1, raw.confidence)) : 0.5,
    };

    return validated;
  }

  private createFallbackResponse(transcription: string): VoiceExtractedMatchData {
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

  async generateMatchNarrative(matchData: any, userId?: string): Promise<string> {
    try {
      const messages: AIMessage[] = [
        {
          role: 'user',
          content: `Teams: ${matchData.homeTeam} vs ${matchData.awayTeam}
                    Score: ${matchData.homeScore}-${matchData.awayScore}
                    Key Events: ${JSON.stringify(matchData.events)}
                    Player Stats: ${JSON.stringify(matchData.playerStats)}`
        }
      ];

      const result = await generateInference(messages, {
        systemPrompt: 'You are a sports journalist who specializes in grassroots football. Write engaging, fun match reports that celebrate the spirit of amateur football. Use vivid language and capture the emotion of the game. Keep it under 200 words.',
        temperature: 0.7,
        max_tokens: 300,
        userId,
        tier: 'text'
      });

      return result?.content || 'Match completed successfully!';
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