import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ConflictQueryParams,
  ConflictPaginatedResult,
  ConflictStatistics,
  ConflictHistoryItem
} from '../models/conflict.model';

@Injectable({
  providedIn: 'root'
})
export class ConflictService {
  private apiUrl = 'http://localhost:3000/api/conflicts';

  constructor(private http: HttpClient) {}

  getConflicts(params: ConflictQueryParams): Observable<ConflictPaginatedResult> {
    let httpParams = new HttpParams();
    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
    if (params.department) httpParams = httpParams.set('department', params.department);
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.http.get<ConflictPaginatedResult>(this.apiUrl, { params: httpParams });
  }

  getStatistics(): Observable<ConflictStatistics> {
    return this.http.get<ConflictStatistics>(`${this.apiUrl}/statistics`);
  }

  sendConflictReminder(conflictKey: string, note?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, { conflictKey, note });
  }

  sendBatchConflictReminders(
    conflictKeys: string[],
    note?: string
  ): Observable<{ success: number; failed: number; results: any[] }> {
    return this.http.post<{ success: number; failed: number; results: any[] }>(
      `${this.apiUrl}/send-batch`,
      { conflictKeys, note }
    );
  }

  getConflictHistory(conflictKey: string): Observable<ConflictHistoryItem[]> {
    let httpParams = new HttpParams();
    httpParams = httpParams.set('conflictKey', conflictKey);
    return this.http.get<ConflictHistoryItem[]>(`${this.apiUrl}/history`, { params: httpParams });
  }
}
