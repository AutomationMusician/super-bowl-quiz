import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IState } from 'server/src/types';
import { ServerService } from 'src/app/services/server.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  constructor(
    private router: Router, 
    private server: ServerService
  ) {}

  async ngOnInit(): Promise<void> {
    const quizState : IState = await this.server.getState();
    const quizOpen : boolean = quizState.open;
    if (!quizOpen) {
      this.router.navigate(['scoreboard', 'all']);
    }
  }
}
