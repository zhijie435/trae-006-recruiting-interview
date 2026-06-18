import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReminderService } from './services/reminder.service';
import { ScheduleConflictService } from './services/schedule-conflict.service';

@Component({
  selector: 'app-root',
  template: `
    <nz-layout style="min-height: 100vh;">
      <nz-layout>
        <nz-header style="background: #001529; padding: 0 24px; display: flex; align-items: center;">
          <div style="color: #fff; font-size: 18px; font-weight: 600; margin-right: 48px; cursor: pointer;" (click)="router.navigate(['/candidates'])">
            <i nz-icon nzType="team" style="margin-right: 8px;"></i>
            招聘面试管理系统
          </div>
          <ul nz-menu nzTheme="dark" nzMode="horizontal" style="flex: 1; border: 0;" [nzSelectedKeys]="selectedMenu">
            <li nz-menu-item (click)="router.navigate(['/candidates'])" nzValue="candidates">
              <i nz-icon nzType="user" style="margin-right: 8px;"></i>
              候选人管理
            </li>
            <li nz-menu-item (click)="router.navigate(['/schedule-conflicts'])" nzValue="schedule-conflicts">
              <i nz-icon nzType="warning" style="margin-right: 8px;"></i>
              日程冲突
              <nz-badge [nzCount]="conflictStats.pendingCount" nzSize="small" [nzOffset]="[4, -2]" *ngIf="conflictStats.pendingCount > 0" style="margin-left: 4px;"></nz-badge>
            </li>
            <li nz-menu-item (click)="router.navigate(['/evaluations'])" nzValue="evaluations">
              <i nz-icon nzType="edit" style="margin-right: 8px;"></i>
              我的评价
              <nz-badge [nzCount]="stats.overdueCount" nzSize="small" [nzOffset]="[4, -2]" *ngIf="stats.overdueCount > 0" style="margin-left: 4px;"></nz-badge>
            </li>
            <li nz-menu-item (click)="router.navigate(['/reminders'])" nzValue="reminders">
              <i nz-icon nzType="bell" style="margin-right: 8px;"></i>
              评价催办
            </li>
            <li nz-menu-item (click)="router.navigate(['/offers'])" nzValue="offers">
              <i nz-icon nzType="audit" style="margin-right: 8px;"></i>
              Offer 管理
            </li>
          </ul>
          <div style="color: rgba(255,255,255,0.65); font-size: 14px;">
            <i nz-icon nzType="user" style="margin-right: 4px;"></i>
            {{ currentUserRoleText }}
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
  selectedMenu = ['candidates'];
  stats = { overdueCount: 0 };
  conflictStats = { pendingCount: 0, communicatingCount: 0 };
  currentUserRole: 'hr' | 'interviewer' | 'admin' = 'interviewer';

  get currentUserRoleText(): string {
    const roleMap: Record<string, string> = {
      hr: 'HR',
      interviewer: '面试官',
      admin: '管理员'
    };
    return roleMap[this.currentUserRole] || '面试官';
  }

  constructor(
    public router: Router,
    private reminderService: ReminderService,
    private scheduleConflictService: ScheduleConflictService
  ) {}

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      const url = this.router.url.split('/')[1] || 'candidates';
      this.selectedMenu = [url];
    });

    this.loadStats();
  }

  loadStats(): void {
    this.reminderService.getStatistics().subscribe({
      next: (data) => {
        this.stats.overdueCount = data.overdueCount || 0;
      }
    });

    this.scheduleConflictService.getStatistics().subscribe({
      next: (data) => {
        this.conflictStats.pendingCount = data.pendingCount || 0;
        this.conflictStats.communicatingCount = data.communicatingCount || 0;
      }
    });
  }
}
