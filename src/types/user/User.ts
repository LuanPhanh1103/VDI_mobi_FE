export interface Permission {
  name: string;
  description: string;
}

export interface Role {
  name: string;
  description: string;
  permissions: Permission[];
}

export interface User {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  gender: string | null;
  age: number | null;
  roles: Role[];
  virtualDesktops: Desktop[];
}

export interface Desktop {
  name: string;
  ip: string | null;
  password: string | null;
  id: string;
  hasGPU: string | null;
  port: string | null;
  gpu: string | null;
  ram: string | null;
  volumeSize: string | null;
  volumeType: string | null;
  cpu: string | null;
  userId: string | null;
  projectId: string | null;
}
