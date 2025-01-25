import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { QuizComponent } from './components/quiz/quiz/quiz.component';
import { QuestionComponent } from './components/quiz/question/question.component';
import { AppRoutingModule } from './app-routing.module';
import { RootComponent } from './components/root/root.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { FormsModule } from '@angular/forms';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { ScoreboardComponent } from './components/scoreboard/scoreboard/scoreboard.component';
import { ScoreboardRowComponent } from './components/scoreboard/scoreboard-row/scoreboard-row.component';
import { ResultsComponent } from './components/quiz/results/results.component';
import { BannerComponent } from './components/banner/banner.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { GameCodesComponent } from "./components/game-codes/game-codes.component";

@NgModule({
  declarations: [
    RootComponent,
    QuizComponent,
    QuestionComponent,
    NavBarComponent,
    ScoreboardComponent,
    PageNotFoundComponent,
    ScoreboardComponent,
    ScoreboardRowComponent,
    ResultsComponent,
    BannerComponent,
    HomePageComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    GameCodesComponent
],
  providers: [],
  bootstrap: [RootComponent]
})
export class AppModule { }
