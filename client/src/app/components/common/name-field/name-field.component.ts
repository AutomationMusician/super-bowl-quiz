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
}
