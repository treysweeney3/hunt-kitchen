'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type MessageState = { type: 'success' | 'error'; text: string } | null;

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Thanks for subscribing!' });
        setEmail('');
      } else {
        const data = await response.json();
        if (response.status === 400 && data.error === 'Email is already subscribed') {
          setMessage({ type: 'error', text: 'This email is already subscribed.' });
        } else {
          setMessage({ type: 'error', text: 'Failed to subscribe. Please try again.' });
        }
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to subscribe. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex w-full gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setMessage(null); }}
          className="flex-1 border-[#2D5A3D]"
          required
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-[#E07C24] hover:bg-[#c96a1e] text-white"
        >
          {isLoading ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </form>
      {message && (
        <p className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
