import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <nz-layout style="min-height: 100vh;">
      <nz-layout>
        <nz-header style="background: #001529; padding: 0 24px; display: flex; align-items: center;">
          <div style="color: #fff; font-size: 18px; font-weight: 600; margin-right: 48px; cursor: pointer;" (click)="router.navigate(['/evaluations'])">
            <i nz-icon nzType="team" style="margin-right: 8px;"></i>
            招聘面试管理系统
          </div>
          <ul nz-menu nzTheme="dark" nzMode="horizontal" style="flex: 1; border: 0;">
            <li nz-menu-item (click)="router.navigate(['/evaluations'])" [nzSelected]="selectedMenu === 'evaluations'">
              <i nz-icon nzType="edit" style="margin-right: 8px;"></i>
              我的评价
              <nz-badge [nzCount]="stats.overdueCount" nzSize="small" [nzOffset]="[4, -2]" *ngIf="stats.overdueCount > 0" style="margin-left: 4px;"></nz-badge>
            </li>
            <li nz-menu-item (click)="router.navigate(['/offers'])" [nzSelected]="selectedMenu === 'offers'">
              <i nz-icon nzType="audit" style="margin-right: 8px;"></i>
              Offer 管理
            </li>
            <li nz-menu-item (click)="router.navigate(['/reminders'])" [nzSelected]="selectedMenu === 'reminders'">
              <i nz-icon nzType="bell" style="margin-right: 8px;"></i>
              评价催办
            </li>
            <li nz-menu-item (click)="router.navigate(['/conflicts'])" [nzSelected]="selectedMenu === 'conflicts'">
              <i nz-icon nzType="calendar" style="margin-right: 8px;"></i>
              日程冲突
              <nz-badge [nzCount]="stats.conflictPendingCount" nzSize="small" [nzOffset]="[4, -2]" *ngIf="stats.conflictPendingCount > 0" style="margin-left: 4px;"></nz-badge>
            </li>
          </ul>
          <div style="color: rgba(255,255,255,0.65); font-size: 14px;">
            <i nz-icon nzType="user" style="margin-right: 4px;"></i>
            面试官
          </div>
        </nz-header>
        <nz-content style="padding: 0;">
          <router-outlet></router-outlet>
        </nz-content>
      </nz-layout>
    </nz-layout>
  `
})
export class AppComponent implements OnInit {
  selectedMenu = 'evaluations';
  stats = { overdueCount: 0, conflictPendingCount: 0 };

  constructor(public router: Router) {}

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.selectedMenu = this.router.url.split('/')[1] || 'evaluations';
    });
  }
}
