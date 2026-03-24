export interface AuthState {
  isAuthenticated: boolean;
  role: "guest" | "user" | "admin";
  idToken: string | null;
}
