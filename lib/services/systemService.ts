import apiClient from '../apiClient';

export type SystemStatus = {
  status: 'operational' | 'degraded' | 'down';
  message: string;
  region: string;
  checkedAt: string;
  latencyMs: number;
};

const FALLBACK_STATUS: SystemStatus = {
  status: 'degraded',
  message: 'Using cached metrics until the backend is reachable.',
  region: 'global',
  checkedAt: new Date().toISOString(),
  latencyMs: 120,
};

export async function getSystemStatus(): Promise<SystemStatus> {
  try {
    const { data } = await apiClient.get<SystemStatus>('/health');
    return data;
  } catch (error) {
    if (__DEV__) {
      console.warn('Using fallback status due to API error:', error);
    }
    return { ...FALLBACK_STATUS, checkedAt: new Date().toISOString() };
  }
}

