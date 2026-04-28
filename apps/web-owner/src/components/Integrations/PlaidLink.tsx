'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { CreditCard, Loader2 } from 'lucide-react';

interface PlaidLinkProps {
  restaurantId: string;
  onSuccess?: () => void;
}

export default function PlaidLink({ restaurantId, onSuccess }: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLinkToken = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/plaid/create-link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId }),
      });
      const data = await response.json();
      setLinkToken(data.link_token);
    } catch (error) {
      console.error('Failed to fetch link token:', error);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchLinkToken();
  }, [fetchLinkToken]);

  const onPlaidSuccess = useCallback(async (public_token: string) => {
    try {
      await fetch('http://localhost:3001/plaid/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicToken: public_token, restaurantId }),
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to exchange token:', error);
    }
  }, [restaurantId, onSuccess]);

  const { open, ready } = usePlaidLink({
    token: linkToken!,
    onSuccess: onPlaidSuccess,
  });

  return (
    <button
      onClick={() => open()}
      disabled={!ready || loading}
      className="btn-primary flex items-center gap-2 w-full justify-center disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <CreditCard className="w-5 h-5" />
          Connect Bank Account
        </>
      )}
    </button>
  );
}
