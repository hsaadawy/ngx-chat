import { JID } from '../../core/jid';
import { Affiliation } from './affiliation';
import { Role } from './role';

export interface RoomOccupant {
    jid: JID;
    affiliation: Affiliation;
    nick: string;
    role: Role;
}
