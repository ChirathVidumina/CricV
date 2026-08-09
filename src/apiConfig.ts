/**
 * CricV Deployed Backend API Configuration
 * 
 * Base URL pointing to Render NestJS + PostgreSQL Backend Service
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://cricv-backend.onrender.com';

export const API_ENDPOINTS = {
  TEAMS: `${API_BASE_URL}/teams`,
  GET_TEAM_BY_ID: (id: string) => `${API_BASE_URL}/teams/${id}`,
  ADD_PLAYER: (teamId: string) => `${API_BASE_URL}/teams/${teamId}/players`,
  DELETE_TEAM: (id: string) => `${API_BASE_URL}/teams/${id}`,
};
