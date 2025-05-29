// src/lib/gemini.ts

import { GoogleGenerativeAI } from '@google/generative-ai';
import { FlightRecord, Anomaly } from '@/types';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyDtvD5fyQ-qL-5xV5fMpDAjlo2ujwEQ-_g';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Chat session management
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audio?: string; // Base64 encoded audio
}

export interface ChatContext {
  flightData: FlightRecord | null;
  anomalies: Anomaly[];
  role: string;
  messages: ChatMessage[];
  language: 'en' | 'he';
}

// System prompt for aviation AI assistant
const SYSTEM_PROMPT = `You are an advanced aviation AI assistant integrated with the AreoVizN AI dashboard. 
You have access to real-time flight data, anomaly detection systems, and comprehensive aviation knowledge.

Your responsibilities:
1. Analyze flight data and provide insights
2. Explain anomalies and their implications
3. Offer role-specific advice (Pilot, Technician, Manager)
4. Answer aviation-related questions
5. Provide safety recommendations

Always prioritize safety and accuracy. Reference specific flight parameters when available.
Adapt your communication style based on the user's role.

IMPORTANT: When the language context is set to 'he', respond in Hebrew. When set to 'en', respond in English.
Keep the same professional tone and technical accuracy in both languages.`;

export class GeminiAviationAI {
  private chatHistory: ChatMessage[] = [];
  private currentContext: ChatContext | null = null;

