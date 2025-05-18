import 'server-only';
import { auth } from "@clerk/nextjs/server";
import CONFIG, { Environment } from "@template/global-config";

const currentEnv = process.env.ENVIRONMENT as Environment;

// Base API request implementation for server actions
export async function serverRequest<T>(
  endpoint: string,
  method = 'GET',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
): Promise<T> {
  const baseUrl = CONFIG[currentEnv].API_URL.endsWith('/') ?
    CONFIG[currentEnv].API_URL
    : `${CONFIG[currentEnv].API_URL}/`;
  const fullUrl = `${baseUrl}${endpoint}`;
  try {
    // Get auth token for the current user
    const { getToken } = await auth();
    const sessionToken = await getToken({ template: CONFIG.CLERK_TOKEN_TEMPLATE });

    if (!sessionToken) {
      console.error('❌ serverRequest', 'Unauthorized: No session token available');
      throw new Error('Unauthorized: No session token available');
    }

    // Configure fetch options
    const fetchConfig: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      },
      // Disable Next.js cache for these requests
      cache: 'no-store',
    };

    // Add body for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && data) {
      fetchConfig.body = JSON.stringify(data);
    }

    // Make the request
    const response = await fetch(fullUrl, fetchConfig);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized access');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Return undefined for 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    // Parse the response
    const text = await response.text();

    // Return empty object for empty responses
    if (!text || text.trim() === '') {
      return {} as T;
    }

    // Parse JSON
    return JSON.parse(text) as T;
  } catch (error) {
    console.error('🔴 serverRequest', 'Server API request failed:', error, fullUrl);
    throw error;
  }
}