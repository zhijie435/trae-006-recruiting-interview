import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reminder, ReminderQueryParams, PaginatedResult, Statistics } from '../models/reminder.model';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private apiUrl = 'http://localhost:3000/api/reminders';

  constructor(private http: HttpClient) {}

  getReminders(params: ReminderQueryParams): Observable<PaginatedResult<Reminder>> {
    let httpParams = new HttpParams();
    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
    if (params.evaluationStatus) httpParams = httpParams.set('evaluationStatus', params.evaluationStatus);
    if (params.department) httpParams = httpParams.set('department', params.department);
    if (params.interviewerName) httpParams = httpParams.set('interviewerName', params.interviewerName);
    if (params.overdueDays) httpParams = httpParams.set('overdueDays', params.overdueDays.toString());
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.http.get<PaginatedResult<Reminder>>(this.apiUrl, { params: httpParams });
  }

  getStatistics(): Observable<Statistics> {
    return this.http.get<Statistics>(`${this.apiUrl}/statistics`);
  }

  sendReminder(interviewId: string, note?: string): Observable<Reminder> {
    return this.http.post<Reminder>(`${this.apiUrl}/send`, { interviewId, note });
  }

  sendBatchReminders(interviewIds: string[], note?: string): Observable<{ success: number; failed: number; results: Reminder[] }> {
    return this.http.post<{ success: number; failed: number; results: Reminder[] }>(`${this.apiUrl}/send-batch`, { interviewIds, note });
  }

  getReminderHistory(interviewId: string): Observable<Reminder[]> {
    return this.http.get<Reminder[]>(`${this.apiUrl}/history/${interviewId}`);
  }
}
