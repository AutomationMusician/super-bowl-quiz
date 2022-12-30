import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IPlayerData } from 'server/interfaces';
import { ServerService } from 'src/app/services/server.service';
import { BannerType } from '../../banner/banner.component';

const refreshIntervalMs : number = 10000;

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['../scoreboard-row.css', './scoreboard.component.css'] // last css file has highest precedence
})
export class ScoreboardComponent implements OnInit {
  game : string | undefined;
  bannerType : BannerType;
  bannerMessage : string | undefined;
  playerDataList : IPlayerData[] = [];

  constructor(
    private route: Router,
    private activatedRouter: ActivatedRoute,
    private server: ServerService
  ) { 
    this.activatedRouter.paramMap.subscribe(async params => {
      this.game = params.get('game') as string;
      if (!(await this.server.isValidGame(this.game))) {
        this.route.navigate(['/']);
        return;
      }
      this.renderPlayerDataLoop();
    });
    this.activatedRouter.queryParams.subscribe(params => {
      this.bannerType = params['status'];
      if (this.bannerType === 'success') {
        this.bannerMessage = "Quiz Successfully Submitted!";
      }
    })
  }

  private renderPlayerDataLoop() {
    if (this.game) {
      this.server.getPlayerDataList(this.game)
        .then(playerDataList => this.playerDataList = playerDataList);
    }
    setTimeout(() => {
      this.renderPlayerDataLoop();
    }, refreshIntervalMs);
  }

  public getRankClass(rank: number | undefined) : string {
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
