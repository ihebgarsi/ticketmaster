export type CheckoutOrder = {
  id: string;
  totalCents: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  tickets: Array<{
    id: string;
    seatLabel: string;
    section: string;
    row: string;
    priceCents: number;
    reservedUntil: string | null;
    event: {
      id: string;
      name: string;
      date: string;
      venue: string;
    };
  }>;
};
