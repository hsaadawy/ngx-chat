import { Injectable } from "@angular/core";
import Peer, { MediaConnection } from "peerjs";
import { XmppChatConnectionService } from "../../public-api";
@Injectable()
export class CallService
{
    callIsudio: boolean = false;
    private lazyStream: any;
    private localStream: any;
    currentCall: MediaConnection;
    private peerList: Array<any> = [];
     peer: Peer;
    currentPeer: any;
    peerId: string;
    cameraIsOff: boolean = false;
    constructor(public chatConnectionService: XmppChatConnectionService){
       
    }
    init()
    {
        this.peer = new Peer(this.chatConnectionService.userJid.local.toString(),{ key: "peerjs", debug: 3 });
        this.peer.on("call", (call) => {
            navigator.mediaDevices
              .getUserMedia({
                video: !this.callIsudio,
                audio: true,
              })
              .then((stream) => {
                this.lazyStream = stream;
                if (confirm("some one call you , answer?")) {
                  debugger;
                  call.answer(stream);
                  call.on("stream", (remoteStream) => {
                    if (!this.peerList.includes(call.peer)) {
                      debugger;
                        this.streamRemoteVideo(remoteStream);
                        this.showLocalVideo();
                      this.currentPeer = call.peerConnection;
                      this.peerList.push(call.peer);

                    }
                  });
                } else {
                 call.close();
               }
              })
              .catch((err) => {
                console.log(err + "Unable to get media");
              });
          });
    }
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
        debugger;
        let allVideosvideo = document.querySelectorAll("video");
        let video = allVideosvideo[1];
        if (video === undefined || video === null) {
          video = document.createElement("video");
        }
        video.classList.add("video-local");
        video.srcObject = stream;
        video.play();
    
        document.getElementById("local-video").append(video);
      };
    
      connectVideo(peerId:any): void {
        debugger;    
        this.callPeer(peerId);
        this.showLocalVideo();
      }
      connectAudio(peerid:any): void {
        debugger;
        //  this.peer = new Peer(this.chatConnectionService.userJid.local.toString());
        // this.getPeerId();
        this.callIsudio = true;
        this.callPeer(peerid);
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
                if (!this.peerList.includes(call.peer)) {
                    if(this.callIsudio)
                    {
                      this.streamRemoteudio(stream);
                    }
                    else
                    {
                      
                      this.streamRemoteVideo(remoteStream);
                      
                    }
                    this.currentPeer = call.peerConnection;
                    this.peerList.push(call.peer);
                  }
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
        const mediaDevices = navigator.mediaDevices as any;
        mediaDevices.getDisplayMedia({
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
      muteAudio()
  {
      this.lazyStream.getAudioTracks().forEach(function(track:MediaStreamTrack) {
      track.enabled=!track.enabled;
        });     
  }
  
}