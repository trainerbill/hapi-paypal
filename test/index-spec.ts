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
    const sandbox = sinon.sandbox.create();
    const server = new hapi.Server();
    server.connection({ port: process.env.PORT || 3000, host: process.env.IP || "0.0.0.0" });

    await server.register({
        options: {
            sdk: configuration,
         },
        register: hapiPaypal.register,
    });
    // tslint:disable-next-line:max-line-length
    t.equal(server.plugins["hapi-paypal"].paypal instanceof paypal.PayPalRestApi, true, "should expose paypal-rest-api library");
    sandbox.restore();
});

