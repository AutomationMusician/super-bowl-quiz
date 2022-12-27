import { Component, Input, OnInit, Type } from '@angular/core';

export type NavBarPage = "quiz" | "scoreboard";

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
  @Input() currentPage! : NavBarPage;
  @Input() game! : string | undefined;

  constructor() { }

  ngOnInit(): void {
  }

}
