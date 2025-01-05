import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { QuizComponent } from './components/quiz/quiz/quiz.component';
import { ResultsComponent } from './components/quiz/results/results.component';
import { ScoreboardComponent } from './components/scoreboard/scoreboard/scoreboard.component';

const routes: Routes = [
  { path: ':game', redirectTo: 'quiz/:game', pathMatch: "full" },
  { path: 'quiz/:game', component: QuizComponent },
  { path: 'scoreboard/:game', component: ScoreboardComponent },
  { path: 'results/:game/:id', component: ResultsComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  providers: [{provide: APP_BASE_HREF, useValue: '/super-bowl-quiz'}],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
