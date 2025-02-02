import { Component, Input, OnInit } from '@angular/core';
import { IPlayerData } from 'server/src/types';

@Component({
    selector: '[app-scoreboard-row]',
    templateUrl: './scoreboard-row.component.html',
    styleUrls: ['../scoreboard-row.css', './scoreboard-row.component.css'],
    standalone: false
})
export class ScoreboardRowComponent implements OnInit {
  @Input() playerData! : IPlayerData;
  constructor() { }

  ngOnInit(): void {
  }

}
