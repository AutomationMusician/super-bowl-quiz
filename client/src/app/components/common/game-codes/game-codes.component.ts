import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { ServerService } from 'src/app/services/server.service';

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
  public games : { gameCode: string, gameName: string }[] = [];
  public newGameCodeValue : string = '';
  public customError : string | undefined;
  public showErrors : boolean = false; // only show errors when you attempt to create an invalid label

  @ViewChild('newGameCodeElement', { static: true }) public newGameCodeElement!: NgModel;

  // @Output() public gamesUpdatedEvent = new EventEmitter<string[]>();

  constructor(private server: ServerService) {}

  public async addNewGameCode(): Promise<void> {
    // input doesn't match parser lexer
    if (this.newGameCodeElement.invalid) {
      this.customError = undefined; // reset to default value
      this.showErrors = true;
      return;
    }

    // check that game code wasn't used
    const gameCode = this.newGameCodeValue;
    if (this.games.some(game => game.gameCode === gameCode)) {
      this.customError = `Game Code '${gameCode}' is already applied to this quiz.`;
      return;
    }

    // check that game code is real, and get game name
    const gameName = await this.server.getGameName(gameCode);
    if (!gameName) {
      this.customError = `Invalid game code '${gameCode}'.`;
      return;
    }

    // add game to list
    this.games.push({ gameCode, gameName });
    // this.gamesUpdatedEvent.emit([...this.games]);
    this.newGameCodeElement.reset();
    this.showErrors = false;
  }

  public removeGame(gameCode: string): void {
    const index = this.games.findIndex(game => game.gameCode === gameCode);
    if (index !== -1) {
      this.games.splice(index, 1);
    }
    // this.gamesUpdatedEvent.emit([...this.games]);
  }

  public onNewGameCodeChange(): void {
    this.customError = undefined;
  }
}
