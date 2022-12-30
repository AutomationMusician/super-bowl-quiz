import { Component, Input, OnInit } from '@angular/core';

export type BannerType = 'success' | 'failure' | undefined;

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent implements OnInit {
  @Input() bannerType! : BannerType;
  @Input() bannerMessage! : string | undefined;
  constructor() { }

  ngOnInit(): void {
  }

}