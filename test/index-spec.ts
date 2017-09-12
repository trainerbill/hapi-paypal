import * as tape from "blue-tape";
import * as hapi from "hapi";
import * as paypal from "paypal-rest-api";
import * as sinon from "sinon";
import * as index from "../src";

const hapiPaypal = new index.HapiPayPal();
const configuration = {
    client_id: "clientidasdfasdfasdfasdf",
    client_secret: "clientsecretasdfasdfasfsadf",
    mode: "sandbox",
};

tape("should register plugin should", async (t) => {
    const server = new hapi.Server();
    server.connection({ port: process.env.PORT || 3000, host: process.env.IP || "0.0.0.0" });
    const sandbox = sinon.sandbox.create();
    const actualPaypal = new paypal.PayPalRestApi(configuration);
    const paypalStub = sandbox.stub(paypal, "PayPalRestApi").returns(actualPaypal);

    await server.register({
        options: {
            sdk: configuration,
         },
        register: hapiPaypal.register,
    });
    t.equal(paypalStub.withArgs(configuration).called, true, "configure paypal-rest-api");
    t.equal(server.plugins["hapi-paypal"].paypal, actualPaypal, "should expose paypal-rest-api library");
    sandbox.restore();
});

