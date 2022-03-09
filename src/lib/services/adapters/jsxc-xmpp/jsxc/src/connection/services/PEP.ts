import AbstractService from './AbstractService';

export default class PEP extends AbstractService {
    public subscribe(node: string, handler: (stanza: string) => boolean, force: boolean = false): Promise<void> {
        this.account.getDiscoInfo().addFeature(node);
        this.account.getDiscoInfo().addFeature(`${node}+notify`);

        this.connection.registerHandler(handler, 'http://jabber.org/protocol/pubsub#event', 'message', null, null, null);

        if (force) {
            return this.connection.sendPresence();
        }

        return Promise.resolve();
    }

    public unsubscribe(node: string, force: boolean = false): Promise<void> {
        this.account.getDiscoInfo().removeFeature(node);
        this.account.getDiscoInfo().removeFeature(`${node}+notify`);

        if (force) {
            return this.connection.sendPresence();
        }

        return Promise.resolve();
    }

    public publish(node: string, element: Element, id?: string): Promise<Element> {
        const iqStanza = $iq({
            type: 'set',
        })
            .c('pubsub', {
                xmlns: 'http://jabber.org/protocol/pubsub',
            })
            .c('publish', {
                node,
            })
            .c('item', {
                id,
            })
            .cnode(element);

        return this.sendIQ(iqStanza);
    }

    public delete(node: string): Promise<Element> {
        const iqStanza = $iq({
            type: 'set',
        })
            .c('pubsub', {
                xmlns: 'http://jabber.org/protocol/pubsub#owner',
            })
            .c('delete', {
                node,
            });

        return this.sendIQ(iqStanza);
    }

    public retrieveItems(node: string, jid?: string, id?: string) {
        const iq = $iq({
            to: jid,
            type: 'get',
        });

        iq.c('pubsub', {
            xmlns: 'http://jabber.org/protocol/pubsub',
        });
        iq.c('items', {
            node,
        });

        if (id) {
            iq.c('item', {
                id,
            });
        }

        return this.sendIQ(iq);
    }
}