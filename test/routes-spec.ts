import * as tape from "blue-tape";
import * as hapi from "hapi";
import * as paypal from "paypal-rest-api";
import * as sinon from "sinon";
import * as index from "../src";

const nconfig = {
    routes: [...index.hapiPayPal.routes.keys()],
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
    const paypalStub = sandbox.stub(hapiPaypal.paypal.payment.api, "create").resolves(data);
    const res = await server.inject({
        method: "POST",
        payload,
        url: "/paypal/payment",
    });
    t.equal(paypalStub.withArgs(data).called, true, "call paypal create with correct data");
    t.equal(res.payload, JSON.stringify(payload));
    sandbox.restore();
 });

tape("paypal_invoice_search route should", async (t) => {
    const sandbox = sinon.sandbox.create();
    const paypalStub = sandbox.stub(hapiPaypal.paypal.invoice.api, "search").resolves(data);
    const res = await server.inject({
        method: "POST",
        payload,
        url: "/paypal/invoice/search",
    });
    t.equal(paypalStub.withArgs(data).called, true, "call paypal invoice search with correct data");
    t.equal(res.payload, JSON.stringify(payload), "respond with paypal response");
    sandbox.restore();
 });

tape("paypal_invoice_create route", async (t) => {
    const sandbox = sinon.sandbox.create();
    const paypalStub = sandbox.stub(hapiPaypal.paypal.invoice.api, "create").resolves(data);
    const res = await server.inject({
        method: "POST",
        payload,
        url: "/paypal/invoice",
    });
    t.equal(paypalStub.withArgs(data).called, true, "call paypal invoice create with correct data");
    t.equal(res.payload, JSON.stringify(payload), "respond with paypal response");
    sandbox.restore();
 });

tape("paypal_invoice_send route", async (t) => {
    const sandbox = sinon.sandbox.create();
    const paypalStub = sandbox.stub(hapiPaypal.paypal.invoice.api, "send").resolves(data);
    const res = await server.inject({
        method: "POST",
        payload,
        url: "/paypal/invoice/testid/send",
    });
    t.equal(paypalStub.withArgs("testid", data).called, true, "call paypal invoice send with correct data");
    t.equal(res.payload, JSON.stringify(payload), "respond with paypal response");
    sandbox.restore();
 });

tape("paypal_invoice_get route", async (t) => {
    const sandbox = sinon.sandbox.create();
    const paypalStub = sandbox.stub(hapiPaypal.paypal.invoice.api, "get").resolves(data);
    const res = await server.inject({
        method: "GET",
        payload,
        url: "/paypal/invoice/testid",
    });
    t.equal(paypalStub.withArgs("testid").called, true, "call paypal invoice get with correct data");
    t.equal(res.payload, JSON.stringify(payload), "respond with paypal response");
    sandbox.restore();
 });

tape("paypal_invoice_cancel route", async (t) => {
    const sandbox = sinon.sandbox.create();
    const paypalStub = sandbox.stub(hapiPaypal.paypal.invoice.api, "cancel").resolves(data);
    const res = await server.inject({
        method: "POST",
        payload,
        url: "/paypal/invoice/testid/cancel",
    });
    t.equal(paypalStub.withArgs("testid", data).called, true, "call paypal invoice cancel with correct data");
    t.equal(res.payload, JSON.stringify(payload), "respond with paypal response");
    sandbox.restore();
 });
tape("paypal_invoice_remind route", async (t) => {
    const sandbox = sinon.sandbox.create();
    const paypalStub = sandbox.stub(hapiPaypal.paypal.invoice.api, "remind").resolves(data);
    const res = await server.inject({
        method: "POST",
        payload,
        url: "/paypal/invoice/testid/remind",
    });
    t.equal(paypalStub.withArgs("testid", data).called, true, "call paypal invoice remind with correct data");
    t.equal(res.payload, JSON.stringify(payload), "respond with paypal response");
    sandbox.restore();
 });
