import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-game-codes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './game-codes.component.html',
  styleUrl: './game-codes.component.css'
})
export class GameCodesComponent {
  public games : string[] = [];
  public newGameCodeValue : string = '';
  public showErrors : boolean = false; // only show errors when you attempt to create an invalid label

  @ViewChild('newGameCodeElement', { static: true }) public newGameCodeElement!: NgModel;

  @Output() public gamesUpdatedEvent = new EventEmitter<string[]>();

  public createNewLabel(): void {
    if (this.newGameCodeElement.invalid) {
      this.showErrors = true;
      return;
    }
    if (this.games.includes(this.newGameCodeValue)) {
      console.error(`Label '${this.newGameCodeValue}' is already applied to this task`);
      return;
    }
    this.games.push(this.newGameCodeValue);
    this.gamesUpdatedEvent.emit([...this.games]);
    this.newGameCodeElement.reset();
    this.showErrors = false;
  }

  public removeGame(gameCode: string): void {
    const index = this.games.indexOf(gameCode);
    if (index !== -1) {
      this.games.splice(index, 1);
    }
    this.gamesUpdatedEvent.emit([...this.games]);
  }
}
