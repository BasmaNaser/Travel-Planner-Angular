export interface SignupRequest {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
  ConfirmedNewPassword: string;
}

export interface LoginUser {
  id: string;
  _id?: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
}

export interface LoginResponse {
  success?: boolean;
  message?: string;
  data?: {
    accessToken?: string;
    user?: LoginUser;
  };
  accessToken?: string;
  user?: LoginUser;
}
