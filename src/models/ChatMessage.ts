import mongoose, { Schema, Document } from 'mongoose';

export interface ChatMessageDocument extends Document {
  _id: string;
  userId?: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  language: 'en' | 'he';
  flightContext?: {
    flightNumber?: string;
    timestamp?: Date;
    anomalies?: string[];
  };
  metadata?: {
    model?: string;
    tokens?: number;
    processingTime?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<ChatMessageDocument>({
  userId: { type: String },
  sessionId: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'assistant', 'system'],
    required: true 
  },
  content: { type: String, required: true },
  language: { 
    type: String, 
    enum: ['en', 'he'],
    default: 'en'
  },
  flightContext: {
    flightNumber: { type: String },
    timestamp: { type: Date },
    anomalies: [{ type: String }]
  },
  metadata: {
    model: { type: String },
    tokens: { type: Number },
    processingTime: { type: Number }
  }
}, {
  timestamps: true
});

// Indexes
ChatMessageSchema.index({ sessionId: 1, createdAt: -1 });
ChatMessageSchema.index({ userId: 1, createdAt: -1 });

const ChatMessage = mongoose.models.ChatMessage || mongoose.model<ChatMessageDocument>('ChatMessage', ChatMessageSchema);

export default ChatMessage; 