import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Evaluation,
  EvaluationDetailResponse,
  PendingEvaluationItem,
  PendingEvaluationQueryParams,
  PaginatedResult,
  EvaluationStatistics
} from '../models/reminder.model';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private apiUrl = 'http://localhost:3000/api/evaluations';

  constructor(private http: HttpClient) {}

  getPendingList(params: PendingEvaluationQueryParams): Observable<PaginatedResult<PendingEvaluationItem>> {
    let httpParams = new HttpParams();
    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.interviewerId) httpParams = httpParams.set('interviewerId', params.interviewerId);
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.http.get<PaginatedResult<PendingEvaluationItem>>(`${this.apiUrl}/pending`, { params: httpParams });
  }

  getStatistics(interviewerId?: string): Observable<EvaluationStatistics> {
    let httpParams = new HttpParams();
    if (interviewerId) httpParams = httpParams.set('interviewerId', interviewerId);
    return this.http.get<EvaluationStatistics>(`${this.apiUrl}/statistics`, { params: httpParams });
  }

  getEvaluation(interviewId: string): Observable<EvaluationDetailResponse> {
    return this.http.get<EvaluationDetailResponse>(`${this.apiUrl}/${interviewId}`);
  }

  saveDraft(interviewId: string, data: Partial<Evaluation>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${interviewId}/save`, data);
  }

  submitEvaluation(interviewId: string, data: Partial<Evaluation>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${interviewId}/submit`, data);
  }
}
