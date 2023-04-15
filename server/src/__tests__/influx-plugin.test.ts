import Influx, { Options } from '../influx-plugin';
import express, { Express, Request, Response } from 'express';
import request from 'supertest';
import http from 'http';
import * as Server from '../server'

const testConfig: Options = {
    INFLUX_PORT: {
        priority: 1,
        readableName: 'Influx Port',
        type: 'number',
        value: 4000,
    },
    INFLUX_DOMAIN: {
        priority: 1,
        readableName: 'Influx Domain',
        type: 'string',
        value: 'localhost',
    }
}

describe('HTTP Proxy', () => {
    let targetServer: http.Server;
    let targetApp: Express;
    let plugin: Influx;
    let server: Server.Server

    beforeAll((done) => {
        // Create server to receive initial request
        server = new Server.Server('./test-plugin-config.json');

        // Create test app to receive proxied request
        targetApp = express();
        targetApp.get('/target', (req: Request, res: Response) => {
            res.status(200).send('Target endpoint');
        });

        // Start test server to host test app
        targetServer = http.createServer(targetApp).listen(testConfig.INFLUX_PORT.value, done);
    });

    beforeEach(() => {
        plugin = new Influx(server.Router, testConfig);
    })

    afterAll(() => {
        targetServer.close();
    });

    afterEach(async () => {
        plugin.unload();
        await server.end();
    })

    test('successfully loads plugin and proxies a request to the target server', async () => {
        const response = await request(server['app']).get('/influx/target');

        expect(response.status).toBe(200);
        expect(response.text).toBe('Target endpoint');
    });

    test('successfully loads plugin and then fails to proxy a non-proxied path', async () => {

        const response = await request(server['app']).get('/target');

        expect(response.status).toBe(404);
        expect(response.text).toContain('Cannot GET');
    });
});