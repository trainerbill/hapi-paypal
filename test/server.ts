import * as glue from "glue";
import * as good from "good";
import * as hapi from "hapi";
import * as index from "../src";

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
        {
            config: {
                id: "paypal_invoice_cancel",
            },
        },
        {
            config: {
                id: "paypal_invoice_remind",
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

const manifest = {
    connections: [
        {
            host: process.env.IP || "0.0.0.0",
            port: process.env.PORT || 3000,
        },
    ],
    registrations: [
        {
            plugin: {
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
            },
        },
        {
            plugin: {
                options: config,
                register: new index.HapiPayPal().register,
            },
        },
    ],
};

if (!module.parent) {
    glue.compose(manifest).then((server: hapi.Server) => server.start());
}
