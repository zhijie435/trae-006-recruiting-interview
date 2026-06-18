import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Candidate,
  CandidateDetail,
  CandidateCommunication,
  CandidateQueryParams,
  CommunicationQueryParams,
  CandidateStatistics,
  PaginatedResult
} from '../models/candidate.model';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private apiUrl = 'http://localhost:3000/api/candidates';

  constructor(private http: HttpClient) {}

  getCandidates(params: CandidateQueryParams): Observable<PaginatedResult<Candidate>> {
    let httpParams = new HttpParams();
    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
    if (params.department) httpParams = httpParams.set('department', params.department);
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.http.get<PaginatedResult<Candidate>>(this.apiUrl, { params: httpParams });
  }

  getCandidateDetail(id: string): Observable<CandidateDetail> {
    return this.http.get<CandidateDetail>(`${this.apiUrl}/${id}`);
  }

  getCandidateStatistics(id: string): Observable<CandidateStatistics> {
    return this.http.get<CandidateStatistics>(`${this.apiUrl}/${id}/statistics`);
  }

  getCommunications(candidateId: string, params?: CommunicationQueryParams): Observable<PaginatedResult<CandidateCommunication>> {
    let httpParams = new HttpParams();
    if (params?.type) httpParams = httpParams.set('type', params.type);
    if (params?.operatorRole) httpParams = httpParams.set('operatorRole', params.operatorRole);
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.http.get<PaginatedResult<CandidateCommunication>>(`${this.apiUrl}/${candidateId}/communications`, { params: httpParams });
  }

  addCommunication(candidateId: string, data: Partial<CandidateCommunication>): Observable<CandidateCommunication> {
    return this.http.post<CandidateCommunication>(`${this.apiUrl}/${candidateId}/communications`, data);
  }

  updateCommunication(commId: string, data: Partial<CandidateCommunication>): Observable<CandidateCommunication> {
    return this.http.put<CandidateCommunication>(`${this.apiUrl}/communications/${commId}`, data);
  }

  deleteCommunication(commId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/communications/${commId}`);
  }
}
