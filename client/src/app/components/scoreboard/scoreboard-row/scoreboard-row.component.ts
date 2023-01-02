import { Component, Input, OnInit } from '@angular/core';
import { IPlayerData } from 'server/src/types';

@Component({
  selector: '[app-scoreboard-row]',
  templateUrl: './scoreboard-row.component.html',
  styleUrls: ['../scoreboard-row.css', './scoreboard-row.component.css']
})
export class ScoreboardRowComponent implements OnInit {
  @Input() playerData! : IPlayerData;
  @Input() game! : string | undefined;
  constructor() { }

  ngOnInit(): void {
  }

}
