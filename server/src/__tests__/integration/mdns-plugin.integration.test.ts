// MDNSPlugin.test.ts
/**
 * Some tests will fail unless run by themselves.
 */
import MDNSPlugin, { Options } from '../../mdns-plugin';
import { Socket } from "net";
import { IncomingMessage, ServerResponse } from 'http';
import { Server } from "../../server";
import request from 'supertest';

const defaultConfig: Options = {
    transmit: {
        priority: 1,
        readableName: 'Transmit',
        type: 'boolean',
        value: true,
    },
    receive: {
        priority: 1,
        readableName: 'Receive',
        type: 'boolean',
        value: true,
    },
    deviceName: {
        priority: 1,
        readableName: 'Device Name',
        type: 'string',
        value: 'test device',
    },
    txDelay: {
        priority: 1,
        readableName: 'Discovery Period',
        type: 'number',
        value: 500,
    }
}

/**
 * Class to expose protected functions for testing.
 */
class TestMDNSPlugin extends MDNSPlugin {
    public testNeighbours = () => this.neighbours;
    public testInterval = this.interval;
    public testHandleNeigbours = this.handleNeighbours;
    public testGetLocalIPAddresses = this.getLocalIPAddresses;
    public testMdns = this.mdns;
}

let server: Server


describe('MDNSPlugin', () => {
    let plugin: TestMDNSPlugin;


    beforeEach(() => {
        server = new Server('./test-plugin-config.json');
        plugin = new TestMDNSPlugin(server.Router!, defaultConfig);
        plugin.load();
    });

    afterEach(async () => {
        plugin.unload();
        await server.end();
    });

    test('should load the MDNSPlugin and discover itself', async () => {
        await new Promise((r) => setTimeout(r, defaultConfig.txDelay.value * 2));

        const response = await request(server['app']).get('/neighbours');
        const neighbours = JSON.parse(response.text);

        expect(plugin.testNeighbours().length).toBe(1);
        expect(response.status).toBe(200);
        expect(neighbours.length).toBe(1);

        const neighbour = neighbours[0];

        expect(neighbour).toHaveProperty('name')
        expect(neighbour).toHaveProperty('addresses')
        expect(neighbour.addresses.length).toBe(1)
        expect(neighbour.addresses[0]).toBe('127.0.0.1')

    });

    test('should unload the MDNSPlugin and stop the discovery process', () => {

        expect((plugin.testInterval! as any)._destroyed).toBeFalsy();

        plugin.unload();

        expect((plugin.testInterval! as any)._destroyed).toBeTruthy();
    });

    test('/neighbours route should be accesible and should return a JSON object containing a neighbour', async () => {
        const req = new IncomingMessage(new Socket());
        const res = new ServerResponse(req) as ServerResponse;
        res.setHeader = jest.fn();
        res.end = jest.fn();

        const response = await request(server['app']).get('/neighbours');
        expect(response.status).toBe(200);

        plugin.testHandleNeigbours(req, res);

        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
        expect(res.end).toHaveBeenCalled();

        plugin.unload();
    });
});

describe('changing initial configuration variables should modify plugin behaviours', () => {
    let plugin: TestMDNSPlugin;

    beforeEach(() => {
        server = new Server('./test-plugin-config.json');
    });

    afterEach(async () => {
        plugin.unload();
        await server.end();
    });

    test('receive true should allow the plugin to query the network', async () => {
        const testConfig = { ...defaultConfig }
        testConfig.receive.value = true;

        plugin = new TestMDNSPlugin(server.Router!, testConfig);
        plugin.testMdns.query = jest.fn();

        await new Promise((res) => setTimeout(res, testConfig.txDelay.value + 100));
        expect(plugin.testMdns.query).toHaveBeenCalled();
    })

    test('receive false should prevent the plugin from querying the network', async () => {
        const testConfig = { ...defaultConfig }
        testConfig.receive.value = false;

        plugin = new TestMDNSPlugin(server.Router!, testConfig);
        plugin.testMdns.query = jest.fn();

        await new Promise((res) => setTimeout(res, testConfig.txDelay.value + 100));
        expect(plugin.testMdns.query).not.toHaveBeenCalled();
    })

    /**
     * Fails if not run by itself
     */
    test('transmit true should allow the plugin to respond to incoming requests', async () => {
        const testConfig = { ...defaultConfig }
        testConfig.transmit.value = true;

        plugin = new TestMDNSPlugin(server.Router!, testConfig);
        plugin.testMdns.respond = jest.fn();

        await new Promise((res) => setTimeout(res, testConfig.txDelay.value + 100));
        expect(plugin.testMdns.respond).toHaveBeenCalled();
    })

    test('transmit false should prevent the plugin from responding to incoming requests', async () => {
        const testConfig = { ...defaultConfig }
        testConfig.transmit.value = false;

        plugin = new TestMDNSPlugin(server.Router!, testConfig);
        plugin.testMdns.respond = jest.fn();

        await new Promise((res) => setTimeout(res, testConfig.txDelay.value + 100));
        expect(plugin.testMdns.respond).not.toHaveBeenCalled();
    })

    /**
     * Fails if not run by itself
     */
    test('txDelay 500 should allow the plugin to automatically query the network every 500ms', async () => {
        const testConfig = { ...defaultConfig }
        testConfig.txDelay.value = 500;

        plugin = new TestMDNSPlugin(server.Router!, testConfig);
        plugin.testMdns.respond = jest.fn();

        expect(plugin.testMdns.respond).not.toHaveBeenCalled();
        await new Promise((res) => setTimeout(res, testConfig.txDelay.value - 100));
        expect(plugin.testMdns.respond).not.toHaveBeenCalled();
        await new Promise((res) => setTimeout(res, testConfig.txDelay.value + 100));
        expect(plugin.testMdns.respond).toHaveBeenCalled();
    })
})