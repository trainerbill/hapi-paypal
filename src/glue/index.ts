import * as boom from "boom";
import { PluginRegistrationObject } from "hapi";
import { HapiPayPal, IHapiPayPalOptions } from "../";

export const hapiPayPal = new HapiPayPal();

hapiPayPal.routes.get("paypal_webhooks_listen").custom = async (request, reply, error, response) => {
    // Handle webhooks here
    // tslint:disable-next-line:no-console
    console.log(request.payload);
};

export const hapiPayPalOptions: IHapiPayPalOptions = {
    routes: Array.from(hapiPayPal.routes.keys()),
    sdk: {
        client_id: process.env.PAYPAL_CLIENT_ID,
        client_secret: process.env.PAYPAL_CLIENT_SECRET,
        mode: process.env.PAYPAL_MODE,
        requestOptions: {
          headers: {
              "PayPal-Partner-Attribution-Id": "Hapi-PayPal",
          },
        },
    },
    webhook: {
        event_types: [...HapiPayPal.webhookEvents].map((event) => ({ name: event })),
        url: process.env.PAYPAL_WEBHOOK_HOSTNAME,
    },
};

export const hapiPayPalPlugin: PluginRegistrationObject<any> = {
    options: hapiPayPalOptions,
    register: hapiPayPal.register,
    select: ["public"],
};

export const hapiPayPalGlueRegistration = {
    plugin: hapiPayPalPlugin,
};

export default [hapiPayPalGlueRegistration];
