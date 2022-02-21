/**
 * @copyright The Converse.js contributors
 * @license Mozilla Public License (MPLv2)
 */
import XMPPStatus from './status.js';
import status_api from './api.js';
import { _converse, api, converse } from 'src/lib/services/adapters/converse-xmpp/headless/core';
import { initStatus, onEverySecond, onUserActivity, registerIntervalHandler, sendCSI } from './utils.js';


converse.plugins.add('converse-status', {

    initialize () {

        api.settings.extend({
            auto_away: 0, // Seconds after which user status is set to 'away'
            auto_xa: 0, // Seconds after which user status is set to 'xa'
            csi_waiting_time: 0, // Support for XEP-0352. Seconds before client is considered idle and CSI is sent out.
            default_state: 'online',
            priority: 0,
        });
        api.promises.add(['statusInitialized']);

        _converse.XMPPStatus = XMPPStatus;
        _converse.onUserActivity = onUserActivity;
        _converse.onEverySecond = onEverySecond;
        _converse.sendCSI = sendCSI;
        _converse.registerIntervalHandler = registerIntervalHandler;

        Object.assign(_converse.api.user, status_api);

        api.listen.on('presencesInitialized', (reconnecting) => {
            if (!reconnecting) {
                _converse.registerIntervalHandler();
            }
        });

        api.listen.on('clearSession', () => {
            if (_converse.shouldClearCache() && _converse.xmppstatus) {
                _converse.xmppstatus.destroy();
                delete _converse.xmppstatus;
                api.promises.add(['statusInitialized']);
            }
        });

        api.listen.on('connected', () => initStatus(false));
        api.listen.on('reconnected', () => initStatus(true));
    }
});
