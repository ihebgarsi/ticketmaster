export type Ticket = {
  type: string;
  price: number;
  quantity: number;
  id: string;
  event: Event;
  eventId: string;
  seatLabel: string;
  section: string;
  row: string;
  priceCents: number;
  status: TicketStatus;
  reservedUntil: Date;
  order: Order;
  orderId: string;
  createdAt: Date;
};

export enum TicketStatus {
  Available,
  Reserved,
  Sold,
}