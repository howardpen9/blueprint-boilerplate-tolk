import { toNano } from '@ton/core';
import { TolkExample } from '../wrappers/TolkExample';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const tolkExample = provider.open(
        TolkExample.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('TolkExample')
        )
    );

    await tolkExample.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(tolkExample.address);

    console.log('ID', await tolkExample.getID());
}
