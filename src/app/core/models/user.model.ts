export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  token: string;          // ✅ access token
  refreshToken: string;   // ✅ refresh token
}
