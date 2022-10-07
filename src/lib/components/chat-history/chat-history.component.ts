import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    QueryList,
    SimpleChanges,
    ViewChild,
    ViewChildren,
} from '@angular/core';
import {firstValueFrom, from, mergeMap, Observable, of, Subject} from 'rxjs';
import {debounceTime, filter, takeUntil} from 'rxjs/operators';
import {Direction, Message} from '../../services/adapters/xmpp/core/message';
import {Recipient} from '../../services/adapters/xmpp/core/recipient';
import {ChatMessageListRegistryService} from '../../services/components/chat-message-list-registry.service';
import {CHAT_SERVICE_TOKEN, ChatService} from '../../services/adapters/xmpp/interface/chat.service';
import {Contact, Invitation, isContact} from '../../services/adapters/xmpp/core/contact';
import {ChatMessageInComponent} from '../chat-message-in/chat-message-in.component';

@Component({
    selector: 'ngx-chat-history',
    templateUrl: './chat-history.component.html',
    styleUrls: ['./chat-history.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatHistoryComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

    @Input()
    recipient: Recipient;

    @Input()
    showAvatars: boolean;

    @ViewChild('messageArea')
    chatMessageAreaElement: ElementRef<HTMLElement>;

    @ViewChildren(ChatMessageInComponent)
    chatMessageViewChildrenList: QueryList<ChatMessageInComponent>;

    Direction = Direction;
    onTop$ = new Subject<IntersectionObserverEntry>();

    private ngDestroy = new Subject<void>();
    private isAtBottom = true;
    private bottomLeftAt = 0;
    private oldestVisibleMessageBeforeLoading: Message = null;

    pendingRoomInvite: Invitation | null = null;

    get recipientAsContact(): Contact {
        return this.recipient as Contact;
    }

    constructor(
        @Inject(CHAT_SERVICE_TOKEN) public chatService: ChatService,
        private chatMessageListRegistry: ChatMessageListRegistryService,
        private changeDetectorRef: ChangeDetectorRef,
    ) {
    }

    async ngOnInit() {
        this.onTop$
            .pipe(filter(event => event.isIntersecting), debounceTime(1000))
            .subscribe(() => this.loadOlderMessagesBeforeViewport());

        if (this.recipient.recipientType === 'contact') {
            (this.recipient as Contact).pendingRoomInvite$
                .pipe(
                    filter(invite => invite != null),
                    takeUntil(this.ngDestroy),
                )
                .subscribe((invite) => this.pendingRoomInvite = invite);
        }

        this.chatMessageListRegistry.incrementOpenWindowCount(this.recipient);
    }

    async ngAfterViewInit() {
        this.chatMessageViewChildrenList.changes
            .subscribe(() => {
                if (this.oldestVisibleMessageBeforeLoading) {
                    this.scrollToMessage(this.oldestVisibleMessageBeforeLoading);
                }
                this.oldestVisibleMessageBeforeLoading = null;
            });

        this.recipient.messages$
            .pipe(
                debounceTime(10),
                filter(() => this.isNearBottom()),
                takeUntil(this.ngDestroy),
            )
            .subscribe((_) => this.scheduleScrollToLastMessage());

        if (this.recipient.messages.length < 10) {
            await this.loadMessages(); // in case insufficient old messages are displayed
        }
        this.scheduleScrollToLastMessage();
    }

    ngOnChanges({contact}: SimpleChanges): void {
        if (!contact?.currentValue) {
            return;
        }

        if (contact.previousValue) {
            this.chatMessageListRegistry.decrementOpenWindowCount(contact.previousValue);
            this.chatMessageListRegistry.incrementOpenWindowCount(contact.currentValue);
        }

        this.scheduleScrollToLastMessage();
    }

    ngOnDestroy(): void {
        this.ngDestroy.next();
        this.chatMessageListRegistry.decrementOpenWindowCount(this.recipient);
    }

    scheduleScrollToLastMessage() {
        setTimeout(() => this.scrollToLastMessage(), 0);
    }

    async loadOlderMessagesBeforeViewport() {
        if (this.isLoadingHistory() || this.isNearBottom()) {
            return;
        }

        try {
            this.oldestVisibleMessageBeforeLoading = this.recipient.oldestMessage;
            await this.loadMessages();
        } catch (e) {
            this.oldestVisibleMessageBeforeLoading = null;
        }
    }

    onBottom(event: IntersectionObserverEntry) {
        this.isAtBottom = event.isIntersecting;

        if (event.isIntersecting) {
            this.isAtBottom = true;
        } else {
            this.isAtBottom = false;
            this.bottomLeftAt = Date.now();
        }
    }

    recipientIsContact(recipient: Recipient) {
        return isContact(recipient);
    }

    getOrCreateContactWithFullJid(message: Message): Observable<Recipient> {
        if (this.recipient.recipientType === 'contact') {
            // this is not a multi-user chat, just use recipient as contact
            return from(firstValueFrom(of(this.recipient)));
        }

        const roomMessage = message;

        return this.chatService.contacts$.pipe(mergeMap(async (contacts) => {
            let matchingContact = contacts.find(contact => contact.jidWithResource.equals(roomMessage.from));

            if (!matchingContact) {
                await this.chatService.addContact(roomMessage.from.toString());
            }

            return matchingContact;
        }));
    }

    private scrollToLastMessage() {
        if (this.chatMessageAreaElement) {
            this.chatMessageAreaElement.nativeElement.scrollTop = this.chatMessageAreaElement.nativeElement.scrollHeight;
            this.isAtBottom = true; // in some browsers the intersection observer does not emit when scrolling programmatically
        }
    }

    private scrollToMessage(message: Message) {
        if (this.chatMessageAreaElement) {
            const htmlIdAttribute = 'message-' + message.id;
            const messageElement = document.getElementById(htmlIdAttribute);
            messageElement.scrollIntoView(false);
        }
    }

    private async loadMessages() {
        try {
            // improve performance when loading lots of old messages
            this.changeDetectorRef.detach();
            await this.chatService.loadMostRecentUnloadedMessages(this.recipient);
        } finally {
            this.changeDetectorRef.reattach();
        }
    }

    private isNearBottom() {
        return this.isAtBottom || Date.now() - this.bottomLeftAt < 1000;
    }

    private isLoadingHistory(): boolean {
        return !!this.oldestVisibleMessageBeforeLoading;
    }
}
