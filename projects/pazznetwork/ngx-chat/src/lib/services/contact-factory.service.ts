import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Contact } from '../core/contact';
import { LogService } from './log.service';

@Injectable()
export class ContactFactoryService {

    constructor(private logService: LogService,private httpClient : HttpClient) { }

    createContact(jidPlain: string,
                  name?: string,
                  avatar?: string) {
        if (!name) {
            name = jidPlain;
        }
        return new Contact(this.httpClient,jidPlain, name, avatar);
    }

}
