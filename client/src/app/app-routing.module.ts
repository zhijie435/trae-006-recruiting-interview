import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReminderListComponent } from './components/reminder-list/reminder-list.component';
import { EvaluationListComponent } from './components/evaluation-list/evaluation-list.component';
import { EvaluationFormComponent } from './components/evaluation-form/evaluation-form.component';

const routes: Routes = [
  { path: '', redirectTo: '/evaluations', pathMatch: 'full' },
  { path: 'reminders', component: ReminderListComponent },
  { path: 'evaluations', component: EvaluationListComponent },
  { path: 'evaluations/:interviewId', component: EvaluationFormComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
