import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ScheduleConflict,
  ScheduleConflictQueryParams,
  PaginatedResult,
  ScheduleConflictStatistics,
  CommunicationRecord,
  SendReminderTarget
} from '../models/schedule-conflict.model';

@Injectable({
  providedIn: 'root'
})
export class ScheduleConflictService {
  private apiUrl = 'http://localhost:3000/api/schedule-conflicts';

  constructor(private http: HttpClient) {}

  getConflicts(params: ScheduleConflictQueryParams): Observable<PaginatedResult<ScheduleConflict>> {
    let httpParams = new HttpParams();
    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
    if (params.conflictType) httpParams = httpParams.set('conflictType', params.conflictType);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.priority) httpParams = httpParams.set('priority', params.priority);
    if (params.assignee) httpParams = httpParams.set('assignee', params.assignee);
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.http.get<PaginatedResult<ScheduleConflict>>(this.apiUrl, { params: httpParams });
  }

  getStatistics(): Observable<ScheduleConflictStatistics> {
    return this.http.get<ScheduleConflictStatistics>(`${this.apiUrl}/statistics`);
  }

  getConflictById(id: string): Observable<ScheduleConflict> {
    return this.http.get<ScheduleConflict>(`${this.apiUrl}/${id}`);
  }

  createConflict(data: Partial<ScheduleConflict>): Observable<ScheduleConflict> {
    return this.http.post<ScheduleConflict>(this.apiUrl, data);
  }

  updateConflict(id: string, data: Partial<ScheduleConflict> & { operator?: string }): Observable<ScheduleConflict> {
    return this.http.put<ScheduleConflict>(`${this.apiUrl}/${id}`, data);
  }

  deleteConflict(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`);
  }

  addCommunication(id: string, data: Partial<CommunicationRecord>): Observable<ScheduleConflict> {
    return this.http.post<ScheduleConflict>(`${this.apiUrl}/${id}/communications`, data);
  }

  sendReminder(id: string, targets?: SendReminderTarget[], note?: string): Observable<{ success: number; failed: number; results: any[] }> {
    return this.http.post<{ success: number; failed: number; results: any[] }>(`${this.apiUrl}/${id}/send-reminder`, { targets, note });
  }
}
