import { JID } from "./jid";

export enum MessageState {
    /**
     * Not yet sent
     */
    SENDING = 'sending',
    /**
     * Sent, but neither received nor seen by the recipient
     */
    SENT = 'sent',
    /**
     * The recipient client has received the message but the recipient has not seen it yet
     */
    RECIPIENT_RECEIVED = 'recipientReceived',
    /**
     * The message has been seen by the recipient
     */
    RECIPIENT_SEEN = 'recipientSeen',

    /**
     * should ideally not happen
     */
    UNKNOWN = 'unknownMessageState',

    /**
     * No message state support or not requested to be seen
     */
    HIDDEN = 'HIDDEN'
}

export interface Message {
    id?: string;
    // for rooms
    from?: JID;
    direction: Direction;
    body: string;
    datetime: Date;
    delayed: boolean;
    fromArchive: boolean;
    /**
     * if no explicit state is set for the message, use implicit contact message states instead.
     */
    state?: MessageState;
}

export enum Direction {
    in = 'in',
    out = 'out',
}
