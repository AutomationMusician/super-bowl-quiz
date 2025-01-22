import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IGameRankingMap, IPlayerData } from 'server/src/types';
import { ServerService } from 'src/app/services/server.service';
import { BannerType } from '../../banner/banner.component';

const refreshIntervalMs : number = 10000;

@Component({
    selector: 'app-scoreboard',
    templateUrl: './scoreboard.component.html',
    styleUrls: ['../scoreboard-row.css', './scoreboard.component.css'], // last css file has highest precedence
    standalone: false
})
export class ScoreboardComponent implements OnInit, OnDestroy {
  gameCodes : string | undefined;
  bannerType : BannerType;
  bannerMessage : string | undefined;
  gameRankingMapEntries : [string, IPlayerData[]][] = [];
  private timeoutId : NodeJS.Timeout | undefined;

  constructor(
    private route: Router,
    private activatedRouter: ActivatedRoute,
    private server: ServerService
  ) {
    this.activatedRouter.queryParams.subscribe(params => {
      this.bannerType = params['status'];
      if (this.bannerType === 'success') {
        this.bannerMessage = "Quiz Successfully Submitted!";
      }
    })
  }

  private updatePlayerDataLoop() : void {
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

  ngOnInit() : void { 
    this.server.getGameRankingMap()
      .then(gameRankingMap => this.gameRankingMapEntries = Object.entries(gameRankingMap));
    this.timeoutId = setTimeout(() => {
      this.updatePlayerDataLoop();
    }, refreshIntervalMs);
  }

  ngOnDestroy() : void {
    clearTimeout(this.timeoutId);
  }

}
