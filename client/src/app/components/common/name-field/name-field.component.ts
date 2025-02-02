import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';

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
  public name : string = '';

  @ViewChild('inputElement', { static: true }) public inputElement!: NgModel;
  @Output() public nameUpdatedEvent = new EventEmitter<string | undefined>();

  onInput() {
    if (this.inputElement.valid) {
      this.nameUpdatedEvent.emit(this.inputElement.value);
    } else {
      this.nameUpdatedEvent.emit(undefined);
    }
  }
}
