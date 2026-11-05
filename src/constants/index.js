// Backend address. Set VITE_API_URL per environment (see .env.example);
// defaults to the local backend.
export const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/$/, "");

// Socket.IO runs on the same host and port as the API.
export const socketURL = (import.meta.env.VITE_SOCKET_URL || baseURL).replace(/\/$/, "");

// Public social-login identifiers (safe to ship in browser code).
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
export const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;

// Where the access token is kept between visits.
export const TOKEN_KEY = "token";
