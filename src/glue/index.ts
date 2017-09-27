import * as boom from "boom";
import { PluginRegistrationObject, RouteAdditionalConfigurationOptions } from "hapi";
import { HapiPayPal, IHapiPayPalOptions } from "../";

export const hapiPayPal = new HapiPayPal();

hapiPayPal.routes.get("paypal_webhooks_listen").custom = async (request, reply, error, response) => {
    // Handle webhooks here
    // tslint:disable-next-line:no-console
    console.log(request.payload);
};

const routes = process.env.PAYPAL_REST_ROUTES ?
    process.env.PAYPAL_REST_ROUTES.split(",") :
    Array.from(hapiPayPal.routes.keys());

export const hapiPayPalOptions: IHapiPayPalOptions = {
    routes,
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
    webhook: !process.env.PAYPAL_WEBHOOK_ENABLE ? null : {
        event_types: [...HapiPayPal.webhookEvents].map((event) => ({ name: event })),
        url: `https://${process.env.HOSTNAME}${process.env.PAYPAL_WEBHOOK_ROUTE}`,
    },
};

export const hapiPayPalPlugin: PluginRegistrationObject<any> = {
    options: hapiPayPalOptions,
    register: hapiPayPal.register,
    select: [process.env.PAYPAL_HAPI_CONNECTION || "public"],
};

export const hapiPayPalGlueRegistration = {
    plugin: hapiPayPalPlugin,
};

export default [hapiPayPalGlueRegistration];
