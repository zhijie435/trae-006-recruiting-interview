import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  DashboardStats,
  TrendPoint,
  OfferFollowUp
} from '../models/offer-follow-up.model';
import { MockRepository, getHoursUntil, formatDate } from '../core/mock.repository';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private repo: MockRepository) {}

  getStats(): Observable<DashboardStats> {
    const offers: OfferFollowUp[] = this.repo.getOffers();

    const pendingCount = offers.filter((o: OfferFollowUp) => o.status === 'PENDING').length;

    const todayDueCount = offers.filter((o: OfferFollowUp) => {
      if (o.status !== 'PENDING') return false;
      const hours = getHoursUntil(o.expireAt);
      return hours > 0 && hours <= 24;
    }).length;

    const overdueCount = offers.filter((o: OfferFollowUp) => {
      if (o.status !== 'PENDING') return false;
      return getHoursUntil(o.expireAt) <= 0;
    }).length;

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekAcceptedCount = offers.filter((o: OfferFollowUp) =>
      o.status === 'ACCEPTED' && new Date(o.updatedAt) >= weekStart
    ).length;
    const weekRejectedCount = offers.filter((o: OfferFollowUp) =>
      o.status === 'REJECTED' && new Date(o.updatedAt) >= weekStart
    ).length;

    const closedOffers: OfferFollowUp[] = offers.filter((o: OfferFollowUp) =>
      o.status === 'ACCEPTED' || o.status === 'REJECTED' || o.status === 'ONBOARDED'
    );
    let totalHours = 0;
    closedOffers.forEach((o: OfferFollowUp) => {
      const diff = new Date(o.updatedAt).getTime() - new Date(o.createdAt).getTime();
      totalHours += diff / (1000 * 60 * 60);
    });
    const avgResponseHours = closedOffers.length > 0
      ? Math.round(totalHours / closedOffers.length)
      : 0;

    const totalClosed = offers.filter((o: OfferFollowUp) =>
      o.status === 'ACCEPTED' || o.status === 'REJECTED' || o.status === 'ONBOARDED'
    ).length;
    const acceptedCount = offers.filter((o: OfferFollowUp) =>
      o.status === 'ACCEPTED' || o.status === 'ONBOARDED'
    ).length;
    const acceptanceRate = totalClosed > 0
      ? Math.round((acceptedCount / totalClosed) * 100)
      : 0;

    return of({
      pendingCount,
      todayDueCount,
      overdueCount,
      weekAcceptedCount,
      weekRejectedCount,
      avgResponseHours,
      acceptanceRate
    });
  }

  getPendingOffersSortedByUrgency(limit = 8): Observable<OfferFollowUp[]> {
    const pending: OfferFollowUp[] = this.repo.getOffers().filter((o: OfferFollowUp) => o.status === 'PENDING');
    pending.sort((a: OfferFollowUp, b: OfferFollowUp) => {
      const ha = getHoursUntil(a.expireAt);
      const hb = getHoursUntil(b.expireAt);
      return ha - hb;
    });
    return of(pending.slice(0, limit));
  }

  getOverdueOffers(limit = 5): Observable<OfferFollowUp[]> {
    const list: OfferFollowUp[] = this.repo.getOffers().filter((o: OfferFollowUp) => {
      if (o.status !== 'PENDING') return false;
      return getHoursUntil(o.expireAt) <= 0;
    });
    list.sort((a: OfferFollowUp, b: OfferFollowUp) => getHoursUntil(a.expireAt) - getHoursUntil(b.expireAt));
    return of(list.slice(0, limit));
  }

  getTrend(days = 14): Observable<TrendPoint[]> {
    const result: TrendPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);

      const offers: OfferFollowUp[] = this.repo.getOffers();
      const accepted = offers.filter((o: OfferFollowUp) => {
        if (o.status !== 'ACCEPTED' && o.status !== 'ONBOARDED') return false;
        const t = new Date(o.updatedAt).getTime();
        return t >= d.getTime() && t < next.getTime();
      }).length;

      const rejected = offers.filter((o: OfferFollowUp) => {
        if (o.status !== 'REJECTED') return false;
        const t = new Date(o.updatedAt).getTime();
        return t >= d.getTime() && t < next.getTime();
      }).length;

      const pending = offers.filter((o: OfferFollowUp) => {
        const created = new Date(o.createdAt).getTime();
        if (created > next.getTime()) return false;
        if (o.status === 'PENDING') return true;
        const updated = new Date(o.updatedAt).getTime();
        return updated >= next.getTime();
      }).length;

      result.push({
        date: formatDate(d.toISOString())!.slice(5),
        accepted,
        rejected,
        pending
      });
    }
    return of(result);
  }
}
