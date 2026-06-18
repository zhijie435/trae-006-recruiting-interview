import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MockRepository, getHoursUntil } from '../core/mock.repository';
import {
  OfferFollowUp,
  OfferFollowUpStatus,
  OfferFollowUpQueryParams,
  PaginatedOfferFollowUps,
  FollowUpRecordInput,
  FollowUpRecord
} from '../models/offer-follow-up.model';

const TRANSITIONS: Record<OfferFollowUpStatus, OfferFollowUpStatus[]> = {
  PENDING: ['ACCEPTED', 'REJECTED', 'EXPIRED'],
  ACCEPTED: ['ONBOARDED'],
  REJECTED: [],
  EXPIRED: ['PENDING'],
  ONBOARDED: []
};

@Injectable({ providedIn: 'root' })
export class OfferFollowUpService {
  constructor(private repo: MockRepository) {}

  query(params: OfferFollowUpQueryParams): Observable<PaginatedOfferFollowUps> {
    let list = this.repo.getOffers();

    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      list = list.filter(o =>
        o.offerNo.toLowerCase().includes(kw) ||
        o.candidateName.toLowerCase().includes(kw) ||
        o.position.toLowerCase().includes(kw) ||
        o.candidatePhone.includes(kw) ||
        o.candidateEmail.toLowerCase().includes(kw)
      );
    }

    if (params.status) {
      list = list.filter(o => o.status === params.status);
    }

    if (params.department) {
      list = list.filter(o => o.department === params.department);
    }

    if (params.owner) {
      list = list.filter(o => o.owner === params.owner);
    }

    if (params.slaRisk) {
      list = list.filter(o => {
        if (o.status !== 'PENDING') return false;
        const h = getHoursUntil(o.expireAt);
        if (params.slaRisk === 'OVERDUE') return h <= 0;
        if (params.slaRisk === 'WARNING') return h > 0 && h <= 24;
        if (params.slaRisk === 'NORMAL') return h > 24;
        return true;
      });
    }

    const total = list.length;
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const start = (page - 1) * pageSize;
    const paged = list.slice(start, start + pageSize);

    return of({ list: paged, total });
  }

  getById(id: string): Observable<OfferFollowUp | null> {
    return of(this.repo.getOfferById(id));
  }

  getDepartments(): Observable<string[]> {
    const set = new Set(this.repo.getOffers().map(o => o.department));
    return of(Array.from(set));
  }

  getOwners(): Observable<string[]> {
    const set = new Set(this.repo.getOffers().map(o => o.owner));
    return of(Array.from(set));
  }

  transitionStatus(id: string, target: OfferFollowUpStatus): Observable<boolean> {
    const offer = this.repo.getOfferById(id);
    if (!offer) return of(false);
    const allowed = TRANSITIONS[offer.status] || [];
    if (!allowed.includes(target)) return of(false);
    const updated = this.repo.updateOffer(id, { status: target });
    return of(!!updated);
  }

  addFollowUpRecord(input: FollowUpRecordInput): Observable<boolean> {
    const record: FollowUpRecord = {
      id: this.repo.genId('rec'),
      offerId: input.offerId,
      channel: input.channel,
      templateId: input.templateId,
      templateName: input.templateName,
      content: input.content,
      result: input.result,
      operator: input.operator,
      operatedAt: new Date().toISOString(),
      nextFollowUpAt: input.nextFollowUpAt
    };
    const ok = this.repo.addFollowUpRecord(input.offerId, record);
    return of(ok);
  }

  batchAddFollowUpRecord(ids: string[], input: Omit<FollowUpRecordInput, 'offerId'>): Observable<boolean> {
    ids.forEach(id => {
      this.addFollowUpRecord({ ...input, offerId: id }).subscribe();
    });
    return of(true);
  }
}
