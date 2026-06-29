export type QueueStatus = {
  position: number | null;
  size: number;
  admitted: boolean;
  admissionLimit: number;
  effectiveAdmissionLimit: number;
  ticketsAvailable: number;
  ticketsUnsold: number;
  soldOut: boolean;
};
