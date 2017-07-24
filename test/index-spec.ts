import * as tape from "blue-tape";
import * as hapi from "hapi";
import * as paypal from "paypal-rest-sdk";
import * as sinon from "sinon";
import * as index from "../src";

const defaultOptions: index.IHapiPayPalOptions = {
    routes: [
        {
            config: {
                id: "paypal_payment_create",
            },
            handler: (request, reply, error, response) => {
                reply(response);
            },
        },
        {
            config: {
                id: "paypal_webhooks_listen",
            },
            handler: (request, reply, error, response) => {
                return;
            },
        },
    ],
    sdk: {
        client_id: "asdfasdfasfdasdfasdfsf",
        client_secret: "asdfasdfasfdasdfasdfsf",
        mode: "sandbox",
    },
    webhook: {
        event_types: [
            {
                name: "INVOICING.INVOICE.PAID",
            },
            {
                name: "INVOICING.INVOICE.CANCELLED",
            },
        ],
        url: "https://test.com/test",
    },
};

async function createHapiServer(myoptions?: index.IHapiPayPalOptions) {
    const hapiPaypal = new index.HapiPayPal();
    const server = new hapi.Server();
    server.connection({ port: process.env.PORT || 3000, host: process.env.IP || "0.0.0.0" });
    await server.register({
        options: { ...defaultOptions, ...myoptions },
        register: hapiPaypal.register,
    });
    return server;
}

tape("export", (t) => {
    t.plan(1);
    t.equal(typeof index.HapiPayPal, "function");
});

tape("server register webhooks", async (t) => {
    try {
        const sandbox = sinon.sandbox.create();
        const configStub = sandbox.stub(paypal, "configure");
        const eventsStub = sandbox.stub(paypal.notification.webhookEventType, "list").yields(null, { event_types: [] });
        const webhookStub = sandbox.stub(paypal.notification.webhook, "list").yields(null, { webhooks: [] });
        const createWebhookStub = sandbox.stub(paypal.notification.webhook, "create").yields(null, { id: "webhookid" });
        const server = await createHapiServer();
        t.equal(configStub.calledWith(defaultOptions.sdk), true);
        t.deepEqual(
            createWebhookStub.calledWith(
                { ...defaultOptions.webhook, ...{ url: defaultOptions.webhook.url + "/paypal/webhooks/listen" } },
            ),
        true);
        sandbox.restore();
    } catch (err) {
        throw err;
    }
});

tape("server register webhook replace", async (t) => {
    const sandbox = sinon.sandbox.create();
    const mockHook = { webhooks: [{id: "webhookid", url: "https://test.com/test/paypal/webhooks/listen"}]};
    const configStub = sandbox.stub(paypal, "configure");
    const eventsStub = sandbox.stub(paypal.notification.webhookEventType, "list").yields(null, { event_types: [] });
    const webhookStub = sandbox.stub(paypal.notification.webhook, "list").yields(null, mockHook);
    const replaceWebhookStub = sandbox.stub(paypal.notification.webhook, "replace").yields(null, { id: "webhookid" });
    try {
        const server = await createHapiServer();
        t.equal(configStub.calledWith(defaultOptions.sdk), true);
        t.equal(replaceWebhookStub.calledWith("webhookid"), true);
        sandbox.restore();
    } catch (err) {
        throw err;
    }
});
