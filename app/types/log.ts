import { UUID } from 'crypto';

export type Log = {
  id: UUID;
  service_name: string;
  process: string;
  load_avg_1m: Number;
  load_avg_5m: Number;
  load_avg_15m: Number;
};
