export interface Payload {
  id: string;
  email: string;
}

export interface Users {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: string;
  updatedAt: Date;
  createdAt: Date;
}

export interface DatabaseUsers {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: string;
  updated_at: Date;
  created_at: Date;
}

export interface LoginUser {
  id: string;
  fullName: string;
  email: string;
}

export interface UpdateUser {
  fullName: string;
  email: string;
  createdAt: Date;
}

export type UserRole = "USER" | "ADMIN";

export type TaskStatus = "Pending" | "InProgress" | "Completed";
export type TaskPriority = "Low" | "Medium" | "High";

export interface Tasks {
  id: string;
  userId: string;
  title: string;
  body: string;
  status: TaskStatus;
  priority: TaskPriority;
}

export type DatabaseTasksStatus = "Pending" | "In_progress" | "Completed";

export interface DatabaseTasks {
  id: string;
  user_id: string;
  title: string;
  body: string;
  status: DatabaseTasksStatus;
  priority: TaskPriority;
}

export interface UpdateTask {
  title: string;
  body: string;
  status: TaskStatus;
  priority: TaskPriority;
}
