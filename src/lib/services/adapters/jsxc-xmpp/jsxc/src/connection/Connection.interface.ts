import {IJID} from '../JID.interface';
import Message from './../Message';
import {Presence} from './AbstractConnection';
import Form from './Form';
import PEPService from './services/PEP';
import SearchService from './services/Search';
import PubSubService from './services/PubSub';
import JingleHandler from './JingleHandler';
import {MultiUserAffiliation} from './services/MUC';

// tslint:disable:unified-signatures
export interface IConnection {
    registerHandler(
        handler: (stanza: string) => boolean,
        ns?: string,
        name?: string,
        type?: string,
        id?: string,
        from?: string
    );

    pluginOnlySend(stanzaElement: Element);

    pluginOnlySend(stanzaElement: Strophe.Builder);

    pluginOnlySendIQ(stanzaElement: Element): Promise<Element>;

    pluginOnlySendIQ(stanzaElement: Strophe.Builder): Promise<Element>;

    get getPubSubService(): PubSubService;

    get getPEPService(): PEPService;

    get getMUCService(): IMUCService;

    get getRosterService(): IRosterService;

    get getVcardService(): IVcardService;

    get getSearchService(): SearchService;

    get getDiscoService(): IDiscoService;

    get getJingleHandler(): JingleHandler;

    get getJID(): IJID;

    get getServerJID(): IJID;

    sendMessage(message: Message);

    sendPresence(presence?: Presence, statusText?: string): Promise<void>;

    queryArchive(
        archive: IJID,
        version: string,
        queryId: string,
        contact?: IJID,
        beforeResultId?: string,
        end?: Date
    ): Promise<Element>;

    changePassword(newPassword: string): Promise<Element>;

    close();

    pause();
}

export interface IMUCService {
    joinMultiUserRoom(jid: IJID, password?: string);

    leaveMultiUserRoom(jid: IJID, exitMessage?: string);

    destroyMultiUserRoom(jid: IJID): Promise<Element>;

    createInstantRoom(jid: IJID): Promise<Element>;

    getRoomConfigurationForm(jid: IJID): Promise<Element>;

    getMemberList(jid: IJID): Promise<Element>;

    setMemberList(jid: IJID, items: { jid: IJID; affiliation: MultiUserAffiliation }[]): Promise<Element>;

    submitRoomConfiguration(jid: IJID, form: Form): Promise<Element>;

    cancelRoomConfiguration(jid: IJID): Promise<Element>;

    sendMediatedMultiUserInvitation(receiverJid: IJID, roomJid: IJID, reason?: string);

    changeTopic(roomJid: IJID, topic: string): void;

    changeNickname(roomJid: IJID, nickname: string): void;

    kickUser(jid: IJID, nickname: string, reason?: string): void;

    banUser(jid: IJID, targetjid: IJID, reason?: string): void;

    unbanUser(jid: IJID, targetjid: IJID, reason?: string): void;

    changeAffiliation(jid: IJID, targetjid: IJID, affiliation: string): void;

    changeRole(jid: IJID, nickname: string, rolestr: string, reason?: string): void;

    declineMediatedMultiUserInvitation(receiverJid: IJID, roomJid: IJID, reason?: string);

    sendDirectMultiUserInvitation(receiverJid: IJID, roomJid: IJID, reason?: string, password?: string);

    queryAllRooms(roomJid: IJID): Promise<RoomSummary[]>
}

export interface RoomSummary {
    jid: IJID;
    name: string;
    roomInfo: Form | null;
}

export interface IRosterService {
    getRoster(verstion?: string);

    removeContact(jid: IJID): Promise<Element>;

    addContact(jid: IJID, alias: string): Promise<Element>;

    setDisplayName(jid: IJID, displayName: string, groups: string[]): Promise<Element>;

    sendSubscriptionAnswer(to: IJID, accept: boolean);
}

export interface IVcardService {
    loadVcard(jid: IJID);

    setAvatar(jid: IJID, avatar: string, mimetype: string);
}

export interface IDiscoService {
    getDiscoInfo(jid: IJID, node?: string): Promise<Element>;

    getDiscoItems(jid: IJID, node?: string): Promise<Element>;
}

// tslint:enable:unified-signatures
