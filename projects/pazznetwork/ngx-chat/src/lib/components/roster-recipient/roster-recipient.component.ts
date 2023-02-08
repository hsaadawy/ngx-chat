import { Component, Inject, Input, OnInit } from '@angular/core';
import Peer, { MediaConnection } from 'peerjs';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { XmppChatConnectionService } from '../../../public-api';
import { CallService } from '../../core/callService';
import { Presence } from '../../core/presence';
import { Recipient } from '../../core/recipient';
import { UnreadMessageCountPlugin } from '../../services/adapters/xmpp/plugins/unread-message-count.plugin';
import { CHAT_SERVICE_TOKEN, ChatService } from '../../services/chat-service';

@Component({
    selector: 'ngx-chat-roster-recipient',
    templateUrl: './roster-recipient.component.html',
    styleUrls: ['./roster-recipient.component.less'],
})
export class RosterRecipientComponent implements OnInit {

    @Input()
    recipient: Recipient;

    unreadCount$: Observable<number>;
    presence$: Observable<Presence> | null;

    Presence = Presence;
    
    constructor(
        @Inject(CHAT_SERVICE_TOKEN) private chatService: ChatService,
        public callService: CallService
    ) {
        
        
    }

    ngOnInit() {
        
        this.unreadCount$ = this.chatService.getPlugin(UnreadMessageCountPlugin).jidToUnreadCount$
            .pipe(
                map(jidToUnreadCount => jidToUnreadCount.get(this.recipient.jidBare.toString()) || 0),
                distinctUntilChanged(),
                debounceTime(20),
            );
        this.presence$ = this.recipient.recipientType === 'contact' ? this.recipient.presence$ : of(Presence.unavailable);
       
    }
    onConnectVideo()
    {
        this.callService.connectVideo(this.recipient.jidBare.local.toString());
    }
    onConnectAudio()
    {
        this.callService.connectAudio(this.recipient.jidBare.local.toString());
    }
    
}
