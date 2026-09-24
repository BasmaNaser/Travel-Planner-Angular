export interface Review {
  _id?: string;
  Rating: number;
  Comment?: string;
  Platform?: string;
  CreatedAt?: string;
  UserID?: string;
  DestinationID: string;
  ComplaintID?: string | null;
  createdAt?: string;
  updatedAt?: string;
}