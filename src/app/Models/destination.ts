export interface Destination {
  _id?: string;
  Name: string;
  Location: string;
  Description: string;
  Image?: string;
  Category: string;
  Duration: number;
  PricePerPerson: number;
  BaseTime: number;
  AvailableSeats: number;
  ThingsToDo: string[];
  UserID?: string;
}