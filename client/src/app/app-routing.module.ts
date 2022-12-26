import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { QuizComponent } from './components/quiz/quiz/quiz.component';
import { ScoreboardComponent } from './components/scoreboard/scoreboard/scoreboard.component';

const routes: Routes = [
  { path: 'quiz/:game', component: QuizComponent },
  { path: 'scoreboard/:game', component: ScoreboardComponent },
  { path: '', redirectTo: 'scoreboard/Personal', pathMatch: "full" },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  providers: [{provide: APP_BASE_HREF, useValue: '/client'}],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
