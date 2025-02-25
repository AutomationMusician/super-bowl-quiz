import { Component, Input, OnInit, Type } from '@angular/core';

export type NavBarPage = "quiz" | "scoreboard";

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.css'],
    standalone: false
})
export class NavBarComponent implements OnInit {
  @Input() currentPage! : NavBarPage | undefined;

  constructor() { }

  ngOnInit(): void {
  }

}
