import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IPlayerData, IQuestion, IQuiz } from 'server/interfaces';
import { ServerService } from 'src/app/services/server.service';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['../scoreboard-row.css', './scoreboard.component.css'] // last css file has highest precedence
})
export class ScoreboardComponent implements OnInit {
  game : string | undefined;
  mockPlayerData : IPlayerData = {
    id: 1,
    name: "firstname lastname",
    rank: undefined,
    score: 50
  };

  constructor(
    private route: Router,
    private activatedRouter: ActivatedRoute,
    private server: ServerService
  ) { 
    this.activatedRouter.paramMap.subscribe(params => {
      this.game = params.get('game') as string;
    });
    

  }

  ngOnInit(): void {

  }

}
