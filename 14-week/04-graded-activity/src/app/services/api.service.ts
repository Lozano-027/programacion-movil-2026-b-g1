import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map } from 'rxjs';
import { environment } from '../../environments/environment';

/** Tarea tal como la devuelve la API Task Manager (TaskResponse). */
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'PENDING' | 'COMPLETED';
  dueDate: string | null;
  overdue: boolean;
}

interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  /** Petición protegida: el interceptor le agrega "Authorization: Bearer <token>". */
  getTasks(): Promise<Task[]> {
    return firstValueFrom(
      this.http
        .get<PageResponse<Task>>(`${environment.apiUrl}/tasks`, { params: { size: 50 } })
        .pipe(map((page) => page.content)),
    );
  }
}
