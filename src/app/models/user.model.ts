import { Permission } from './permission.model';
export interface User {
  id: string;
  username: string;
  email?: string;
  name: string;
  token: string;          // ✅ access token
  refreshToken: string;   // ✅ refresh token
  permissions: Permission[];
  roles: string[];
}
