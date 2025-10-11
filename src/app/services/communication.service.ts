import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class CommunicationService {
  private messageSource = new BehaviorSubject<boolean>(false);
  message$ = this.messageSource.asObservable();

  // Pour déclencher une action chez le Sender
  private triggerActionSource = new Subject<void>();
  triggerAction$ = this.triggerActionSource.asObservable();

  sendMessage(msg: boolean) {
    this.messageSource.next(msg);
  }

  // Appelé par Receiver pour dire "Sender exécute ta méthode"
  triggerSenderAction() {
    this.triggerActionSource.next();
  }
}