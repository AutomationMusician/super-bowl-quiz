import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IPlayerData } from 'server/src/types';
import { ServerService } from 'src/app/services/server.service';
import { BannerType } from '../../banner/banner.component';

const refreshIntervalMs : number = 10000;

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['../scoreboard-row.css', './scoreboard.component.css'] // last css file has highest precedence
})
export class ScoreboardComponent implements OnInit, OnDestroy {
  gameCodes : string | undefined;
  bannerType : BannerType;
  bannerMessage : string | undefined;
  playerDataList : IPlayerData[] = [];
  private timeoutId : NodeJS.Timeout | undefined;

  constructor(
    private route: Router,
    private activatedRouter: ActivatedRoute,
    private server: ServerService
  ) { 
    this.activatedRouter.paramMap.subscribe(async params => {
      this.gameCodes = params.get('gameCodes') as string;
      console.log("'" + this.gameCodes + "'");
      if (this.gameCodes !== "" && !(await this.server.areValidGames(this.gameCodes))) {
        this.route.navigate(['/notfound']);
        return;
      }
      this.updatePlayerDataLoop();
    });
    this.activatedRouter.queryParams.subscribe(params => {
      this.bannerType = params['status'];
      if (this.bannerType === 'success') {
        this.bannerMessage = "Quiz Successfully Submitted!";
      }
    })
  }

  private updatePlayerDataLoop() : void {
    if (this.gameCodes) {
      this.server.getPlayerDataList(this.gameCodes)
        .then(playerDataList => this.playerDataList = playerDataList);
    }
    this.timeoutId = setTimeout(() => {
      this.updatePlayerDataLoop();
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

  ngOnInit() : void { }

  ngOnDestroy() : void {
    clearTimeout(this.timeoutId);
  }

}
