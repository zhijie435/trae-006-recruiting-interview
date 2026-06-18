import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReminderListComponent } from './components/reminder-list/reminder-list.component';
import { EvaluationListComponent } from './components/evaluation-list/evaluation-list.component';
import { EvaluationFormComponent } from './components/evaluation-form/evaluation-form.component';
import { OfferListComponent } from './components/offer-list/offer-list.component';
import { OfferDetailComponent } from './components/offer-detail/offer-detail.component';

const routes: Routes = [
  { path: '', redirectTo: '/evaluations', pathMatch: 'full' },
  { path: 'reminders', component: ReminderListComponent },
  { path: 'evaluations', component: EvaluationListComponent },
  { path: 'evaluations/:interviewId', component: EvaluationFormComponent },
  { path: 'offers', component: OfferListComponent },
  { path: 'offers/new', component: OfferDetailComponent },
  { path: 'offers/:id', component: OfferDetailComponent },
  { path: 'offers/:id/edit', component: OfferDetailComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
