'use client';

import { useState, useEffect } from 'react';
import Post from '@/components/order-list';

interface Order {
  _id: string;
  title: string;
  content: string;
  authorName?: string;
  createdAt: string;
}

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch('/api/orders');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        if (data.success && data.orders) {
          setOrders(data.orders);
        } else {
          throw new Error(data.error || 'Failed to fetch orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-8 px-4 sm:px-0">
      <h1 className="text-2xl font-bold text-foreground mb-4">Your Orders</h1>
      {orders.length === 0 ? (
        <div className="text-muted-foreground">No orders found.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <Post
              key={order._id}
              id={order._id}
              title={order.title}
              content={order.content}
              authorName={order.authorName || 'Unknown'}
              createdAt={new Date(order.createdAt).toLocaleDateString()}
            />
          ))}
        </div>
      )}
    </div>
  );
} 