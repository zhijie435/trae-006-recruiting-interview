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
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
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
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReminderListComponent } from './components/reminder-list/reminder-list.component';
import { EvaluationListComponent } from './components/evaluation-list/evaluation-list.component';
import { EvaluationFormComponent } from './components/evaluation-form/evaluation-form.component';
import { OfferListComponent } from './components/offer-list/offer-list.component';
import { OfferDetailComponent } from './components/offer-detail/offer-detail.component';
import { ScheduleConflictListComponent } from './components/schedule-conflict-list/schedule-conflict-list.component';
import { CandidateListComponent } from './components/candidate-list/candidate-list.component';
import { CandidateDetailComponent } from './components/candidate-detail/candidate-detail.component';

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
  HomeOutline,
  EditOutline,
  SaveOutline,
  BarChartOutline,
  MessageOutline,
  FileTextOutline,
  AuditOutline,
  PlusOutline,
  ArrowUpOutline,
  RollbackOutline,
  StopOutline,
  UndoOutline,
  CheckOutline,
  CloseOutline,
  SolutionOutline,
  HistoryOutline,
  ThunderboltOutline,
  CalendarOutline,
  PhoneOutline,
  VideoCameraOutline,
  StarOutline,
  StarFill,
  ArrowLeftOutline,
  WarningOutline,
  InfoCircleOutline
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
  HomeOutline,
  EditOutline,
  SaveOutline,
  BarChartOutline,
  MessageOutline,
  FileTextOutline,
  AuditOutline,
  PlusOutline,
  ArrowUpOutline,
  RollbackOutline,
  StopOutline,
  UndoOutline,
  CheckOutline,
  CloseOutline,
  SolutionOutline,
  HistoryOutline,
  ThunderboltOutline,
  CalendarOutline,
  PhoneOutline,
  VideoCameraOutline,
  StarOutline,
  StarFill,
  ArrowLeftOutline,
  WarningOutline,
  InfoCircleOutline
];

@NgModule({
  declarations: [
    AppComponent,
    ReminderListComponent,
    EvaluationListComponent,
    EvaluationFormComponent,
    OfferListComponent,
    OfferDetailComponent,
    ScheduleConflictListComponent,
    CandidateListComponent,
    CandidateDetailComponent
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
    NzInputNumberModule,
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
    NzAvatarModule,
    NzRateModule,
    NzRadioModule,
    NzDividerModule,
    NzTimelineModule,
    NzFormModule,
    NzTabsModule,
    NzPageHeaderModule,
    NzDescriptionsModule,
    NzIconModule.forRoot(icons)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
