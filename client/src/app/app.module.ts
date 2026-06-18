import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReminderListComponent } from './components/reminder-list/reminder-list.component';

import { IconDefinition } from '@ant-design/icons-angular';
import {
  BellOutline,
  MailOutline,
  SearchOutline,
  ReloadOutline,
  CheckCircleOutline,
  ClockCircleOutline,
  ExclamationCircleOutline,
  UserOutline,
  TeamOutline,
  SendOutline,
  DeleteOutline,
  EyeOutline,
  HomeOutline
} from '@ant-design/icons-angular/icons';

const icons: IconDefinition[] = [
  BellOutline,
  MailOutline,
  SearchOutline,
  ReloadOutline,
  CheckCircleOutline,
  ClockCircleOutline,
  ExclamationCircleOutline,
  UserOutline,
  TeamOutline,
  SendOutline,
  DeleteOutline,
  EyeOutline,
  HomeOutline
];

@NgModule({
  declarations: [
    AppComponent,
    ReminderListComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NzLayoutModule,
    NzMenuModule,
    NzBreadCrumbModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzDatePickerModule,
    NzTagModule,
    NzBadgeModule,
    NzModalModule,
    NzMessageModule,
    NzCardModule,
    NzGridModule,
    NzEmptyModule,
    NzSpinModule,
    NzToolTipModule,
    NzCheckboxModule,
    NzIconModule.forRoot(icons)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
