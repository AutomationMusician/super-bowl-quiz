import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuizComponent } from './components/quiz/quiz.component';

const routes: Routes = [
  { path: '', redirectTo: '/quiz/Personal/', pathMatch: "prefix" },
  { path: 'quiz/:game/', component: QuizComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
