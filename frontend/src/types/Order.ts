import { Ticket } from "./Ticket";

export type Order = {
  id: string;
  user: User;
  userId: string;
  tickets: Ticket[];
  totalCents: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
};
export enum OrderStatus {
  PENDING,
  COMPLETED,
  CANCELLED,
}
