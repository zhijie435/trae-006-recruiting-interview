import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  OfferFollowUp,
  OfferFollowUpStatus,
  OfferFollowUpQueryParams,
  PaginatedOfferFollowUps,
  FollowUpRecord,
  FollowUpChannel,
  SlaRiskLevel
} from '../models/offer-follow-up.model';
import { MockRepository, getSlaRiskLevel } from '../core/mock.repository';

@Injectable({ providedIn: 'root' })
export class OfferFollowUpService {
  constructor(private repo: MockRepository) {}

  canTransition(current: OfferFollowUpStatus, target: OfferFollowUpStatus): boolean {
    const transitions: Record<OfferFollowUpStatus, OfferFollowUpStatus[]> = {
      PENDING: ['ACCEPTED', 'REJECTED', 'EXPIRED'],
      ACCEPTED: ['ONBOARDED'],
      REJECTED: [],
      EXPIRED: ['PENDING'],
      ONBOARDED: []
    };
    return (transitions[current] || []).includes(target);
  }

  query(params: OfferFollowUpQueryParams): Observable<PaginatedOfferFollowUps> {
    let list = this.repo.getOffers();

    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      list = list.filter((o: OfferFollowUp) =>
        o.candidateName.toLowerCase().includes(kw) ||
        o.offerNo.toLowerCase().includes(kw) ||
        o.position.toLowerCase().includes(kw) ||
        o.candidatePhone.includes(kw) ||
        o.candidateEmail.toLowerCase().includes(kw)
      );
    }

    if (params.status) {
      list = list.filter((o: OfferFollowUp) => o.status === params.status);
    }

    if (params.department) {
      list = list.filter((o: OfferFollowUp) => o.department === params.department);
    }

    if (params.owner) {
      list = list.filter((o: OfferFollowUp) => o.owner === params.owner);
    }

    if (params.slaRisk) {
      list = list.filter((o: OfferFollowUp) => {
        const level = getSlaRiskLevel(o.expireAt, o.status);
        return level === params.slaRisk;
      });
    }

    list.sort((a: OfferFollowUp, b: OfferFollowUp) => {
      if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
      if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const total = list.length;
    const start = (page - 1) * pageSize;

    return of({
      list: list.slice(start, start + pageSize),
      total,
      page,
      pageSize
    });
  }

  getById(id: string): Observable<OfferFollowUp | undefined> {
    const offer = this.repo.getOfferById(id);
    if (offer) {
      offer.followUpRecords = [...offer.followUpRecords].sort(
        (a, b) => new Date(b.operatedAt).getTime() - new Date(a.operatedAt).getTime()
      );
    }
    return of(offer);
  }

  getDepartments(): Observable<string[]> {
    const depts = new Set(this.repo.getOffers().map((o: OfferFollowUp) => o.department));
    return of(Array.from(depts).sort());
  }

  getOwners(): Observable<string[]> {
    const owners = new Set(this.repo.getOffers().map((o: OfferFollowUp) => o.owner));
    return of(Array.from(owners).sort());
  }

  addFollowUpRecord(data: {
    offerId: string;
    channel: FollowUpChannel;
    templateId?: string;
    templateName?: string;
    content: string;
    result: string;
    nextFollowUpAt?: string;
    operator: string;
  }): Observable<FollowUpRecord> {
    const record = this.repo.addRecord(data);
    return of(record);
  }

  batchAddFollowUpRecord(offerIds: string[], data: {
    channel: FollowUpChannel;
    templateId?: string;
    templateName?: string;
    content: string;
    result: string;
    nextFollowUpAt?: string;
    operator: string;
  }): Observable<FollowUpRecord[]> {
    const records: FollowUpRecord[] = offerIds.map(id =>
      this.repo.addRecord({ ...data, offerId: id })
    );
    return of(records);
  }

  transitionStatus(id: string, target: OfferFollowUpStatus, remark?: string): Observable<OfferFollowUp | undefined> {
    const offer = this.repo.getOfferById(id);
    if (!offer) return of(undefined);
    if (!this.canTransition(offer.status, target)) return of(undefined);

    const patch: Partial<OfferFollowUp> = { status: target };
    if (remark) {
      patch.remark = remark;
    }
    const updated = this.repo.updateOffer(id, patch);
    return of(updated);
  }

  getSlaRisk(expireAt: string, status: OfferFollowUpStatus): SlaRiskLevel {
    return getSlaRiskLevel(expireAt, status);
  }
}
