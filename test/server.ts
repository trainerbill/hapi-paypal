import * as dotenv from "dotenv";
import * as good from "good";
import * as hapi from "hapi";
import * as index from "../src";

dotenv.config();

export const config: index.IHapiPayPalOptions = {
    routes: [
        {
            config: {
                id: "paypal_payment_create",
            },
        },
        {
            config: {
                id: "paypal_webhooks_listen",
            },
            handler: (request, reply) => {
                reply("GOT IT!");
            },
        },
        {
            config: {
                id: "paypal_invoice_search",
            },
        },
        {
            config: {
                id: "paypal_invoice_create",
            },
        },
        {
            config: {
                id: "paypal_invoice_send",
            },
        },
        {
            config: {
                id: "paypal_invoice_get",
            },
        },
    ],
    sdk: {
        client_id: process.env.PAYPAL_CLIENT_ID,
        client_secret: process.env.PAYPAL_CLIENT_SECRET,
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
        url: process.env.PAYPAL_WEBHOOK_HOSTNAME || "https://www.youneedtochangethis.com",
    },
};

export const server = new hapi.Server();
server.connection({ port: process.env.PORT || 3000, host: process.env.IP || "0.0.0.0" });
const hapiPaypal = new index.HapiPayPal();

async function start() {
    await server.register([{
        options: {
            ...config,
        },
        register: hapiPaypal.register,
    },
    {
        options: {
                reporters: {
                    console: [{
                        args: [{
                            log: "*",
                            response: "*",
                        }],
                        module: "good-squeeze",
                        name: "Squeeze",
                    }, {
                        module: "good-console",
                    }, "stdout"],
                },
            },
        register: good.register,
    }]);

    server.start((error) => {
        if (error) {
            throw error;
        }
        server.log("info", `Server running at: ${server.info.uri}`);
    });
}

if (!module.parent) {
    start();
}
