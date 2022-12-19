import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { Contact } from '../../core/contact';
import { ForwardMessageEvent } from '../../events/forward-message-event';
import { ChatService, CHAT_SERVICE_TOKEN } from '../../services/chat-service';
@Component({
  selector: 'ngx-forward-message',
  templateUrl: './forward-message.component.html',
  styleUrls: ['./forward-message.component.less']
})
export class ForwardMessageComponent implements OnInit {
  @Output()
    closeClick = new EventEmitter<void>();


  @Input()
  set pseudoBool(val: boolean) { 
    this.ngOnInit();
  }
  @Input() message:string;
  selectedContact :Contact[]=[];
  contacts: Observable<Contact[]>;
  public messageSent = new EventEmitter<void>();
  constructor(@Inject(CHAT_SERVICE_TOKEN) public chatService: ChatService) {

  
   }

  ngOnInit(): void {
    if (!this.contacts) {
        this.contacts = this.chatService.contactsSubscribed$;
  }
  }

  selectReceiver(contact:Contact, event)
  {
    debugger;
    if(event.target.checked)
    {
      this.selectedContact.push(contact);
    }else
    {
      this.selectedContact = this.selectedContact.filter(x=>x.jidBare.local !=contact.jidBare.local)

    }
  }

  forwordMessage()
  {
    debugger;
    this.selectedContact.forEach((element,index) => {
      this.chatService.sendMessage(element,this.message);
      if(index ===this.selectedContact.length-1 )
      {
        this.closeClick.emit()
        this.message=null;;
      }
    
    });
  }
}
