import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ServerService } from 'src/app/services/server.service';

@Component({
  selector: 'app-games-identifier',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './games-identifier.component.html',
  styleUrl: './games-identifier.component.css'
})
export class GamesIdentifierComponent {
  private setSubscription: Subscription | undefined;
  
  public games : { gameCode: string, gameName: string }[] = [];
  public newGameCodeValue : string = '';
  public customError : string | undefined;

  @ViewChild('newGameCodeElement') public newGameCodeElement!: NgModel;

  @Input() public set: Observable<string[]> | undefined;
  @Input() public disabled: boolean = true;
  @Output() public gameCodesUpdatedEvent = new EventEmitter<string[]>();

  constructor(private server: ServerService) {}

  public async ngOnInit() {
    this.setSubscription = this.set?.subscribe((gameNames) => {
      this.games = gameNames.map((gameName) => {
        return { 
          gameCode: "null", 
          gameName: gameName
        };
      });
    });
  }

  public ngOnDestroy() {
    this.setSubscription?.unsubscribe();
  }

  public async addNewGameCode(): Promise<void> {
    // input doesn't match parser lexer
    if (this.newGameCodeElement.invalid) {
      this.customError = undefined; // reset to default value
      return;
    }

    // check that game code wasn't used
    const gameCode = this.newGameCodeValue.toLowerCase();
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
    this.gameCodesUpdatedEvent.emit(this.games.map(game => game.gameCode));
    this.newGameCodeElement.reset();
    this.customError = undefined;
  }

  public removeGame(gameCode: string): void {
    const index = this.games.findIndex(game => game.gameCode === gameCode);
    if (index !== -1) {
      this.games.splice(index, 1);
    }
    this.gameCodesUpdatedEvent.emit(this.games.map(game => game.gameCode));
  }
}
