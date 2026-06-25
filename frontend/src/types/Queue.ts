export type QueueStatus = {
  position: number | null;
  size: number;
  admitted: boolean;
  admissionLimit: number;
};
