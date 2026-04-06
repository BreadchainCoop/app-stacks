export interface DepositInterval {
  id: string;
  label: string; // "5 minutes", "weekly", "monthly"
  description?: string; // "5 minutes", "7 days", "30 days"
  seconds: number;
}
