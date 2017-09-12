import * as tape from "blue-tape";
import * as hapi from "hapi";
import * as paypal from "paypal-rest-api";
import * as sinon from "sinon";
import * as index from "../src";
import { config } from "./server";

const nconfig = {
    routes: [{
        config: {
            id: "paypal_webhooks_listen",
        },
        handler: (request: any, reply: any) => {
            reply("GOT IT!");
        },
    }],
    sdk: {
        client_id: "asdfsadfasdfasdfsadfdsafasdfdsaf",
        client_secret: "asdfsadfasdfasdfsadfdsafasdfdsaf",
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
            {
                name: "PAYMENT.SALE.COMPLETED",
            },
        ],
        url: "https://www.youneedtochangethis.com/webhooks",
    },
};



tape("create webhook should", async (t) => {
    const sandbox = sinon.sandbox.create();
    const paypalStub = new paypal.PayPalRestApi(nconfig.sdk);
    const paypalTest = sandbox.stub(paypal, "PayPalRestApi").returns(paypalStub);
    const eventsStub = sandbox.stub(paypalStub.webhook.api, "types").resolves({ body: { event_types: [] } });
    const webhookStub = sandbox.stub(paypalStub.webhook.api, "list").resolves({ body: { webhooks: [] } });
    const createWebhookStub = sandbox.stub(paypalStub.webhook.api, "create").resolves({ body: paypal.mockWebhook });
    const server = new hapi.Server();
    server.connection({ port: process.env.PORT || 3000, host: process.env.IP || "0.0.0.0" });
    const hapiPaypal = new index.HapiPayPal();
    try {
        await server.register({
            options: nconfig,
            register: hapiPaypal.register,
        });
        // tslint:disable-next-line:max-line-length
        t.equal(createWebhookStub.withArgs({ body: nconfig.webhook }).called, true, "should call create webhook api with config");
    } catch (err) {
        t.fail("should not fail");
    }
    sandbox.restore();
 });

nconfig.webhook.url = paypal.mockWebhook.url;
tape("replace webhook", async (t) => {
    const sandbox = sinon.sandbox.create();
    const paypalStub = new paypal.PayPalRestApi(nconfig.sdk);
    const paypalTest = sandbox.stub(paypal, "PayPalRestApi").returns(paypalStub);
    const eventsStub = sandbox.stub(paypalStub.webhook.api, "types").resolves({ body: { event_types: [] } });
    const webhookStub = sandbox.stub(paypalStub.webhook.api, "list").resolves({
      body: {
        webhooks: [paypal.mockWebhook],
      },
    });
    const replaceWebhookStub = sandbox.stub(paypalStub.webhook.api, "update").resolves({ body: paypal.mockWebhook });
    const server = new hapi.Server();
    server.connection({ port: process.env.PORT || 3000, host: process.env.IP || "0.0.0.0" });
    const hapiPaypal = new index.HapiPayPal();
    try {
        await server.register({
            options: nconfig,
            register: hapiPaypal.register,
        });
        // tslint:disable-next-line:max-line-length
        t.equal(replaceWebhookStub.withArgs(paypal.mockWebhook.id ).called, true, "should call replace webhook api with config");
    } catch (err) {
        t.fail("should not fail");
    }
    sandbox.restore();
 });

tape("paypal_webhook_listen route", async (t) => {
    const sandbox = sinon.sandbox.create();
    const paypalStub = new paypal.PayPalRestApi(nconfig.sdk);
    const paypalTest = sandbox.stub(paypal, "PayPalRestApi").returns(paypalStub);
    const eventsStub = sandbox.stub(paypalStub.webhook.api, "types").resolves({ body: { event_types: [] } });
    const verifyStub = sandbox.stub(paypalStub.webhookEvent.api, "verify").resolves({verification: "success"});
    const webhookStub = sandbox.stub(paypalStub.webhook.api, "list").resolves({
      body: {
        webhooks: [paypal.mockWebhook],
      },
    });
    const replaceWebhookStub = sandbox.stub(paypalStub.webhook.api, "update").resolves({ body: paypal.mockWebhook });
    const server = new hapi.Server();
    server.connection({ port: process.env.PORT || 3000, host: process.env.IP || "0.0.0.0" });
    const hapiPaypal = new index.HapiPayPal();
    try {
        await server.register({
            options: nconfig,
            register: hapiPaypal.register,
        });
        const res = await server.inject({
            method: "POST",
            payload: { id: "testid" },
            url: "/paypal/webhooks/listen",
        });
        // tslint:disable-next-line:max-line-length
        t.equal(res.payload, "GOT IT!", "Should respond with got it.");
    } catch (err) {
        t.fail("should not fail");
    }
    sandbox.restore();
 });
