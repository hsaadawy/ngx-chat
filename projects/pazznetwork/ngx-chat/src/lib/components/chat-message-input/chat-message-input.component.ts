import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild
} from "@angular/core";
import { Recipient } from "../../core/recipient";
import { ReplyMessageEvent } from "../../events/reply-message-event";
import { CHAT_SERVICE_TOKEN, ChatService } from "../../services/chat-service";

@Component({
  selector: "ngx-chat-message-input",
  templateUrl: "./chat-message-input.component.html",
  styleUrls: ["./chat-message-input.component.less"],
})
export class ChatMessageInputComponent implements OnInit {
  @Input()
  public recipient: Recipient;

  @Output()
  public messageSent = new EventEmitter<void>();


  public message = "";
  public messageItem = "";

  @ViewChild("chatInput")
  chatInput: ElementRef;

  constructor(@Inject(CHAT_SERVICE_TOKEN) public chatService: ChatService,

    @Inject(ReplyMessageEvent) public replyMessageEvent: ReplyMessageEvent) {
    debugger;
    this.replyMessageEvent.replyMessageEmitter$.subscribe((item: string) => {
      // this.message = item
      this.messageItem = item
    }

    )
  }

  ngOnInit() {

  }

  onSendMessage($event?: KeyboardEvent) {

    if ($event) {
      $event.preventDefault();
    }
    debugger
    this.chatService.sendMessage(this.recipient,
      `<div  class="messageItem">${this.messageItem}</div>` + this.message);
    this.messageItem = ''
    this.message = "";
    this.messageSent.emit();

  }

  focus() {
    this.chatInput.nativeElement.focus();
  }
}
