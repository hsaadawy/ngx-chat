export let NOTIFICATION_DEFAULT = 'default';
export let NOTIFICATION_GRANTED = 'granted';
export let NOTIFICATION_DENIED = 'denied';
export let STATUS = ['offline', 'dnd', 'xa', 'away', 'chat', 'online'];
export let SOUNDS = {
   MSG: '../sound/notification.mp3',
   CALL: '../sound/incoming-call.mp3',
   NOTICE: '../sound/ping.mp3',
};
export let REGEX = {
   JID: new RegExp('\\b[^"&\'\\/:<>@\\s]+@[\\w-_.]+\\b', 'i'),
   URL: new RegExp(/(aesgcm:\/\/|https?:\/\/|www\.)[^\s<>'"]+/gi),
   GEOURI: new RegExp(
      /geo:(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:,-?\d+(?:\.\d+)?)?(?:;crs=[\w-]+)?(?:;u=(\d+(?:\.\d+)?))?(?:;[\w-]+=(?:[\w-_.!~*'()]|%[\da-f][\da-f])+)*/,
      'g'
   ),
};
export let NS = {
   CARBONS: 'urn:xmpp:carbons:2',
   FORWARD: 'urn:xmpp:forward:0',
};
export let HIDDEN = 'hidden';
export let SHOWN = 'shown';