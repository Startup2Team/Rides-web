export type LoginResult = {
  status: string;
  challenge_token?: string;
  access_token?: string;
  refresh_token?: string;
  role_state?: string;
  user_id?: string;
  admin_role?: string;
  permissions?: string[];
  full_name?: string;
  email?: string;
};
