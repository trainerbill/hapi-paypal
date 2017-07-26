import * as tape from "blue-tape";
import * as hapi from "hapi";
import * as paypal from "paypal-rest-sdk";
import * as sinon from "sinon";
import * as superagent from "superagent";
import * as index from "../src";
import { config } from "./server";

const payload = { payload: "test" };

// Stubs
const createStub = sinon.stub(paypal.payment, "create").yields(null, payload);

const server = new hapi.Server();
server.connection({ port: process.env.PORT || 3000, host: process.env.IP || "0.0.0.0" });
const hapiPaypal = new index.HapiPayPal();
server.register({
    options: {
        ...config,
    },
    register: hapiPaypal.register,
});

tape("paypal_payment_create route", async (t) => {
    const res = await server.inject({
        method: "POST",
        payload,
        url: "/paypal/payment/create",
    });
    t.equal(res.payload, JSON.stringify(payload));
 });

tape("paypal_webhook_listen route", async (t) => {
    const res = await server.inject({
        method: "POST",
        payload,
        url: "/paypal/webhooks/listen",
    });
    t.equal(res.payload, "GOT IT!");
 });
