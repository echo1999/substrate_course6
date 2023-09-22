import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import "@polkadot/api-augment"
import { FrameSystemAccountInfo } from "@polkadot/types/lookup";
import { KeyringPair } from "@polkadot/keyring/types";


const WEB_SOCKET = 'ws://127.0.0.1:9944';
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const connect = async() => {
    const wsProvider = new WsProvider(WEB_SOCKET);
    const api = await ApiPromise.create({provider: wsProvider, types: {}});
    await api.isReady;
    return api;
}

const doSomething = async(api: ApiPromise, alice: KeyringPair, something: number) => {
    await api.tx.templateModule.doSomething(something).signAndSend(alice, res =>{
    });
}

const getSomething = async(api: ApiPromise) => {
    return await api.query.templateModule.something();
}

const getConst = async(api: ApiPromise) => {
    const existentialDeposit = await api.consts.balances.existentialDeposit.toHuman();
    return existentialDeposit;
}

const getFreeBalance = async(api: ApiPromise, address: string) => {
    const {data: {free, }, }: FrameSystemAccountInfo = await api.query.system.account(address);
    return free;
}

const transfer = async(api: ApiPromise, alice: KeyringPair, bob: string, amount: number) => {
    await api.tx.balances
        .transfer(bob, amount)
        .signAndSend(alice, res => {
            console.log(`Tx status: ${res.status}`);
        });
}

const getMetaData = async (api: ApiPromise) => {
    const metaData = await api.rpc.state.getMetadata();
    return metaData.toString();
}

const subscribe = async (api: ApiPromise, address: string) => {
    await api.query.system.account(address, aliceInfo => {
        const freeBalance = aliceInfo.data.free.toHuman();
        console.log('freeBalance is: ', freeBalance);
    });
}

const subscribeEvents = async (api: ApiPromise) => {
    await api.query.system.events(events => {
        events.forEach(function(event) {
            console.log('index= ', event['event']['index'].toHuman());
            console.log('data= ', event['event']['data'].toHuman());
        });
    });
}

const main = async() => {
    const api = await connect();

   const keyring = new Keyring({type: 'sr25519'});
   const alice = keyring.addFromUri('//Alice');
   //await subscribe(api, alice.address);

   await subscribeEvents(api);

   const something = random(0,1000);
   console.log('Create random something = ${something}');

   doSomething(api, alice, something);
   await sleep(10*1000);

   const res = await getSomething(api);
   console.log('The state of something = ${res}');
   await sleep(10*1000);
}

main()
    .then(() => {
        console.log('Process exit');
    })
    .catch(err => {
        console.log('Process error: ', err);
        process.exit(1);
    }); 