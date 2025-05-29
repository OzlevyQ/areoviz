// src/components/dashboard/AIChatPanel.tsx

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  Bot, 
  User, 
  Loader2,
  Trash2,
  Download,
  AlertCircle,
  MessageSquare,
  Languages,
  ChevronDown,
  VolumeX
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDashboard } from '@/contexts/DashboardContext';
import { geminiAI, ChatMessage } from '@/lib/gemini';
import { formatDateTime } from '@/lib/utils';

export default function AIChatPanel() {
  const { currentRecord, activeAnomalies, role } = useDashboard();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'he'>('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isVoiceConversation, setIsVoiceConversation] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingAbortController, setTypingAbortController] = useState<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Load chat history on component mount
  useEffect(() => {
    const history = geminiAI.getChatHistory();
    setMessages(history);
  }, []);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      // Load voices
      const loadVoices = () => {
        const voices = synthRef.current?.getVoices();
        console.log('Available voices:', voices?.length);
        if (voices && voices.length > 0) {
          const heVoices = voices.filter(v => v.lang.startsWith('he'));
          const enVoices = voices.filter(v => v.lang.startsWith('en'));
          console.log('Hebrew voices:', heVoices.length);
          console.log('English voices:', enVoices.length);
        }
      };
      
      // Voices might not be loaded immediately
      if (synthRef.current?.getVoices().length === 0) {
        synthRef.current.addEventListener('voiceschanged', loadVoices);
      } else {
        loadVoices();
      }
    }
  }, []);

  // Initialize speech recognition for voice conversation
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true; // Changed to true for better real-time feedback
      recognitionRef.current.maxAlternatives = 1;
      recognitionRef.current.lang = language === 'he' ? 'he-IL' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          console.log('Final transcript:', finalTranscript);
          handleVoiceMessage(finalTranscript.trim());
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Restart recognition if no speech detected
          setTimeout(() => {
            if (isVoiceConversation && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (err) {
                console.error('Error restarting recognition:', err);
              }
            }
          }, 1000);
        } else if (event.error === 'audio-capture') {
          setError(language === 'he' ? 'בעיה בגישה למיקרופון' : 'Microphone access error');
          setIsVoiceConversation(false);
        } else if (event.error === 'not-allowed') {
          setError(language === 'he' ? 'נדרשת הרשאה למיקרופון' : 'Microphone permission required');
          setIsVoiceConversation(false);
        } else {
          setError(language === 'he' ? 'שגיאה בזיהוי קול' : 'Speech recognition error');
        }
      };

      recognitionRef.current.onend = () => {
        console.log('Recognition ended');
        // Restart if voice conversation is still active
        if (isVoiceConversation) {
          setTimeout(() => {
            if (recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (err) {
                console.error('Error restarting recognition:', err);
              }
            }
          }, 100);
        }
      };
      
      recognitionRef.current.onstart = () => {
        console.log('Recognition started');
      };
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error('Error stopping recognition:', err);
        }
      }
    };
  }, [language]);

  // Update AI context when data changes
  useEffect(() => {
    geminiAI.updateContext({
      flightData: currentRecord,
      anomalies: activeAnomalies,
      role: role,
      messages: messages,
      language: language
    });
  }, [currentRecord, activeAnomalies, role, messages, language]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Move the voice conversation useEffect after all function declarations
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userInput = input;
    setInput('');
    setError(null);
    setIsLoading(true);

    // Add user message with typing effect disabled
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await geminiAI.sendMessage(userInput);
      
      // Add assistant message with typing effect
      const assistantMessage: ChatMessage = {
        ...response,
        content: '' // Start with empty content for typing effect
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Typing effect
      await typeMessage(response.content, assistantMessage.id);
      
      // If voice conversation is active, speak the response
      if (isVoiceConversation) {
        await speakText(response.content);
      }
    } catch (err) {
      setError(language === 'he' ? 'שגיאה בקבלת תשובה מה-AI. נסה שוב.' : 'Failed to get AI response. Please try again.');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function declarations
  async function typeMessageImpl(text: string, messageId: string) {
    const abortController = new AbortController();
    setTypingAbortController(abortController);
    setIsTyping(true);
    
    const chars = text.split('');
    let currentText = '';
    
    try {
      for (let i = 0; i < chars.length; i++) {
        if (abortController.signal.aborted) {
          // Show full text immediately when stopped
          setMessages(prev => prev.map(msg => 
            msg.id === messageId ? { ...msg, content: text } : msg
          ));
          break;
        }
        
        currentText += chars[i];
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, content: currentText + '|' } : msg
        ));
        
        // Variable speed based on character type
        let delay = 30;
        if (chars[i] === ' ') delay = 50;
        if (chars[i] === '.' || chars[i] === '!' || chars[i] === '?') delay = 200;
        if (chars[i] === ',') delay = 100;
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Remove cursor and finalize
      if (!abortController.signal.aborted) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, content: text } : msg
        ));
      }
    } finally {
      setIsTyping(false);
      setTypingAbortController(null);
    }
  }

  async function speakTextImpl(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (!synthRef.current) {
        console.error('Speech synthesis not available');
        resolve();
        return;
      }
      
      setIsAISpeaking(true);
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'he' ? 'he-IL' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1.0;
      
      // Try to select the best voice for the language
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(language === 'he' ? 'he' : 'en') && 
        voice.localService === true
      ) || voices.find(voice => 
        voice.lang.startsWith(language === 'he' ? 'he' : 'en')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        console.log('Using voice:', preferredVoice.name);
      }
      
      utterance.onend = () => {
        console.log('Speech ended');
        setIsAISpeaking(false);
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.error('Speech error:', event);
        setIsAISpeaking(false);
        resolve();
      };
      
      utterance.onstart = () => {
        console.log('Speech started');
      };
      
      synthRef.current.speak(utterance);
    });
  }

  async function handleVoiceMessageImpl(transcript?: string) {
    if (isAISpeaking || (!transcript && !isVoiceConversation) || isLoading) return;
    
    console.log('Processing voice message:', transcript);
    
    // Stop listening temporarily while processing
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    }
    
    if (transcript) {
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: transcript,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
    }
    setIsLoading(true);

    try {
      // Update Gemini context
      geminiAI.updateContext({
        flightData: currentRecord,
        anomalies: activeAnomalies,
        role: role,
        language: language
      });

      // Get AI response
      const response = await geminiAI.sendMessage(transcript || '');
      const aiText = response.content;
      
      // Add assistant message with typing effect
      const assistantMessage: ChatMessage = {
        ...response,
        content: '' // Start with empty content for typing effect
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Typing effect
      await typeMessage(response.content, assistantMessage.id);
      
      // Only speak if voice conversation is still active
      if (isVoiceConversation) {
        await speakText(response.content);
      }
      
      // Resume listening after AI finishes speaking
      setTimeout(() => {
        if (isVoiceConversation && recognitionRef.current) {
          try {
            recognitionRef.current.start();
            console.log('Resumed listening');
          } catch (err) {
            console.error('Error restarting recognition:', err);
          }
        }
      }, 500);
      
    } catch (err) {
      setError(language === 'he' ? 'שגיאה בקבלת תשובה' : 'Error getting response');
      console.error('Voice chat error:', err);
      
      // Resume listening even on error
      setTimeout(() => {
        if (isVoiceConversation && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (err) {
            console.error('Error restarting recognition after error:', err);
          }
        }
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  }

  // useCallback wrappers
  const typeMessage = useCallback(typeMessageImpl, [setMessages, setIsTyping, setTypingAbortController]);
  const speakText = useCallback(speakTextImpl, [language, setIsAISpeaking]);
  const handleVoiceMessage = useCallback(handleVoiceMessageImpl, [
    isAISpeaking, isVoiceConversation, isLoading, currentRecord, activeAnomalies, 
    role, language, typeMessage, speakText
  ]);

  // Voice conversation effect
  useEffect(() => {
    if (isVoiceConversation && !isTyping) {
      handleVoiceMessage();
    }
  }, [isVoiceConversation, isTyping, handleVoiceMessage]);

  // Stop typing effect
  const stopTyping = () => {
    if (typingAbortController) {
      typingAbortController.abort();
    }
  };

  // Toggle voice conversation
  const toggleVoiceConversation = async () => {
    if (isVoiceConversation) {
      // Stop voice conversation
      setIsVoiceConversation(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      setIsAISpeaking(false);
    } else {
      // Request microphone permission first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
        
        // Start voice conversation
        setIsVoiceConversation(true);
        setError(null);
        
        // Add system message explaining voice mode
        const systemMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: language === 'he' 
            ? '🎤 שיחה רציפה התחילה! דבר בחופשיות - אני אקשיב ואענה בקול. לחץ על כפתור העצירה כדי לסיים.'
            : '🎤 Continuous conversation started! Speak freely - I\'ll listen and respond with voice. Click the stop button to end.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, systemMessage]);
        
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (err) {
            console.error('Error starting recognition:', err);
            setError(language === 'he' ? 'שגיאה בהפעלת זיהוי קול' : 'Error starting voice recognition');
          }
        } else {
          setError(language === 'he' ? 'זיהוי קול לא נתמך בדפדפן זה' : 'Speech recognition not supported in this browser');
          setIsVoiceConversation(false);
        }
      } catch (err) {
        console.error('Microphone permission error:', err);
        setError(language === 'he' ? 'נדרשת הרשאה למיקרופון' : 'Microphone permission required');
      }
    }
  };

  // Stop AI speaking
  const stopAISpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsAISpeaking(false);
    }
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setError(null);

    try {
      const transcript = await geminiAI.processVoiceInput(language);
      setInput(transcript);
      setIsListening(false);
      
      if (transcript) {
        setTimeout(() => handleSendMessage(), 500);
      }
    } catch (err) {
      setError(language === 'he' ? 'זיהוי קול נכשל. נסה שוב.' : 'Voice recognition failed. Please try again.');
      console.error('Voice input error:', err);
      setIsListening(false);
    }
  };

  const handleSpeakMessage = async (text: string) => {
    try {
      await geminiAI.generateVoiceResponse(text, language);
    } catch (err) {
      console.error('Voice synthesis error:', err);
    }
  };

  const handleClearChat = () => {
    if (confirm(language === 'he' ? 'האם אתה בטוח שברצונך למחוק את היסטוריית הצ\'אט?' : 'Are you sure you want to clear the chat history?')) {
      geminiAI.clearHistory();
      setMessages([]);
    }
  };

  const handleExportChat = () => {
    const chatData = messages.map(msg => ({
      timestamp: msg.timestamp,
      role: msg.role,
      content: msg.content
    }));

    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `areovizn-chat-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const quickActions = language === 'he' ? [
    'הסבר על חריגות נוכחיות',
    'צור דוח טיסה',
    'הערכת בטיחות',
    'בדיקת תקינות מערכת',
    'המלצות תחזוקה'
  ] : [
    'Explain current anomalies',
    'Generate flight report',
    'Safety assessment',
    'System health check',
    'Maintenance recommendations'
  ];

  const chatContent = (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg" dir={language === 'he' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {language === 'he' ? 'עוזר תעופה AI' : 'AI Aviation Assistant'}
            </h3>
            <p className="text-sm text-gray-600">
              {language === 'he' ? 'מקוון' : 'Online'}
            </p>
          </div>
        </div>
          <div className="flex items-center gap-2">
          {/* Clear History Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearChat}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {language === 'he' ? 'נקה' : 'Clear'}
          </Button>
          
          {/* Export Chat Button */}
            <Button
            variant="outline"
            size="sm"
              onClick={handleExportChat}
            className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
            {language === 'he' ? 'ייצא' : 'Export'}
            </Button>
          
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <span>{language === 'he' ? '🇮🇱' : '🇺🇸'}</span>
                <ChevronDown className="h-3 w-3" />
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                <span className="mr-2">🇺🇸</span>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('he')}>
                <span className="mr-2">🇮🇱</span>
                עברית
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="space-y-4 py-4 px-6">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                {language === 'he' 
                  ? 'עוזר התעופה AI שלך מוכן לעזור'
                  : 'Your AI aviation assistant is ready to help'
                }
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickActions.map((action) => (
                    <Button
                      key={action}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInput(action);
                        setTimeout(() => handleSendMessage(), 100);
                      }}
                    className="bg-card hover:bg-accent"
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
            messages.map((message) => {
              // Check if this is a system message (voice mode notification)
              const isSystemMessage = message.role === 'assistant' && message.content.startsWith('🎤');
              
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  } ${isSystemMessage ? 'justify-center' : ''}`}
                >
                  {isSystemMessage ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-center max-w-md">
                      <p className="text-sm text-blue-700">{message.content}</p>
                    </div>
                  ) : (
                  <div
                    className={`flex gap-3 max-w-[85%] ${
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div
                          className={`rounded-lg px-4 py-2 shadow-sm ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {message.content}
                            {isTyping && message.content.endsWith('|') && message.role === 'assistant' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={stopTyping}
                                className="ml-2 h-5 px-2 text-xs opacity-70 hover:opacity-100"
                              >
                                {language === 'he' ? 'דלג' : 'Skip'}
                              </Button>
                            )}
                          </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                            {formatDateTime(typeof message.timestamp === 'string' ? message.timestamp : message.timestamp.toISOString())}
                        </span>
                        {message.role === 'assistant' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleSpeakMessage(message.content)}
                              disabled={isVoiceConversation}
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        )}
                          {isVoiceConversation && message.role === 'user' && (
                            <div className="flex items-center gap-1">
                              <Mic className="h-3 w-3 text-blue-500" />
                              <span className="text-xs text-blue-500">
                                {language === 'he' ? 'קולי' : 'Voice'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
            )}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
              <div className="bg-muted rounded-lg px-4 py-2 shadow-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                {isTyping && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={stopTyping}
                    className="h-6 px-2 text-xs"
                  >
                    {language === 'he' ? 'דלג' : 'Skip'}
                  </Button>
                )}
              </div>
              </div>
            )}
            {error && (
            <div className="flex items-center gap-2 text-destructive text-sm mx-6">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

      <div className="p-4 border-t bg-card/50">
        {/* Browser compatibility warning */}
        {typeof window !== 'undefined' && !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
          <div className="mb-3 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            {language === 'he' 
              ? '⚠️ הדפדפן שלך לא תומך בזיהוי קול. השתמש ב-Chrome או Edge לחוויה מיטבית.'
              : '⚠️ Your browser doesn\'t support speech recognition. Use Chrome or Edge for the best experience.'
            }
          </div>
        )}
        
        {/* Voice conversation status */}
        {isVoiceConversation && (
          <div className="mb-3 flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              {/* Audio visualization */}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 bg-gradient-to-t ${
                      isAISpeaking 
                        ? 'from-green-400 to-green-600' 
                        : 'from-blue-400 to-blue-600'
                    } rounded-full animate-pulse`}
                    style={{
                      height: `${8 + Math.random() * 16}px`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '0.8s'
                    }}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {isAISpeaking 
                  ? (language === 'he' ? 'AI מדבר...' : 'AI speaking...')
                  : (language === 'he' ? 'מקשיב...' : 'Listening...')
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isAISpeaking && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={stopAISpeaking}
                  className="h-7 px-2"
                >
                  <VolumeX className="h-4 w-4" />
                  <span className="text-xs ml-1">
                    {language === 'he' ? 'השתק' : 'Mute'}
                  </span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleVoiceConversation}
                className="h-7 px-2 text-red-600 hover:text-red-700"
              >
                <MicOff className="h-4 w-4" />
                <span className="text-xs ml-1">
                  {language === 'he' ? 'עצור' : 'Stop'}
                </span>
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex w-full gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={language === 'he' 
              ? 'שאל על נתוני טיסה, חריגות או תעופה...'
              : 'Ask about flight data, anomalies, or aviation...'
            }
            className="flex-1 px-4 py-2 text-sm rounded-md border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading || isVoiceConversation}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleVoiceInput}
            disabled={isLoading || isVoiceConversation}
            className={`bg-card hover:bg-accent ${isListening ? 'bg-red-100 border-red-300' : ''}`}
            title={language === 'he' ? 'הקלט קולי' : 'Voice input'}
          >
            {isListening ? <MicOff className="h-4 w-4 text-red-600" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button
            variant={isVoiceConversation ? 'destructive' : 'default'}
            size="icon"
            onClick={toggleVoiceConversation}
            disabled={isLoading}
            className={isVoiceConversation ? '' : 'bg-green-600 hover:bg-green-700'}
            title={isVoiceConversation 
              ? (language === 'he' ? 'עצור שיחה רציפה' : 'Stop continuous conversation')
              : (language === 'he' ? 'התחל שיחה רציפה' : 'Start continuous conversation')
            }
          >
            {isVoiceConversation ? <MicOff className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading || isVoiceConversation}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="relative flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-200 shadow-sm"
          >
            <Bot className="h-4 w-4 text-blue-600" />
            <span className="hidden sm:inline">
              {language === 'he' ? 'עוזר AI' : 'AI Assistant'}
            </span>
            {messages.length > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[800px] p-0">
          <DialogTitle className="sr-only">
            {language === 'he' ? 'עוזר תעופה AI' : 'AI Aviation Assistant'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {language === 'he' 
              ? 'דיאלוג צ\'אט עם עוזר התעופה המבוסס על בינה מלאכותית'
              : 'Chat dialog with AI-powered aviation assistant'
            }
          </DialogDescription>
          {chatContent}
        </DialogContent>
      </Dialog>
    </>
  );
}
