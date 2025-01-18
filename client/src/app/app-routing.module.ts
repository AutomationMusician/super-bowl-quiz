import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { QuizComponent } from './components/quiz/quiz/quiz.component';
import { ResultsComponent } from './components/quiz/results/results.component';
import { ScoreboardComponent } from './components/scoreboard/scoreboard/scoreboard.component';
import { HomePageComponent } from './components/home-page/home-page.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'notfound', component: PageNotFoundComponent },
  { path: 'quiz/:gameCodes', component: QuizComponent },
  { path: 'scoreboard/:gameCodes', component: ScoreboardComponent },
  { path: 'results/:gameCodes/:id', component: ResultsComponent },
  { path: ':gameCodes', redirectTo: 'quiz/:gameCodes', pathMatch: "full" },
  { path: '**', redirectTo: 'notfound' }
];

@NgModule({
  providers: [{provide: APP_BASE_HREF, useValue: '/super-bowl-quiz'}],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
