export type Event = {
  id: string;
  name: string;
  date: string;
  slug: string;
  description: string;
  venue: string;
};

export type TicketAvailability = Partial<Record<"AVAILABLE" | "RESERVED" | "SOLD", number>>;

export type EventDetails = Event & {
  availability: TicketAvailability;
};

export type EventInput = {
  name: string;
  slug: string;
  date: string;
  venue: string;
  description: string;
};
