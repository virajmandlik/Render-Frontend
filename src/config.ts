// For debugging
console.log('Environment:', import.meta.env.MODE);
console.log('API URL from env:', import.meta.env.VITE_API_URL);

// Hardcode the production URL for now to ensure it works
export const API_BASE_URL = 'https://render-backend-2664.onrender.com';

console.log('Final API_BASE_URL:', API_BASE_URL); 