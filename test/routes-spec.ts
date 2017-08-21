import * as tape from "blue-tape";
import * as hapi from "hapi";
import * as paypal from "paypal-rest-sdk";
import * as sinon from "sinon";
import * as index from "../src";
import { config } from "./server";

const nconfig = {
    routes: config.routes,
    sdk: {
        client_id: "asdfsadfasdfasdfsadfdsafasdfdsaf",
        client_secret: "asdfsadfasdfasdfsadfdsafasdfdsaf",
        mode: "sandbox",
    },
};

const payload = { id: "test", payload: "test" };

const server = new hapi.Server();
server.connection({ port: process.env.PORT || 3000, host: process.env.IP || "0.0.0.0" });
const hapiPaypal = new index.HapiPayPal();
server.register({
    options: {
        ...nconfig,
    },
    register: hapiPaypal.register,
});

tape("paypal_payment_create route", async (t) => {
    const sandbox = sinon.sandbox.create();
    const configStub = sandbox.stub(paypal.payment, "create").yields(null, payload);
    const res = await server.inject({
        method: "POST",
        payload,
        url: "/paypal/payment/create",
    });
    t.equal(res.payload, JSON.stringify(payload));
    sandbox.restore();
 });

tape("paypal_invoice_search route", async (t) => {
    const sandbox = sinon.sandbox.create();
    const configStub = sandbox.stub(paypal.invoice, "search").yields(null, payload);
    const res = await server.inject({
        method: "POST",
        payload,
        url: "/paypal/invoice/search",
    });
    t.equal(res.payload, JSON.stringify(payload));
    sandbox.restore();
 });

 tape("paypal_invoice_create route", async (t) => {
    const sandbox = sinon.sandbox.create();
    const configStub = sandbox.stub(paypal.invoice, "create").yields(null, payload);
    const res = await server.inject({
        method: "POST",
        payload,
        url: "/paypal/invoice",
    });
    t.equal(res.payload, JSON.stringify(payload));
    sandbox.restore();
 });

 tape("paypal_invoice_send route", async (t) => {
    const sandbox = sinon.sandbox.create();
    const configStub = sandbox.stub(paypal.invoice, "send").yields(null, payload);
    const res = await server.inject({
        method: "POST",
        payload,
        url: "/paypal/invoice/{invoiceid}/send",
    });
    t.equal(res.payload, JSON.stringify(payload));
    sandbox.restore();
 });
tape("paypal_invoice_get route", async (t) => {
    const sandbox = sinon.sandbox.create();
    const configStub = sandbox.stub(paypal.invoice, "get").yields(null, payload);
    const res = await server.inject({
        method: "GET",
        payload,
        url: "/paypal/invoice/{invoiceid}",
    });
    t.equal(res.payload, JSON.stringify(payload));
    sandbox.restore();
 });
tape("paypal_invoice_cancel route", async (t) => {
    const sandbox = sinon.sandbox.create();
    const configStub = sandbox.stub(paypal.invoice, "cancel").yields(null, payload);
    const res = await server.inject({
        method: "POST",
        payload,
        url: "/paypal/invoice/{invoiceid}/cancel",
    });
    t.equal(res.payload, JSON.stringify(payload));
    sandbox.restore();
 });
tape("paypal_invoice_remind route", async (t) => {
    const sandbox = sinon.sandbox.create();
    const configStub = sandbox.stub(paypal.invoice, "remind").yields(null, payload);
    const res = await server.inject({
        method: "POST",
        payload,
        url: "/paypal/invoice/{invoiceid}/remind",
    });
    t.equal(res.payload, JSON.stringify(payload));
    sandbox.restore();
 });
tape("paypal_invoice_update route", async (t) => {
    const sandbox = sinon.sandbox.create();
    const configStub = sandbox.stub(paypal.invoice, "update").yields(null, payload);
    const res = await server.inject({
        method: "PUT",
        payload,
        url: "/paypal/invoice/{invoiceid}",
    });
    t.equal(res.payload, JSON.stringify(payload));
    sandbox.restore();
 });
