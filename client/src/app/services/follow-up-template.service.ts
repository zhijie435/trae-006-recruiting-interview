import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MockRepository, formatDate } from '../core/mock.repository';
import {
  FollowUpTemplate,
  FollowUpChannel,
  OfferFollowUp
} from '../models/offer-follow-up.model';

@Injectable({ providedIn: 'root' })
export class FollowUpTemplateService {
  constructor(private repo: MockRepository) {}

  list(): Observable<FollowUpTemplate[]> {
    return of(this.repo.getTemplates());
  }

  create(input: { name: string; channel: FollowUpChannel; content: string }): Observable<FollowUpTemplate> {
    const now = new Date().toISOString();
    const tpl: FollowUpTemplate = {
      id: this.repo.genId('tpl'),
      name: input.name,
      channel: input.channel,
      content: input.content,
      enabled: true,
      createdAt: now,
      updatedAt: now
    };
    this.repo.addTemplate(tpl);
    return of(tpl);
  }

  update(id: string, input: { name: string; channel: FollowUpChannel; content: string }): Observable<FollowUpTemplate | null> {
    return of(this.repo.updateTemplate(id, input));
  }

  toggleEnabled(id: string, enabled: boolean): Observable<boolean> {
    const tpl = this.repo.updateTemplate(id, { enabled });
    return of(!!tpl);
  }

  duplicate(id: string): Observable<FollowUpTemplate | null> {
    const src = this.repo.getTemplateById(id);
    if (!src) return of(null);
    const now = new Date().toISOString();
    const copy: FollowUpTemplate = {
      id: this.repo.genId('tpl'),
      name: `${src.name} (副本)`,
      channel: src.channel,
      content: src.content,
      enabled: src.enabled,
      createdAt: now,
      updatedAt: now
    };
    this.repo.addTemplate(copy);
    return of(copy);
  }

  remove(id: string): Observable<boolean> {
    return of(this.repo.removeTemplate(id));
  }

  render(content: string, offer: OfferFollowUp): string {
    let result = content;
    result = result.replace(/\$\{candidateName\}/g, offer.candidateName || '');
    result = result.replace(/\$\{position\}/g, offer.position || '');
    result = result.replace(/\$\{department\}/g, offer.department || '');
    result = result.replace(/\$\{salaryPackage\}/g, offer.salaryPackage || '');
    result = result.replace(/\$\{entryDate\}/g, offer.entryDate || '');
    result = result.replace(/\$\{offerNo\}/g, offer.offerNo || '');
    result = result.replace(/\$\{expireDate\}/g, formatDate(offer.expireAt) || '');
    result = result.replace(/\$\{owner\}/g, offer.owner || '');
    return result;
  }
}
