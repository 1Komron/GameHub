const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://game-hub-back.duckdns.org';

let jwtToken: string | null = null;

export const loginWithTelegram = async (initData: string | undefined): Promise<void> => {
    if (!initData) {
        throw new Error('No initData provided');
    }
    const response = await fetch(`${BASE_URL}/api/auth/telegram`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({initData}),
    });

    if (!response.ok) {
        throw new Error('Failed to login with Telegram');
    }

    const result = await response.json();
    console.log('[DIAG] AUTH RESPONSE', result);
    jwtToken = result.data.accessToken;
    console.log('[DIAG] JWT TOKEN', jwtToken);
};

export const getToken = (): string | null => jwtToken;

export const authHeaders = () => ({
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json',
});
