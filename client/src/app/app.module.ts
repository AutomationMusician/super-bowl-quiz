import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { QuizComponent } from './quiz/quiz.component';
import { QuestionComponent } from './quiz/question/question.component';
import { AppRoutingModule } from './app-routing.module';
import { RootComponent } from './root/root.component';

@NgModule({
  declarations: [
    RootComponent,
    QuizComponent,
    QuestionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [RootComponent]
})
export class AppModule { }
