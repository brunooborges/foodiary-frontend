import axios from 'axios';

export const httpClient = axios.create({
  baseURL: 'https://0htdnvgbpa.execute-api.us-east-1.amazonaws.com',
});
