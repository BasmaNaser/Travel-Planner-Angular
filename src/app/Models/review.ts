export interface Review {
  _id?: string;
  Rating: number;
  Comment?: string;
  Platform?: string;
  CreatedAt?: string;

  UserID?: {
    _id: string;
    fullName: string;
    email: string;
  };

  DestinationID: string;
  ComplaintID?: string | null;

  createdAt?: string;
  updatedAt?: string;

  isDeleted?: boolean;
  deletedReason?: string;
  deletedAt?: string;
  deletedNoticeRead?: boolean;
}