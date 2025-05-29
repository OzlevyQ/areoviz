import mongoose, { Schema, Document } from 'mongoose';

export interface OrderDocument extends Document {
  title: string;
  content: string;
  authorEmail: string;
  authorName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<OrderDocument>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  authorEmail: { type: String, required: true },
  authorName: { type: String }
}, {
  timestamps: true
});

// Create indexes for better query performance
OrderSchema.index({ authorEmail: 1, createdAt: -1 });

const Order = mongoose.models.Order || mongoose.model<OrderDocument>('Order', OrderSchema);

export default Order; 