import { Component, Input } from '@angular/core';

@Component({
    selector: 'ngx-chat-message-text',
    template: `
    <div [innerHTML]="text"></div>
    `,
    styles: [
        `
        .messageItem {
            background-color: red;
            width: 100%;
            border-radius: 2px;
          }
            :host {
                white-space: pre-wrap;
            }
        `
    ]
})
export class ChatMessageTextComponent {
    @Input() text: string;
}
