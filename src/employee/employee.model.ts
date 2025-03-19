export class Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar: string | null;
  department: string;
  role: string;
  clock_in: string | null;
  clock_out: string | null;
  break_start: string | null;
  break_end: string | null;   
  break_total: string | null;
  total_time: string | null;
  status: string;
  breakToggle: boolean|false;
}