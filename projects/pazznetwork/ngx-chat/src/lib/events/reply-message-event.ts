
import { EventEmitter } from '@angular/core';

export class ReplyMessageEvent {
  public replyMessageEmitter$: EventEmitter<string>;
  constructor() {
    this.replyMessageEmitter$ = new EventEmitter();
  }
  changeReplyMessage(replyMessage: string): void {
    debugger;
    this.replyMessageEmitter$.emit(replyMessage);
  }
}
