import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
    standalone: true,
    imports: [CommonModule],
  templateUrl: './confirm-modal.html',
  styleUrls: ['./confirm-modal.css']
})
export class ConfirmModalComponent {
  @Input() message: string = "Êtes-vous sûr ?";
  @Input() visible: boolean = false;
  @Output() confirmed = new EventEmitter<boolean>();

  onConfirm() {
    this.confirmed.emit(true);
    this.visible = false;
  }

  onCancel() {
    this.confirmed.emit(false);
    this.visible = false;
  }
}