  constructor() {
    // Load chat history from local storage if available
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('areovizn_chat_history');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        // Convert timestamp strings back to Date objects
        this.chatHistory = parsedHistory.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    }
  }

  updateContext(context: Partial<ChatContext>) {
    this.currentContext = {
      ...(this.currentContext || {
        flightData: null,
        anomalies: [],
        role: 'pilot',
        messages: [],
        language: 'en'
      }),
      ...context
    };
  }

  private saveHistory() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('areovizn_chat_history', JSON.stringify(this.chatHistory));
    }
  }

  private formatContextForAI(): string {
    if (!this.currentContext) return '';

    const { flightData, anomalies, role, language } = this.currentContext;
    
    let contextStr = `Current Language: ${language}\n`;
    contextStr += `Current Role: ${role}\n\n`;

    if (language === 'he') {
      contextStr += `הנתונים הנוכחיים:\n`;
      if (flightData) {
        contextStr += `נתוני טיסה:\n`;
        contextStr += `- שלב טיסה: ${flightData.FlightPhase_FW56211}\n`;
        contextStr += `- גובה: ${flightData.Altitude_AD83212} רגל\n`;
        contextStr += `- גובה תא: ${flightData.CabinAltitude_SD69218} רגל\n`;
        contextStr += `- לחץ תא: ${flightData.CabinPressure_SD6A420} PSI\n`;
        contextStr += `- לחץ דיפרנציאלי: ${flightData.CabinDifferentialPressure_SD64521} PSI\n`;
        contextStr += `- קצב שינוי גובה תא: ${flightData.CabinVS_SD68222} רגל/דקה\n\n`;
      }

      if (anomalies && anomalies.length > 0) {
        contextStr += `חריגות פעילות:\n`;
        anomalies.forEach((anomaly, index) => {
          contextStr += `${index + 1}. ${anomaly.description} (${anomaly.severity})\n`;
          contextStr += `   סוג: ${anomaly.type}\n`;
          contextStr += `   מערכות מושפעות: ${anomaly.affectedSystems.join(', ')}\n\n`;
        });
      }
    } else {
      if (flightData) {
        contextStr += `Flight Data:\n`;
        contextStr += `- Flight Phase: ${flightData.FlightPhase_FW56211}\n`;
        contextStr += `- Altitude: ${flightData.Altitude_AD83212} ft\n`;
        contextStr += `- Cabin Altitude: ${flightData.CabinAltitude_SD69218} ft\n`;
        contextStr += `- Cabin Pressure: ${flightData.CabinPressure_SD6A420} psi\n`;
        contextStr += `- Differential Pressure: ${flightData.CabinDifferentialPressure_SD64521} psi\n`;
        contextStr += `- Cabin VS: ${flightData.CabinVS_SD68222} fpm\n\n`;
      }

      if (anomalies && anomalies.length > 0) {
        contextStr += `Active Anomalies:\n`;
        anomalies.forEach((anomaly, index) => {
          contextStr += `${index + 1}. ${anomaly.description} (${anomaly.severity})\n`;
          contextStr += `   Type: ${anomaly.type}\n`;
          contextStr += `   Affected Systems: ${anomaly.affectedSystems.join(', ')}\n\n`;
        });
      }
    }

    return contextStr;
  }

  async sendMessage(message: string): Promise<ChatMessage> {
    // Get or create session ID
    const sessionId = this.getSessionId();
    
    // Create user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    this.chatHistory.push(userMessage);

    // Save user message to MongoDB
    try {
      await fetch('/api/chat-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          role: 'user',
          content: message,
          language: this.currentContext?.language || 'en',
          flightContext: {
            flightNumber: this.currentContext?.flightData?.FlightPhase_FW56211,
            anomalies: this.currentContext?.anomalies?.map(a => a.id) || []
          }
        })
      });
    } catch (err) {
      console.error('Failed to save user message:', err);
    }

    try {
      // Prepare the full prompt with context
      const language = this.currentContext?.language || 'en';
      const systemPromptWithLang = language === 'he' 
        ? `${SYSTEM_PROMPT}\n\nIMPORTANT: You MUST respond in Hebrew (עברית) for this conversation. Use professional and technical Hebrew terminology.`
        : SYSTEM_PROMPT;

      const contextPrompt = `${systemPromptWithLang}\n\nCurrent Context:\n${this.formatContextForAI()}\n\nChat History:\n${this.formatChatHistory()}\n\nUser: ${message}`;

      // Generate response
      const startTime = Date.now();
      const result = await model.generateContent(contextPrompt);
      const response = await result.response;
      const text = response.text();
      const processingTime = Date.now() - startTime;

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: text,
        timestamp: new Date()
      };

      this.chatHistory.push(assistantMessage);
      this.saveHistory();

      // Save assistant message to MongoDB
      try {
        await fetch('/api/chat-messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            role: 'assistant',
            content: text,
            language: this.currentContext?.language || 'en',
            metadata: {
              model: 'gemini-1.5-flash',
              processingTime
            }
          })
        });
      } catch (err) {
        console.error('Failed to save assistant message:', err);
      }

      return assistantMessage;
    } catch (error) {
      console.error('Gemini AI error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  private getSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('areovizn_session_id');
      if (!sessionId) {
        sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('areovizn_session_id', sessionId);
      }
      return sessionId;
    }
    return 'default-session';
  }

  private formatChatHistory(): string {
    const language = this.currentContext?.language || 'en';
    // Only include last 10 messages for context
    const recentMessages = this.chatHistory.slice(-10);
    return recentMessages
      .map(msg => `${msg.role === 'user' ? (language === 'he' ? 'משתמש' : 'User') : (language === 'he' ? 'עוזר' : 'Assistant')}: ${msg.content}`)
      .join('\n');
  }

  async analyzeAnomaly(anomaly: Anomaly): Promise<string> {
    const prompt = `Analyze this aviation anomaly and provide detailed insights:
    
    Anomaly: ${anomaly.description}
    Type: ${anomaly.type}
    Severity: ${anomaly.severity}
    Affected Systems: ${anomaly.affectedSystems.join(', ')}
    Current Values: ${JSON.stringify(anomaly.currentValues)}
    
    Provide:
    1. Root cause analysis
    2. Immediate actions required
    3. Long-term maintenance recommendations
    4. Safety implications
    5. Similar historical incidents and their resolutions`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  async generateVoiceResponse(text: string, language: 'en' | 'he' = 'en'): Promise<string> {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'he' ? 'he-IL' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        language === 'he' 
          ? voice.lang === 'he-IL'
          : (voice.name.includes('Google US English') || 
             voice.name.includes('Microsoft David') ||
             voice.lang === 'en-US')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      speechSynthesis.speak(utterance);
      return 'Voice response generated';
    }
    
    return 'Voice synthesis not supported';
  }

  async processVoiceInput(language: 'en' | 'he' = 'en'): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        reject('Speech recognition not supported');
        return;
      }

      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = language === 'he' ? 'he-IL' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (event: any) => {
        reject(`Speech recognition error: ${event.error}`);
      };

      recognition.start();
    });
  }

  getChatHistory(): ChatMessage[] {
    return this.chatHistory;
  }

  clearHistory() {
    this.chatHistory = [];
    this.saveHistory();
  }

  async generateFlightReport(flightData: FlightRecord, anomalies: Anomaly[]): Promise<string> {
    const prompt = `Generate a comprehensive flight report based on the following data:
    
    Flight Data:
    ${JSON.stringify(flightData, null, 2)}
    
    Anomalies Detected:
    ${JSON.stringify(anomalies, null, 2)}
    
    Please include:
    1. Executive summary
    2. Flight parameters analysis
    3. Anomaly assessment and recommendations
    4. Safety considerations
    5. Maintenance requirements
    6. Operational recommendations`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}

// Create singleton instance
export const geminiAI = new GeminiAviationAI();
