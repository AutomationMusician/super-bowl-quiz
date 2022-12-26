import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerData } from 'src/app/model/player-data';
import { ServerService } from 'src/app/services/server.service';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['../scoreboard-row.css', './scoreboard.component.css'] // last css file has highest precedence
})
export class ScoreboardComponent implements OnInit {
  game : string | undefined;
  mockPlayerData : PlayerData;

  constructor(
    private route: Router,
    private activatedRouter: ActivatedRoute,
    private server: ServerService
  ) { 
    this.mockPlayerData = new PlayerData();
    this.mockPlayerData.name = "firstname lastname";
    this.mockPlayerData.rank = 1;
    this.mockPlayerData.score = 50;
  }

  ngOnInit(): void {
    this.activatedRouter.paramMap.subscribe(params => {
      this.game = params.get('game') as string;
    });
  }

}
