import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { compile } from '@ton/blueprint';
import '@ton/test-utils';
import { TolkExample } from '../wrappers/TolkExample'; // The place for the wrapper 

describe('TolkExample', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('TolkExample');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let tolkExample: SandboxContract<TolkExample>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        tolkExample = blockchain.openContract(
            TolkExample.createFromConfig(
                {
                    id: 0,       // ctxID
                    counter: 0,  // ctxCounter
                },
                code
            )
        );

        deployer = await blockchain.treasury('deployer');

        const deployResult = await tolkExample.sendDeploy(deployer.getSender(), toNano('0.05'));
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: tolkExample.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and tolkExample are ready to use
    });

    it('should increase counter', async () => {
        const increaseTimes = 3;

        for (let i = 0; i < increaseTimes; i++) {
            console.log(`increase ${i + 1}/${increaseTimes}`);

            const increaser = await blockchain.treasury('increaser' + i);

            const counterBefore = await tolkExample.getCounter();
            console.log('counter before increasing', counterBefore);

            const increaseBy = Math.floor(Math.random() * 100);
            console.log('increasing by', increaseBy);

            const increaseResult = await tolkExample.sendIncrease(increaser.getSender(), {
                increaseBy,
                value: toNano('0.05'),
            });

            expect(increaseResult.transactions).toHaveTransaction({
                from: increaser.address,
                to: tolkExample.address,
                success: true,
            });

            const counterAfter = await tolkExample.getCounter();
            console.log('counter after increasing', counterAfter);

            expect(counterAfter).toBe(counterBefore + increaseBy);
        }
    });
});
