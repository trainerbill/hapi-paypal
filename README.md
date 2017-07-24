[![npm version](https://badge.fury.io/js/hapi-paypal.svg)](https://badge.fury.io/js/hapi-paypal)
[![Dependency Status](https://david-dm.org/trainerbill/paypal-hapi.svg)](https://david-dm.org/trainerbill/paypal-hapi)
[![devDependency Status](https://david-dm.org/trainerbill/paypal-hapi/dev-status.svg)](https://david-dm.org/trainerbill/paypal-hapi#info=devDependencies)
# hapi-paypal
Hapi Plugin for PayPal REST API's

# Usage

```
const hapiPayPalOptions = {
    routes: [
        // Enable any routes supported by the plugin:  https://github.com/trainerbill/hapi-paypal/blob/master/src/index.ts#L78
        // Handler gets called after the paypal api call.
        // Response from paypal is returned to your handler in the 3rd argument
        {
            config: {
                id: "paypal_payment_create",
            },
            handler: (request: any, reply: any, response: any) => {
                server.log(response);
                reply(response);
            },
        },
        // IF you enable webhooks you need a listener route.  Handler gets called after receiving every webhook.  We recommend saving to a database.
        {
            config: {
                id: "paypal_webhooks_listen",
            },
            handler: (request: any, reply: any, response: any) => {
                reply("GOT IT!");
            },
        },
    ],
    sdk: {
        // PayPal SDK Configuration: https://github.com/paypal/PayPal-node-SDK/blob/master/lib/configure.js
        client_id: process.env.PAYPAL_CLIENT_ID,
        client_secret: process.env.PAYPAL_CLIENT_SECRET,
        mode: "sandbox",
    },
    // Enables webhooks
    webhooks: {
        event_types: [
            {
                // Any Webhook names you want enabled: https://developer.paypal.com/docs/integration/direct/webhooks/event-names/
                name: "INVOICING.INVOICE.PAID",
            },
            {
                name: "INVOICING.INVOICE.CANCELLED",
            },
        ],
        // Host name for webhooks.  Must be SSL.
        url: "https://www.yourwebhookdomain.com',
    },
};

const hapiPaypal = {
    options: hapiPayPalOptions,
    register: new HapiPayPal(),
};

server.register(hapiPaypal);
```
