import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
    CHAT_SERVICE_TOKEN,
    ChatService,
    ConnectionStates,
    JID,
    Room,
    RoomOccupant,
    RoomSummary,
} from '@pazznetwork/ngx-chat';
import { from, Observable, Subject } from 'rxjs';
import { jid } from '@xmpp/client';
import { distinctUntilChanged, filter, switchMap, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-muc',
    templateUrl: './muc.component.html',
    styleUrls: ['./muc.component.css'],
})
export class MucComponent implements OnInit, OnDestroy {
    private selectedRoomSubject = new Subject<Room>();
    selectedRoom$: Observable<Room> = this.selectedRoomSubject.asObservable();

    currentRoom: Room;

    inviteJid = '';
    subject = '';
    nick = '';
    memberJid = '';
    moderatorNick = '';

    rooms$: Observable<RoomSummary[]>;
    readonly state$: Observable<ConnectionStates> = this.chatService.state$.asObservable();

    occupants$: Observable<RoomOccupant[]>;

    private readonly ngDestroySubject = new Subject<void>();

    constructor(@Inject(CHAT_SERVICE_TOKEN) private chatService: ChatService) {
    }

    ngOnInit(): void {
        this.rooms$ = from(this.chatService.queryAllRooms());

        this.selectedRoom$
            .pipe(takeUntil(this.ngDestroySubject))
            .subscribe(room => {
                this.currentRoom = room;
            });

        this.occupants$ = this.selectedRoom$.pipe(
            filter(room => room != null),
            switchMap(room => room.occupants$),
            takeUntil(this.ngDestroySubject),
        );

        this.chatService.rooms$
            .pipe(takeUntil(this.ngDestroySubject))
            .subscribe((rooms) => {
                if (!this.currentRoom) {
                    return;
                }

                const updatedRoom = rooms.find((room) => room.roomJid.equals(this.currentRoom.roomJid));
                if (updatedRoom) {
                    this.selectedRoomSubject.next(updatedRoom);
                }
            });

        const occupantChanges$ = this.selectedRoom$.pipe(
            distinctUntilChanged((r1, r2) => (r1 == null && r2 == null) || Boolean(r1?.equals(r2) || r2?.equals(r1))),
            filter(room => room != null),
            switchMap((room) => room.onOccupantChange$),
        );

        occupantChanges$
            .pipe(takeUntil(this.ngDestroySubject))
            .subscribe((occupantChange) => {
                const {change, occupant, isCurrentUser} = occupantChange;
                if (occupantChange.change === 'modified') {
                    console.log(
                        `change=${change}, modified=${occupant.occupantJid.toString()}, currentUser=${isCurrentUser}`,
                        occupant,
                        occupantChange.oldOccupant,
                    );
                } else {
                    console.log(`change=${change}, currentUser=${isCurrentUser}`, occupant);
                }
            });

        occupantChanges$.pipe(
            filter(({change, isCurrentUser}) =>
                (change === 'kicked'
                    || change === 'banned'
                    || change === 'left'
                    || change === 'leftOnConnectionError'
                    || change === 'lostMembership'
                ) && isCurrentUser,
            ),
            takeUntil(this.ngDestroySubject),
        )
            .subscribe(() => {
                this.selectedRoomSubject.next(null);
            });
    }

    ngOnDestroy(): void {
        this.ngDestroySubject.next();
        this.ngDestroySubject.complete();
    }

    async joinRoom(roomJid: JID) {
        const room = await this.chatService.joinRoom(roomJid);
        this.selectedRoomSubject.next(room);
    }

    async leaveRoom() {
        await this.chatService.leaveRoom(this.currentRoom.roomJid);
        this.selectedRoomSubject.next(null);
    }

    async changeRoomSubject() {
        await this.chatService.changeRoomSubject(this.currentRoom.roomJid, this.subject);
    }

    async inviteUser() {
        await this.chatService.inviteUserToRoom(jid(this.inviteJid), this.currentRoom.roomJid);
    }

    async changeNick() {
        await this.chatService.changeUserNicknameForRoom(this.nick, this.currentRoom.roomJid);
    }

    async kick(occupant: RoomOccupant) {
        await this.chatService.kickOccupant(occupant.nick, this.currentRoom.roomJid);
    }

    async ban(occupant: RoomOccupant) {
        await this.chatService.banUserForRoom(occupant.occupantJid, this.currentRoom.roomJid);
    }

    async grantMembership() {
        await this.chatService.grantMembershipForRoom(jid(this.memberJid), this.currentRoom.roomJid);
    }

    async revokeMembership() {
        await this.chatService.revokeMembershipForRoom(jid(this.memberJid), this.currentRoom.roomJid);
    }

    async grantModeratorStatus() {
        await this.chatService.grantModeratorStatusForRoom(this.moderatorNick, this.currentRoom.roomJid);
    }

    async revokeModeratorStatus() {
        await this.chatService.revokeModeratorStatusForRoom(this.moderatorNick, this.currentRoom.roomJid);
    }
}