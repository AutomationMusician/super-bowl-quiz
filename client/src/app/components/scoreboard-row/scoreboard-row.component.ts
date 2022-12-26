import { Component, Input, OnInit } from '@angular/core';
import { PlayerData } from 'src/app/model/player-data';

@Component({
  selector: '[app-scoreboard-row]',
  templateUrl: './scoreboard-row.component.html',
  styleUrls: ['../shared/scoreboard-row.css', './scoreboard-row.component.css']
})
export class ScoreboardRowComponent implements OnInit {
  @Input() playerData! : PlayerData;
  constructor() { }

  ngOnInit(): void {
  }

}
