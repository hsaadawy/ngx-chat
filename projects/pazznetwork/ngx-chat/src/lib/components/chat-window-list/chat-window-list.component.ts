import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Inject, Input } from '@angular/core';
import { ForwardMessageEvent } from '../../events/forward-message-event';
import { ChatListStateService } from '../../services/chat-list-state.service';

@Component({
    selector: 'ngx-chat-window-list',
    templateUrl: './chat-window-list.component.html',
    styleUrls: ['./chat-window-list.component.less'],
    animations: [
        trigger('rosterVisibility', [
            state('hidden', style({
                right: '1em',
            })),
            state('shown', style({
                right: '15em',
            })),
            transition('hidden => shown', animate('400ms ease')),
            transition('shown => hidden', animate('400ms ease'))
        ])
    ]
})
export class ChatWindowListComponent {

    @Input()
    rosterState: string;
    forwardMessage: string;
    pseudoBool: boolean = false;
    constructor(public chatListService: ChatListStateService, @Inject(ForwardMessageEvent) public forwardMessageEvent: ForwardMessageEvent)
     {
        this.forwardMessageEvent.ForwardMessageEmitter$.subscribe((item: string) => {
            debugger;
            this.forwardMessage = item;
            this.pseudoBool= ! this.pseudoBool
          })
    }

}
