import AbstractHandler from '../AbstractHandler';
import JID from '../../../JID';
import Translation from '../../../util/Translation';
import { TYPE, FUNCTION } from '../../../Notice';

export default class extends AbstractHandler {
   public processStanza(stanza: Element) {
       const fromJid = new JID(stanza.getAttribute('from'));
       const connection = this.account.getConnection();
       const myJid = connection.getJID;

       if (!fromJid.isServer) {
         if (!this.account.getContact(fromJid)) {
            return this.PRESERVE_HANDLER;
         }
      } else if (fromJid.domain !== myJid.domain) {
         return this.PRESERVE_HANDLER;
      }

       if ($(stanza).find('body:first').length === 0) {
         return this.PRESERVE_HANDLER;
      }

       const subject = $(stanza).find('subject:first').text() || Translation.t('Notification');
       const body = $(stanza).find('body:first').text();

       this.account.getNoticeManager().addNotice({
         title: subject,
         description: body,
         fnName: FUNCTION.notification,
         fnParams: [subject, body, fromJid.full],
         type: TYPE.announcement,
      });

       return this.PRESERVE_HANDLER;
   }
}