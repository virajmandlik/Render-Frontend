console.log('Environment:', import.meta.env.MODE);
console.log('API URL from env:', import.meta.env.VITE_API_URL);

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('Final API_BASE_URL:', API_BASE_URL); 