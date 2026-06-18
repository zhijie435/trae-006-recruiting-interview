import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReminderListComponent } from './components/reminder-list/reminder-list.component';

const routes: Routes = [
  { path: '', redirectTo: '/reminders', pathMatch: 'full' },
  { path: 'reminders', component: ReminderListComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
