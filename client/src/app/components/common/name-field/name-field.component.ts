import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-name-field',
  imports: [
      CommonModule,
      FormsModule
  ],
  templateUrl: './name-field.component.html',
  styleUrl: './name-field.component.css'
})
export class NameFieldComponent {
  private setSubscription: Subscription | undefined;
  public name : string = '';

  @ViewChild('inputElement', { static: true }) public inputElement!: NgModel;
  @Input() public set: Observable<string> | undefined;
  @Input() public disabled: boolean = true;
  @Output() public nameUpdatedEvent = new EventEmitter<string | undefined>();

  public async ngOnInit() {
    this.setSubscription = this.set?.subscribe((name) => this.name = name);
  }

  public ngOnDestroy() {
    this.setSubscription?.unsubscribe();
  }

  onInput() {
    if (this.inputElement.valid) {
      this.nameUpdatedEvent.emit(this.inputElement.value);
    } else {
      this.nameUpdatedEvent.emit(undefined);
    }
  }
}
