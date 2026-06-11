const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

let jwtToken: string | null = null;

export const loginWithTelegram = async (initData: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/api/auth/telegram`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ initData }),
  });

  if (!response.ok) {
    throw new Error('Failed to login with Telegram');
  }

  const result = await response.json();
  jwtToken = result.data.accessToken;
};

export const getToken = (): string | null => jwtToken;

export const authHeaders = () => ({
  'Authorization': `Bearer ${jwtToken}`,
  'Content-Type': 'application/json',
});
