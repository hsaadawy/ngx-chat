import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { Recipient } from "../../core/recipient";
import { ReplyMessageEvent } from "../../events/reply-message-event";
import { CHAT_SERVICE_TOKEN, ChatService } from "../../services/chat-service";
import Peer, { MediaConnection } from "peerjs";
import { Direction } from "../../core/message";
import { XmppChatConnectionService } from "../../services/adapters/xmpp/xmpp-chat-connection.service";

@Component({
  selector: "ngx-chat-message-input",
  templateUrl: "./chat-message-input.component.html",
  styleUrls: ["./chat-message-input.component.less"],
})
export class ChatMessageInputComponent implements OnInit {
  @Input()
  public recipient: Recipient;

  @Input()
  public Reply;
  @Output()
  public messageSent = new EventEmitter<void>();

  public message = "";
  public messageItem = "";

  @ViewChild("chatInput")
  chatInput: ElementRef;
  constructor(
    @Inject(CHAT_SERVICE_TOKEN) public chatService: ChatService,

    @Inject(XmppChatConnectionService)
    public chatConnectionService: XmppChatConnectionService,
    @Inject(ReplyMessageEvent) public replyMessageEvent: ReplyMessageEvent
  ) {

    

    this.replyMessageEvent.replyMessageEmitter$.subscribe((item: string) => {
      // this.message = item
      this.messageItem = item;
    });
    
  }

  ngOnInit() {
    
  }
 
  onSendMessage($event?: KeyboardEvent) {
    if ($event) {
      $event.preventDefault();
    }
    if (this.Reply != "") {
      this.chatService.sendMessage(
        this.recipient,
        `<div  class="messageItem">${this.Reply}</div>` + this.message
      );
      this.Reply = "";
    } else {
      this.chatService.sendMessage(this.recipient, this.message);
    }

    this.message = "";
    // this.messageSent.emit();
  }

  focus() {
    this.chatInput.nativeElement.focus();
  }
  delete() {
    debugger;
    this.Reply = "";
  }

  toggled: boolean = false;
  messageEmoji: string = "";

  // handleSelection(event) {
  //   console.log(event.char);
  //   this.messageEmoji += event.char;
  //   this.message += event.char;
  // }
}
