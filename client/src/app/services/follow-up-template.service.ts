import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  FollowUpTemplate,
  FollowUpChannel,
  OfferFollowUp,
  TEMPLATE_VARIABLES
} from '../models/offer-follow-up.model';
import { MockRepository } from '../core/mock.repository';

@Injectable({ providedIn: 'root' })
export class FollowUpTemplateService {
  constructor(private repo: MockRepository) {}

  list(channel?: FollowUpChannel): Observable<FollowUpTemplate[]> {
    return of(this.repo.getTemplates(channel));
  }

  getById(id: string): Observable<FollowUpTemplate | undefined> {
    return of(this.repo.getTemplateById(id));
  }

  create(data: {
    name: string;
    channel: FollowUpChannel;
    content: string;
  }): Observable<FollowUpTemplate> {
    return of(this.repo.createTemplate({
      name: data.name,
      channel: data.channel,
      content: data.content,
      enabled: true
    }));
  }

  update(id: string, data: Partial<Pick<FollowUpTemplate, 'name' | 'channel' | 'content'>>): Observable<FollowUpTemplate | undefined> {
    return of(this.repo.updateTemplate(id, data));
  }

  remove(id: string): Observable<boolean> {
    return of(this.repo.deleteTemplate(id));
  }

  duplicate(id: string): Observable<FollowUpTemplate | undefined> {
    return of(this.repo.duplicateTemplate(id));
  }

  toggleEnabled(id: string, enabled: boolean): Observable<FollowUpTemplate | undefined> {
    return of(this.repo.toggleTemplate(id, enabled));
  }

  render(template: string, offer?: OfferFollowUp): string {
    if (!template) return '';
    let result = template;

    const varMap: Record<string, string> = {
      '{{候选人姓名}}': offer?.candidateName || '{{候选人姓名}}',
      '{{职位名称}}': offer?.position || '{{职位名称}}',
      '{{部门名称}}': offer?.department || '{{部门名称}}',
      '{{薪资待遇}}': offer?.salaryPackage || '{{薪资待遇}}',
      '{{入职日期}}': offer?.entryDate || '{{入职日期}}',
      '{{Offer编号}}': offer?.offerNo || '{{Offer编号}}',
      '{{SLA截止时间}}': offer?.expireAt ? new Date(offer.expireAt).toLocaleString('zh-CN') : '{{SLA截止时间}}'
    };

    for (const key of Object.keys(varMap)) {
      result = result.split(key).join(varMap[key]);
    }

    return result;
  }

  getVariables() {
    return TEMPLATE_VARIABLES;
  }
}
