import { Order } from "./Order";

export type User = {
  id: String;
  email: string;
  name: string;
  createdAt: Date;
  orders: Order[];
  password: string;
  confirmPassword: string;
  dateOfBirth: Date;
  phone: number;
};
