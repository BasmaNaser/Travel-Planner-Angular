export interface User {
  _id?: string;
  id?: string;
  email: string;
  fullName: string;
  phone: string;
  dob: string | Date;
  about?: string;
  gender?: 'Male' | 'Female' | 'Other';
  profilePicture?: string;
  profilePicturePublicId?: string;
  userLocation?: string;
  role: 'user' | 'admin';
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  gender?: 'Male' | 'Female' | 'Other';
  about?: string;
  userLocation?: string;
  dob?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ContactRequest {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}
