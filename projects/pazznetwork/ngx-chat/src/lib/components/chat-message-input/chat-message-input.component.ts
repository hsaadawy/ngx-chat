import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { Recipient } from "../../core/recipient";
import { ReplyMessageEvent } from "../../events/reply-message-event";
import { CHAT_SERVICE_TOKEN, ChatService } from "../../services/chat-service";
import Peer, { MediaConnection } from "peerjs";
import { Direction } from "../../core/message";
import { XmppChatConnectionService } from "../../services/adapters/xmpp/xmpp-chat-connection.service";

@Component({
  selector: "ngx-chat-message-input",
  templateUrl: "./chat-message-input.component.html",
  styleUrls: ["./chat-message-input.component.less"],
})
export class ChatMessageInputComponent implements OnInit {
  @Input()
  public recipient: Recipient;

  @Input()
  public Reply;
  @Output()
  public messageSent = new EventEmitter<void>();

  public message = "";
  public messageItem = "";

  @ViewChild("chatInput")
  chatInput: ElementRef;

  callIsudio: boolean = false;
  private lazyStream: any;
  private localStream: any;
  currentCall: MediaConnection;
  private peer: Peer;
  currentPeer: any;
  peerId: string;
  cameraIsOff: boolean = false;
  constructor(
    @Inject(CHAT_SERVICE_TOKEN) public chatService: ChatService,

    @Inject(XmppChatConnectionService)
    public chatConnectionService: XmppChatConnectionService,
    @Inject(ReplyMessageEvent) public replyMessageEvent: ReplyMessageEvent
  ) {
    debugger;
    //this.peer = new Peer(this.chatConnectionService.userJid.local.toString());

    this.replyMessageEvent.replyMessageEmitter$.subscribe((item: string) => {
      // this.message = item
      this.messageItem = item;
    });
  }

  ngOnInit() {
    // debugger;
    // let x = this.chatConnectionService.userJid.local;
    // console.log("X",x);

    this.peer = new Peer(this.chatConnectionService.userJid.local.toString());

    // let id = this.recipient.jidBare.local.toString();

    this.getPeerId();
    //this.showLocalVideo();
  }
  private getPeerId = () => {
    this.peer.on("open", (id) => {
      this.peerId = id;
      // if(localStorage.getItem('peerIds')===null)
      // {
      //   localStorage.setItem ('peerIds', id);
      // }
      // else
      // {
      //   localStorage.setItem ('peerIds', localStorage.getItem('peerIds')+","+id);
      // }
      // localStorage.getItem('peerIds')?.split(',').forEach((value:string)=>{

      // })
    });

    this.peer.on("call", (call) => {
      navigator.mediaDevices
        .getUserMedia({
          video: !this.callIsudio,
          audio: true,
        })
        .then((stream) => {
          this.lazyStream = stream;
          if (confirm("some one call you , answer?")) {
            call.answer(stream);
            call.on("stream", (remoteStream) => {
              this.streamRemoteVideo(remoteStream);
              this.currentPeer = call.peerConnection;
            });
          } else {
            call.close();
          }
        })
        .catch((err) => {
          console.log(err + "Unable to get media");
        });
    });
  };

  private showLocalVideo() {
    debugger;
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        //audio: true
      })
      .then((stream) => {
        this.localStream = stream;
        this.streamLocalVideo(stream);
      });
  }
  private streamLocalVideo(stream: any): void {
    let video = document.querySelector("video");
    if (video === undefined || video === null) {
      video = document.createElement("video");
    }
    video.classList.add("video-local");
    video.srcObject = stream;
    video.play();

    document.getElementById("local-video").append(video);
  }

  connectVideo(): void {
    debugger;
    //this.peer = new Peer(this.chatConnectionService.userJid.local.toString());
    //this.getPeerId();
    this.callPeer(this.recipient.jidBare.local.toString());
    this.showLocalVideo();
  }
  connectAudio(): void {
    debugger;
    //  this.peer = new Peer(this.chatConnectionService.userJid.local.toString());
    // this.getPeerId();
    this.callIsudio = true;
    this.callPeer(this.recipient.jidBare.local.toString());
  }
  private callPeer(id: string): void {
    debugger;
    navigator.mediaDevices
      .getUserMedia({
        video: !this.callIsudio,
        audio: true,
      })
      .then((stream) => {
        this.lazyStream = stream;
        debugger;
        const call = this.peer.call(id, stream);
        this.currentCall = call;
        call.on("stream", (remoteStream) => {
          if (this.callIsudio) {
            this.streamRemoteudio(stream);
          } else {
            this.streamRemoteVideo(remoteStream);
          }
          this.currentPeer = call.peerConnection;
        });
      })
      .catch((err) => {
        debugger;
        console.log(err + "Unable to connect");
      });
  }

  private streamRemoteudio(stream: any): void {
    debugger;
    const audio = document.createElement("audio");
    audio.classList.add("audio-remote");

    audio.srcObject = stream;
    audio.play();

    document.getElementById("remote-video").append(audio);
  }
  private streamRemoteVideo(stream: any): void {
    debugger;
    const video = document.createElement("video");
    video.classList.add("video-remote");
    video.srcObject = stream;
    video.play();

    document.getElementById("remote-video").append(video);
  }
  screenShare(): void {
    this.shareScreen();
  }
  private shareScreen(): void {
    debugger;
    // @ts-ignore
    navigator.mediaDevices
      .getDisplayMedia({
        video: {
          cursor: "always",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      })
      .then((stream) => {
        const videoTrack = stream.getVideoTracks()[0];
        videoTrack.onended = () => {
          this.stopScreenShare();
        };

        const sender = this.currentPeer
          .getSenders()
          .find((s) => s.track.kind === videoTrack.kind);
        sender.replaceTrack(videoTrack);
      })
      .catch((err) => {
        console.log("Unable to get display media " + err);
      });
  }
  private stopScreenShare(): void {
    debugger;
    const videoTrack = this.lazyStream.getVideoTracks()[0];
    const sender = this.currentPeer
      .getSenders()
      .find((s) => s.track.kind === videoTrack.kind);
    sender.replaceTrack(videoTrack);
  }
  switchLocalCamera() {
    debugger;
    this.cameraIsOff = !this.cameraIsOff;
    if (this.cameraIsOff) {
      this.localStream.getTracks().forEach(function (track) {
        track.stop();
      });
    } else {
      this.showLocalVideo();
    }
  }
  closeLocalVideo() {
    let video = document.querySelector("video");
    if (video === undefined || video === null) {
      video = document.createElement("video");
    }
    video.classList.add("video-local");
    video.ended;

    document.getElementById("local-video").append(video);
  }
  endcall() {
    debugger;
    this.peer = new Peer(this.chatConnectionService.userJid.local.toString());
    this.closeLocalVideo();
    this.peer.destroy();
  }
  onSendMessage($event?: KeyboardEvent) {
    if ($event) {
      $event.preventDefault();
    }
    if (this.Reply != "") {
      this.chatService.sendMessage(
        this.recipient,
        `<div  class="messageItem">${this.Reply}</div>` + this.message
      );
      this.Reply = "";
    } else {
      this.chatService.sendMessage(this.recipient, this.message);
    }

    this.message = "";
    // this.messageSent.emit();
  }

  focus() {
    this.chatInput.nativeElement.focus();
  }
  delete() {
    debugger;
    this.Reply = "";
  }

  toggled: boolean = false;
  messageEmoji: string = "";

  handleSelection(event) {
    console.log(event.char);
    this.messageEmoji += event.char;
    this.message += event.char;
  }
}
