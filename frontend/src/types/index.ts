export interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
}

export interface SystemMetrics {
  cpu: {
    percent: number;
    cores: number;
  };
  memory: {
    percent: number;
    used_gb: number;
    total_gb: number;
  };
  disk: {
    percent: number;
    used_gb: number;
    total_gb: number;
  };
  uptime: {
    seconds: number;
    formatted: string;
  };
}

export interface Service {
  name: string;
  full_name: string;
  load_state: string;
  active_state: string;
  sub_state: string;
  description: string;
}

export interface NetworkInterface {
  name: string;
  addresses: Array<{
    family: string;
    address: string;
    netmask: string;
    broadcast: string;
  }>;
  is_up: boolean;
  speed: number;
  mtu: number;
}