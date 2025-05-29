'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Bot, 
  User,
  X
} from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { geminiAI } from '@/lib/gemini';

interface VoiceChatDialogProps {
  language: 'en' | 'he';
  role: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function VoiceChatDialog({ 
  language, 
  role, 
  isOpen, 
  onOpenChange 
}: VoiceChatDialogProps) {
  const { currentRecord, activeAnomalies } = useDashboard();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [conversation, setConversation] = useState<Array<{role: 'user' | 'assistant', text: string}>>([]);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Audio level monitoring
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(average / 255);
    
    animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
  }, []);

  // Text to speech
  const speakText = useCallback(async (text: string) => {
    if (!synthRef.current) return;
    
    setIsSpeaking(true);
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'he' ? 'he-IL' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
    };
    
    synthRef.current.speak(utterance);
  }, [language]);

  // Handle user speech input
  const handleUserSpeech = useCallback(async (transcript?: string) => {
    if (!transcript) return;
    
    setConversation(prev => [...prev, { role: 'user', text: transcript }]);
    
    try {
      // Update Gemini context
      geminiAI.updateContext({
        flightData: currentRecord,
        anomalies: activeAnomalies,
        role: role,
        language: language
      });

      // Get AI response
      const response = await geminiAI.sendMessage(transcript);
      const aiText = response.content;
      
      setConversation(prev => [...prev, { role: 'assistant', text: aiText }]);
      setCurrentText(aiText);
      
      // Speak the response
      await speakText(aiText);
      
    } catch (err) {
      console.error('Error getting AI response:', err);
      setError(language === 'he' ? 'שגיאה בקבלת תשובה' : 'Error getting response');
    }
  }, [currentRecord, activeAnomalies, role, language, speakText, setConversation, setCurrentText, setError]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'he' ? 'he-IL' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentText(transcript);
        handleUserSpeech(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError(language === 'he' ? 'שגיאה בזיהוי קול' : 'Speech recognition error');
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [language, handleUserSpeech]);

  // Initialize audio context for visualization
  const initializeAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      microphoneRef.current.connect(analyserRef.current);
      
      return stream;
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError(language === 'he' ? 'שגיאה בגישה למיקרופון' : 'Error accessing microphone');
      return null;
    }
  }, [language]);

  // Start listening
  const startListening = useCallback(async () => {
    if (!recognitionRef.current) {
      setError(language === 'he' ? 'זיהוי קול לא נתמך' : 'Speech recognition not supported');
      return;
    }
    
    setError(null);
    setCurrentText('');
    
    const stream = await initializeAudio();
    if (!stream) return;
    
    setIsListening(true);
    monitorAudioLevel();
    
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Error starting recognition:', err);
      setIsListening(false);
    }
  }, [initializeAudio, monitorAudioLevel, language]);

  // Stop listening
  const stopListening = useCallback(() => {
    setIsListening(false);
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  }, []);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      stopSpeaking();
    };
  }, [stopListening, stopSpeaking]);

  useEffect(() => {
    if (isListening) {
      handleUserSpeech();
    }
  }, [isListening, handleUserSpeech]);

  // Audio visualization component
  const AudioVisualizer = () => {
    const bars = Array.from({ length: 5 }, (_, i) => {
      const height = isListening ? Math.max(0.1, audioLevel + Math.random() * 0.3) : 0.1;
      return (
        <div
          key={i}
          className="bg-primary rounded-full transition-all duration-150"
          style={{
            width: '4px',
            height: `${height * 40}px`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      );
    });

    return (
      <div className="flex items-center justify-center gap-1 h-12">
        {bars}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0">
        <DialogTitle className="sr-only">
          {language === 'he' ? 'דיבור חי עם AI' : 'Live Voice Chat with AI'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {language === 'he' 
            ? 'דיאלוג דיבור חי עם עוזר התעופה'
            : 'Live voice conversation with aviation assistant'
          }
        </DialogDescription>
        
        <div className="p-6 text-center space-y-6" dir={language === 'he' ? 'rtl' : 'ltr'}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {language === 'he' ? 'דיבור חי עם AI' : 'Live Voice Chat'}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Audio Visualizer */}
          <div className="py-8">
            <div className="relative">
              <div className={`w-24 h-24 rounded-full border-4 mx-auto flex items-center justify-center ${
                isListening ? 'border-primary bg-primary/10' : 'border-gray-300'
              } ${isSpeaking ? 'animate-pulse border-green-500 bg-green-50' : ''}`}>
                {isSpeaking ? (
                  <Bot className="h-8 w-8 text-green-600" />
                ) : isListening ? (
                  <User className="h-8 w-8 text-primary" />
                ) : (
                  <Mic className="h-8 w-8 text-gray-600" />
                )}
              </div>
              
              {(isListening || isSpeaking) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <AudioVisualizer />
                </div>
              )}
            </div>
          </div>

          {/* Current Text */}
          {currentText && (
            <div className="bg-muted p-4 rounded-lg max-h-32 overflow-y-auto">
              <p className="text-sm">{currentText}</p>
            </div>
          )}

          {/* Conversation History */}
          {conversation.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto space-y-2">
              {conversation.slice(-4).map((msg, index) => (
                <div key={index} className={`text-xs ${msg.role === 'user' ? 'text-blue-600' : 'text-green-600'}`}>
                  <strong>{msg.role === 'user' ? (language === 'he' ? 'אתה:' : 'You:') : 'AI:'}</strong> {msg.text}
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <Button
              variant={isListening ? "destructive" : "default"}
              size="lg"
              onClick={isListening ? stopListening : startListening}
              className="rounded-full w-16 h-16"
              disabled={isSpeaking}
            >
              {isListening ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>
            
            {isSpeaking && (
              <Button
                variant="outline"
                size="lg"
                onClick={stopSpeaking}
                className="rounded-full w-16 h-16"
              >
                <VolumeX className="h-6 w-6" />
              </Button>
            )}
          </div>

          {/* Instructions */}
          <p className="text-xs text-muted-foreground">
            {isListening 
              ? (language === 'he' ? 'מקשיב...' : 'Listening...')
              : isSpeaking
              ? (language === 'he' ? 'מדבר...' : 'Speaking...')
              : (language === 'he' ? 'לחץ על המיקרופון כדי להתחיל לדבר' : 'Click the microphone to start speaking')
            }
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
