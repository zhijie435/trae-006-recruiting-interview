import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReminderListComponent } from './components/reminder-list/reminder-list.component';
import { EvaluationListComponent } from './components/evaluation-list/evaluation-list.component';
import { EvaluationFormComponent } from './components/evaluation-form/evaluation-form.component';
import { OfferListComponent } from './components/offer-list/offer-list.component';
import { OfferDetailComponent } from './components/offer-detail/offer-detail.component';
import { ScheduleConflictListComponent } from './components/schedule-conflict-list/schedule-conflict-list.component';
import { CandidateListComponent } from './components/candidate-list/candidate-list.component';
import { CandidateDetailComponent } from './components/candidate-detail/candidate-detail.component';

const routes: Routes = [
  { path: '', redirectTo: '/candidates', pathMatch: 'full' },
  { path: 'candidates', component: CandidateListComponent },
  { path: 'candidates/:id', component: CandidateDetailComponent },
  { path: 'reminders', component: ReminderListComponent },
  { path: 'evaluations', component: EvaluationListComponent },
  { path: 'evaluations/:interviewId', component: EvaluationFormComponent },
  { path: 'offers', component: OfferListComponent },
  { path: 'offers/new', component: OfferDetailComponent },
  { path: 'offers/:id', component: OfferDetailComponent },
  { path: 'offers/:id/edit', component: OfferDetailComponent },
  { path: 'schedule-conflicts', component: ScheduleConflictListComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
