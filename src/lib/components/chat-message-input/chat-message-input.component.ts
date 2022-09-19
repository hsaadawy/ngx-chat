import {Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild} from '@angular/core';
import {Recipient} from '../../core/recipient';
import {CHAT_SERVICE_TOKEN, ChatService} from '../../services/adapters/xmpp/interface/chat.service';

@Component({
    selector: 'ngx-chat-message-input',
    templateUrl: './chat-message-input.component.html',
    styleUrls: ['./chat-message-input.component.less'],
})
export class ChatMessageInputComponent {

    @Input()
    public recipient: Recipient;

    @Output()
    public messageSent = new EventEmitter<void>();

    public message = '';

    @ViewChild('chatInput')
    chatInput: ElementRef;

    constructor(@Inject(CHAT_SERVICE_TOKEN) public chatService: ChatService) {
    }

    async onKeydownEnter($event: KeyboardEvent) {
        $event?.preventDefault();
        await this.onSendMessage();
    }

    async onSendMessage() {
        await this.chatService.sendMessage(this.recipient, this.message);
        this.message = '';
        this.messageSent.emit();
    }

    focus() {
        this.chatInput.nativeElement.focus();
    }

}
