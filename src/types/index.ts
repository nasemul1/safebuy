export interface UserPayload {
  id: string;
  email: string;
  role: "USER" | "MODERATOR" | "ADMIN";
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: {
    message: string;
    code: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
