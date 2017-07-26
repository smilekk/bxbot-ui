import {ExchangeAdapter, NetworkConfig} from '../exchange-adapter.model';
import {ExchangeAdapterHttpDataPromiseService} from '../../exchange-adapter/promise';

/**
 * Fake Exchange Adapter data service (Promise flavour) backend for testing.
 *
 * @author gazbert
 */
export class FakeExchangeAdapterDataPromiseService extends ExchangeAdapterHttpDataPromiseService {

    exchangeAdapters = SOME_FAKE_PROMISE_EXCHANGE_ADAPTERS.map(e => e.clone());
    lastPromise: Promise<any>;  // remember so we can spy on promise calls

    getExchangeAdapters() {
        return this.lastPromise = Promise.resolve<ExchangeAdapter[]>(this.exchangeAdapters);
    }

    getExchangeAdapterByBotId(id: string) {
        const exchangeAdapter = this.exchangeAdapters.find(e => e.id === id);
        return this.lastPromise = Promise.resolve(exchangeAdapter);
    }

    update(exchangeAdapter: ExchangeAdapter): Promise<ExchangeAdapter> {
        return this.lastPromise = this.getExchangeAdapterByBotId(exchangeAdapter.id).then(e => {
            return e ?
                Object.assign(e, exchangeAdapter) :
                Promise.reject(`Exchange Adapter ${exchangeAdapter.id} not found`) as any as Promise<ExchangeAdapter>;
        });
    }
}

export const SOME_FAKE_PROMISE_EXCHANGE_ADAPTERS: ExchangeAdapter[] = [
    new ExchangeAdapter('bitstamp', 'Bitstamp', 'com.gazbert.bxbot.exchanges.BitstampExchangeAdapter',
        new NetworkConfig(60,
            [
                503,
                504,
                522,
            ],
            [
                'Connection reset',
                'Connection refused',
                'Remote host closed connection during handshake'
            ]
        )),
    new ExchangeAdapter('gdax', 'GDAX', 'com.gazbert.bxbot.exchanges.GdaxExchangeAdapter',
        new NetworkConfig(60,
            [
                503,
                504,
                522,
            ],
            [
                'Connection reset',
                'Connection refused',
                'Remote host closed connection during handshake'
            ]
        )),
    new ExchangeAdapter('gemini', 'Gemini', 'com.gazbert.bxbot.exchanges.GeminiExchangeAdapter',
        new NetworkConfig(60,
            [
                503,
                504,
                522,
            ],
            [
                'Connection reset',
                'Connection refused',
                'Remote host closed connection during handshake'
            ]
        ))
];
