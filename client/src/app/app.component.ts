import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <nz-layout style="min-height: 100vh;">
      <nz-layout>
        <nz-header style="background: #001529; padding: 0 24px; display: flex; align-items: center;">
          <div style="color: #fff; font-size: 18px; font-weight: 600; margin-right: 48px;">
            <i nz-icon nzType="team" style="margin-right: 8px;"></i>
            招聘面试管理系统
          </div>
          <ul nz-menu nzTheme="dark" nzMode="horizontal" style="flex: 1; border: 0;">
            <li nz-menu-item>
              <i nz-icon nzType="bell" style="margin-right: 8px;"></i>
              评价催办
            </li>
          </ul>
        </nz-header>
        <nz-content style="padding: 0;">
          <router-outlet></router-outlet>
        </nz-content>
      </nz-layout>
    </nz-layout>
  `
})
export class AppComponent {}
