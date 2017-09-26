import * as tape from "blue-tape";
import * as hapi from "hapi";
import * as paypal from "paypal-rest-api";
import * as sinon from "sinon";
import * as index from "../src";

const webhook = {
    event_types: paypal.mockWebhook.event_types,
    url: paypal.mockWebhook.url,
};

const nconfig = {
    routes: ["paypal_webhooks_listen"],
    sdk: {
        client_id: "asdfsadfasdfasdfsadfdsafasdfdsaf",
        client_secret: "asdfsadfasdfasdfsadfdsafasdfdsaf",
        mode: "sandbox",
    },
    webhook,
};

tape("create webhook should", async (t) => {
    const sandbox = sinon.sandbox.create();
    const server = new hapi.Server();
    const hapiPaypal = new index.HapiPayPal();
    hapiPaypal.paypal = new paypal.PayPalRestApi(nconfig.sdk);
    server.connection({ port: process.env.PORT || 3000, host: process.env.IP || "0.0.0.0" });
    const webhookStub = sandbox.stub(hapiPaypal.paypal.webhook.api, "list").resolves({
      body: {
        webhooks: [],
      },
    });
    // tslint:disable-next-line:max-line-length
    const createWebhookStub = sandbox.stub(hapiPaypal.paypal.webhook.api, "create").resolves({ body: paypal.mockWebhook });
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

tape("replace webhook", async (t) => {
    const sandbox = sinon.sandbox.create();
    const server = new hapi.Server();
    server.connection({ port: process.env.PORT || 3000, host: process.env.IP || "0.0.0.0" });
    const hapiPaypal = new index.HapiPayPal();
    hapiPaypal.paypal = new paypal.PayPalRestApi(nconfig.sdk);
    const webhookStub = sandbox.stub(hapiPaypal.paypal.webhook.api, "list").resolves({
      body: {
        webhooks: [paypal.mockWebhook],
      },
    });
    // tslint:disable-next-line:max-line-length
    const replaceWebhookStub = sandbox.stub(hapiPaypal.paypal.webhook.api, "update").resolves({ body: paypal.mockWebhook });
    try {
        await server.register({
            options: nconfig,
            register: hapiPaypal.register,
        });
        // tslint:disable-next-line:max-line-length
        t.equal(replaceWebhookStub.withArgs(paypal.mockWebhook.id).called, true, "should call replace webhook api with config");
    } catch (err) {
        t.fail("should not fail");
    }
    sandbox.restore();
 });

tape("paypal_webhook_listen route", async (t) => {
    const sandbox = sinon.sandbox.create();
    const server = new hapi.Server();
    server.connection({ port: process.env.PORT || 3000, host: process.env.IP || "0.0.0.0" });
    const hapiPaypal = new index.HapiPayPal();
    hapiPaypal.paypal = new paypal.PayPalRestApi(nconfig.sdk);
    // tslint:disable-next-line:max-line-length
    const verifyStub = sandbox.stub(hapiPaypal.paypal.webhookEvent, "verify").resolves({verification_status: "SUCCESS"});
    const webhookStub = sandbox.stub(hapiPaypal.paypal.webhook.api, "list").resolves({
      body: {
        webhooks: [paypal.mockWebhook],
      },
    });
    hapiPaypal.routes.get("paypal_webhooks_listen").custom = async (request, reply) => {
        reply("GOT IT!");
    };
    // tslint:disable-next-line:max-line-length
    const replaceWebhookStub = sandbox.stub(hapiPaypal.paypal.webhook.api, "update").resolves({ body: paypal.mockWebhook });
    await server.register({
        options: nconfig,
        register: hapiPaypal.register,
    });
    try {
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
