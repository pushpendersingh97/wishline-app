import apiClient from '../apiClient';

export interface SubTask {
  description: string;
  isCompleted: boolean;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  targetDate: string;
  status: 'not started' | 'in progress' | 'completed';
  progress: number;
  userId: string;
  subTasks?: SubTask[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  category: string;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  targetDate: string;
  status: 'not started' | 'in progress' | 'completed';
  progress?: number;
  subTasks?: SubTask[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  category?: string;
  priority?: 'HIGH' | 'NORMAL' | 'LOW';
  targetDate?: string;
  status?: 'not started' | 'in progress' | 'completed';
  progress?: number;
  subTasks?: SubTask[];
}

export interface TaskResponse {
  success: boolean;
  message: string;
  data: Task | Task[];
}

export const taskService = {
  getAllTasks: async (): Promise<Task[]> => {
    const response = await apiClient.get<TaskResponse>('/task');
    // Handle empty array or single task
    if (Array.isArray(response.data.data)) {
      return response.data.data;
    }
    // If data is a single task object, wrap it in an array
    if (response.data.data && typeof response.data.data === 'object') {
      return [response.data.data];
    }
    // If data is empty/null/undefined, return empty array
    return [];
  },

  getTaskById: async (id: string): Promise<Task> => {
    const response = await apiClient.get<TaskResponse>(`/task/${id}`);
    return Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
  },

  getTasksByUserId: async (userId: string): Promise<Task[]> => {
    const response = await apiClient.get<TaskResponse>(`/task/${userId}`);
    // Handle empty array or single task
    if (Array.isArray(response.data.data)) {
      return response.data.data;
    }
    // If data is a single task object, wrap it in an array
    if (response.data.data && typeof response.data.data === 'object') {
      return [response.data.data];
    }
    // If data is empty/null/undefined, return empty array
    return [];
  },

  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await apiClient.post<TaskResponse>('/task', data);
    return Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
  },

  updateTask: async (taskId: string, data: UpdateTaskRequest): Promise<Task> => {
    const response = await apiClient.put<TaskResponse>(`/task/${taskId}`, data);
    return Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await apiClient.delete(`/task/${taskId}`);
  },
};

