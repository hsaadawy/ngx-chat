
import { EventEmitter } from '@angular/core';

export class ForwardMessageEvent {
  public ForwardMessageEmitter$: EventEmitter<string>;
  constructor() {
    this.ForwardMessageEmitter$ = new EventEmitter();
  }
  changeForwardMessage(ForwardMessage: string): void {
    debugger;
    this.ForwardMessageEmitter$.emit(ForwardMessage);
  }
}
