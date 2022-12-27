import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IPlayerData, IQuestion, IQuiz } from 'server/interfaces';
import { ServerService } from 'src/app/services/server.service';

const refreshIntervalMs : number = 10000;

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['../scoreboard-row.css', './scoreboard.component.css'] // last css file has highest precedence
})
export class ScoreboardComponent implements OnInit {
  game : string | undefined;
  playerDataList : IPlayerData[] = [];

  constructor(
    private route: Router,
    private activatedRouter: ActivatedRoute,
    private server: ServerService
  ) { 
    this.activatedRouter.paramMap.subscribe(params => {
      this.game = params.get('game') as string;
      this.renderPlayerData();
    });
    this.renderPlayerDataSetTimeout();
  }

  private async renderPlayerData() : Promise<void> {
    if (this.game) {
      this.playerDataList = await this.server.getPlayerData(this.game);
    }
  }

  private renderPlayerDataSetTimeout() {
    setTimeout(() => {
      this.renderPlayerData();
      this.renderPlayerDataSetTimeout();
    }, refreshIntervalMs);
  }

  public getRankClass(rank: number | undefined) : string {
    console.log(rank);
    if (rank === 1)
      return 'gold';
    else if (rank === 2)
      return 'silver';
    else if (rank === 3)
      return 'bronze';
    else
      return '';
  }

  ngOnInit(): void { }

}
