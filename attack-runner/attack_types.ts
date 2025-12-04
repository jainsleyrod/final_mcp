export interface AttackLogEntry {
  timestamp: string;
  attackId: string;
  variant: string;
  step: number;
  request: any;
  responseSnippet: string;
  success: boolean;
}

