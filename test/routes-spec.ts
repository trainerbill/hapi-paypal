import * as tape from "blue-tape";
import * as hapi from "hapi";
import * as paypal from "paypal-rest-api";
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
const data = { body: payload };

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
    const paypalStub = new paypal.PayPalRestApi(nconfig.sdk);
    const paypalTest = sandbox.stub(paypal, "PayPalRestApi").returns(paypalStub);
    const spy = sandbox.stub(paypalStub.payment.api, "create").resolves(data);
    const res = await server.inject({
        method: "POST",
        payload,
        url: "/paypal/payment/create",
    });
    t.equal(spy.withArgs(data).called, true, "call paypal.payment.api.create");
    t.equal(res.payload, JSON.stringify(payload));
    sandbox.restore();
 });

tape("paypal_invoice_search route should", async (t) => {
    const sandbox = sinon.sandbox.create();
    const paypalStub = new paypal.PayPalRestApi(nconfig.sdk);
    const paypalTest = sandbox.stub(paypal, "PayPalRestApi").returns(paypalStub);
    const spy = sandbox.stub(paypalStub.invoice.api, "search").resolves(data);
    const res = await server.inject({
        method: "POST",
        payload,
        url: "/paypal/invoice/search",
    });
    t.equal(spy.withArgs(data).called, true, "call paypal.invoice.api.search");
    t.equal(res.payload, JSON.stringify(payload), "respond with paypal response");
    sandbox.restore();
 });

tape("paypal_invoice_create route", async (t) => {
    const sandbox = sinon.sandbox.create();
    const paypalStub = new paypal.PayPalRestApi(nconfig.sdk);
    const paypalTest = sandbox.stub(paypal, "PayPalRestApi").returns(paypalStub);
    const spy = sandbox.stub(paypalStub.invoice.api, "create").resolves(data);
    const res = await server.inject({
        method: "POST",
        payload,
        url: "/paypal/invoice",
    });
    t.equal(spy.withArgs(data).called, true, "call paypal.invoice.api.create");
    t.equal(res.payload, JSON.stringify(payload), "respond with paypal response");
    sandbox.restore();
 });

tape("paypal_invoice_send route", async (t) => {
    const sandbox = sinon.sandbox.create();
    const paypalStub = new paypal.PayPalRestApi(nconfig.sdk);
    const paypalTest = sandbox.stub(paypal, "PayPalRestApi").returns(paypalStub);
    const spy = sandbox.stub(paypalStub.invoice.api, "send").resolves(data);
    const res = await server.inject({
        method: "POST",
        payload,
        url: "/paypal/invoice/testid/send",
    });
    t.equal(spy.withArgs("testid", data).called, true, "call paypal.invoice.api.send");
    t.equal(res.payload, JSON.stringify(payload), "respond with paypal response");
    sandbox.restore();
 });

tape("paypal_invoice_get route", async (t) => {
    const sandbox = sinon.sandbox.create();
    const paypalStub = new paypal.PayPalRestApi(nconfig.sdk);
    const paypalTest = sandbox.stub(paypal, "PayPalRestApi").returns(paypalStub);
    const spy = sandbox.stub(paypalStub.invoice.api, "get").resolves(data);
    const res = await server.inject({
        method: "GET",
        payload,
        url: "/paypal/invoice/testid",
    });
    t.equal(spy.withArgs("testid").called, true, "call paypal.invoice.api.get");
    t.equal(res.payload, JSON.stringify(payload), "respond with paypal response");
    sandbox.restore();
 });

tape("paypal_invoice_cancel route", async (t) => {
    const sandbox = sinon.sandbox.create();
    const paypalStub = new paypal.PayPalRestApi(nconfig.sdk);
    const paypalTest = sandbox.stub(paypal, "PayPalRestApi").returns(paypalStub);
    const spy = sandbox.stub(paypalStub.invoice.api, "cancel").resolves(data);
    const res = await server.inject({
        method: "POST",
        payload,
        url: "/paypal/invoice/testid/cancel",
    });
    t.equal(spy.withArgs("testid", data).called, true, "call paypal.invoice.api.cancel");
    t.equal(res.payload, JSON.stringify(payload), "respond with paypal response");
    sandbox.restore();
 });
tape("paypal_invoice_remind route", async (t) => {
    const sandbox = sinon.sandbox.create();
    const paypalStub = new paypal.PayPalRestApi(nconfig.sdk);
    const paypalTest = sandbox.stub(paypal, "PayPalRestApi").returns(paypalStub);
    const spy = sandbox.stub(paypalStub.invoice.api, "remind").resolves(data);
    const res = await server.inject({
        method: "POST",
        payload,
        url: "/paypal/invoice/testid/remind",
    });
    t.equal(spy.withArgs("testid", data).called, true, "call paypal.invoice.api.remind");
    t.equal(res.payload, JSON.stringify(payload), "respond with paypal response");
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
