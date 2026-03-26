import axios from 'axios';
import { 
  TechnicalsRequest, TechnicalsResponse, 
  ComparativeRequest, ComparativeResponse, 
  RiskRequest, RiskResponse 
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getTickers = async (): Promise<string[]> => {
  const response = await api.get('/tickers');
  return response.data;
};

export const getTechnicals = async (req: TechnicalsRequest): Promise<TechnicalsResponse> => {
  const response = await api.post('/technicals', req);
  return response.data;
};

export const getComparative = async (req: ComparativeRequest): Promise<ComparativeResponse> => {
  const response = await api.post('/comparative', req);
  return response.data;
};

export const getRisk = async (req: RiskRequest): Promise<RiskResponse> => {
  const response = await api.post('/risk', req);
  return response.data;
};

export const refreshData = async (): Promise<{ message: string }> => {
  const response = await api.post('/refresh');
  return response.data;
};
