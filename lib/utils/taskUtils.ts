import type { Task } from '@/lib/services/taskService';

/**
 * Convert backend priority format to frontend format
 */
export function convertPriorityToFrontend(
  priority: 'HIGH' | 'NORMAL' | 'LOW',
): 'High' | 'Medium' | 'Low' {
  const mapping: Record<'HIGH' | 'NORMAL' | 'LOW', 'High' | 'Medium' | 'Low'> = {
    HIGH: 'High',
    NORMAL: 'Medium',
    LOW: 'Low',
  };
  return mapping[priority];
}

/**
 * Convert frontend priority format to backend format
 */
export function convertPriorityToBackend(
  priority: 'High' | 'Medium' | 'Low',
): 'HIGH' | 'NORMAL' | 'LOW' {
  const mapping: Record<'High' | 'Medium' | 'Low', 'HIGH' | 'NORMAL' | 'LOW'> = {
    High: 'HIGH',
    Medium: 'NORMAL',
    Low: 'LOW',
  };
  return mapping[priority];
}

/**
 * Convert backend status format to frontend format
 */
export function convertStatusToFrontend(
  status: 'not started' | 'in progress' | 'completed',
): 'Not Started' | 'In Progress' | 'Completed' {
  const mapping: Record<
    'not started' | 'in progress' | 'completed',
    'Not Started' | 'In Progress' | 'Completed'
  > = {
    'not started': 'Not Started',
    'in progress': 'In Progress',
    completed: 'Completed',
  };
  return mapping[status];
}

/**
 * Convert frontend status format to backend format
 */
export function convertStatusToBackend(
  status: 'Not Started' | 'In Progress' | 'Completed',
): 'not started' | 'in progress' | 'completed' {
  const mapping: Record<
    'Not Started' | 'In Progress' | 'Completed',
    'not started' | 'in progress' | 'completed'
  > = {
    'Not Started': 'not started',
    'In Progress': 'in progress',
    Completed: 'completed',
  };
  return mapping[status];
}

