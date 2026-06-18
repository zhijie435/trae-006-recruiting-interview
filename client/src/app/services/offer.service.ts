import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Offer,
  OfferQueryParams,
  OfferStatistics,
  OfferFormInput,
  PaginatedOffers
} from '../models/offer.model';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private apiUrl = 'http://localhost:3000/api/offers';

  constructor(private http: HttpClient) {}

  getOffers(params: OfferQueryParams): Observable<PaginatedOffers> {
    let httpParams = new HttpParams();
    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.department) httpParams = httpParams.set('department', params.department);
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.http.get<PaginatedOffers>(this.apiUrl, { params: httpParams });
  }

  getStatistics(): Observable<OfferStatistics> {
    return this.http.get<OfferStatistics>(`${this.apiUrl}/statistics`);
  }

  getOffer(id: string): Observable<Offer> {
    return this.http.get<Offer>(`${this.apiUrl}/${id}`);
  }

  createOffer(data: OfferFormInput, operator = 'system'): Observable<Offer> {
    let httpParams = new HttpParams().set('operator', operator);
    return this.http.post<Offer>(this.apiUrl, data, { params: httpParams });
  }

  updateOffer(id: string, data: Partial<OfferFormInput>, operator = 'system'): Observable<Offer> {
    let httpParams = new HttpParams().set('operator', operator);
    return this.http.put<Offer>(`${this.apiUrl}/${id}`, data, { params: httpParams });
  }

  submitOffer(id: string, comment: string, operator = 'system'): Observable<Offer> {
    return this.http.post<Offer>(`${this.apiUrl}/${id}/submit`, { comment, operator });
  }

  approve(id: string, comment: string, operator = '审批人'): Observable<Offer> {
    return this.http.post<Offer>(`${this.apiUrl}/${id}/approve`, { comment, operator });
  }

  reject(id: string, comment: string, operator = '审批人'): Observable<Offer> {
    return this.http.post<Offer>(`${this.apiUrl}/${id}/reject`, { comment, operator });
  }

  rollback(id: string, comment: string, operator = '审批人'): Observable<Offer> {
    return this.http.post<Offer>(`${this.apiUrl}/${id}/rollback`, { comment, operator });
  }

  send(id: string, comment: string, operator = 'system'): Observable<Offer> {
    return this.http.post<Offer>(`${this.apiUrl}/${id}/send`, { comment, operator });
  }

  accept(id: string, comment: string, operator = 'system'): Observable<Offer> {
    return this.http.post<Offer>(`${this.apiUrl}/${id}/accept`, { comment, operator });
  }

  decline(id: string, comment: string, operator = 'system'): Observable<Offer> {
    return this.http.post<Offer>(`${this.apiUrl}/${id}/decline`, { comment, operator });
  }

  withdraw(id: string, comment: string, operator = 'system'): Observable<Offer> {
    return this.http.post<Offer>(`${this.apiUrl}/${id}/withdraw`, { comment, operator });
  }
}
