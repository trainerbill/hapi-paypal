import * as hapi from "hapi";
import * as Joi from "joi";
import * as paypal from "paypal-rest-sdk";
import * as pkg from "../package.json";
import * as Models from "./models";

export type Partial<T> = {
    [P in keyof T]?: T[P];
};

export interface IHapiPayPalOptions {
    models?: string[];
    sdk: any;
    routes: [Partial<IPayPalRouteConfiguration>];
    webhook?: paypal.notification.webhook.Webhook;
}

export interface IPayPalRouteConfiguration extends hapi.RouteConfiguration {
    handler?: hapi.RouteHandler | IPayPalRouteHandler;
    config?: {
        id?: string;
    };
}

export type IPayPalRouteHandler = (
    request: hapi.Request,
    reply: hapi.ReplyNoContinue,
    error: any,
    response: any) => void;

export class HapiPayPal {

    private webhookEvents: paypal.notification.NotificationEventType[];
    private webhook: paypal.notification.webhook.Webhook;
    private routes: hapi.RouteConfiguration[] = [];

    constructor() {
        this.register.attributes = {
            pkg,
        };

    }

    // tslint:disable-next-line:max-line-length
    public register: hapi.PluginFunction<any> = (server: hapi.Server, options: IHapiPayPalOptions, next: hapi.ContinuationFunction) => {

        const sdkSchema = Joi.object().keys({
            client_id: Joi.string().min(10).required(),
            client_secret: Joi.string().min(10).required(),
            mode: Joi.string().valid("sandbox", "live").required(),
        });

        const sdkValidate = Joi.validate(options.sdk, sdkSchema);
        if (sdkValidate.error) {
            throw sdkValidate.error;
        }

        paypal.configure({
            client_id: options.sdk.client_id,
            client_secret: options.sdk.client_secret,
            mode: "sandbox",
        });

        options.routes.forEach((route) =>  server.route(this.buildRoute(route)));

        if (options.webhook) {
            const webhooksSchema = Joi.object().keys({
                event_types: Joi.array().min(1).required(),
                url: Joi.string().uri({ scheme: ["https"] }).required(),
            });

            const validate = Joi.validate(options.webhook, webhooksSchema);
            if (validate.error) {
                throw validate.error;
            }

            this.webhook = options.webhook;

            // tslint:disable-next-line:max-line-length
            const webhookRoute = options.routes.filter((route) => route.config.id === "paypal_webhooks_listen")[0];
            if (!webhookRoute) {
                throw new Error("You enabled webhooks without a route listener.");
            }

            this.webhook.url += webhookRoute.path;

            this.enableWebhooks();

        }

        /*
        if (options.models && options.models.length > 0) {
            const addModel = server.plugins["hapi-mongo-models"].addModel;
            options.models.map((model) => {
                server.log(`Enabling Model: ${model}`);
                addModel(model, (Models as any)[model]);
            });
        }
        */

        next();
    }

    private buildRoute(route: Partial<IPayPalRouteConfiguration>): hapi.RouteConfiguration {
        const handler = route.handler as hapi.RouteHandler;
        let nHandler: hapi.RouteHandler;

        if (!route.config || !route.config.id) {
            throw new Error("You must set route.config.id");
        }

        switch (route.config.id) {
            case "paypal_payment_create":
                route.path = route.path || "/paypal/payment/create";
                route.method = route.method || "POST";
                nHandler = (request, reply) => {
                    const temp = arguments;
                    paypal.payment.create(this.getMockData("payment_create"), (error, payment) => {
                        if (handler) {
                            handler.apply(this, [request, reply, error, payment]);
                        } else {
                            error ? reply(error) : reply(payment);
                        }
                    });
                };
                route.handler = nHandler;
                break;

            case "paypal_webhooks_listen":
                route.method = "POST";
                route.path = route.path || "/paypal/webhooks/listen";
                nHandler = (request, reply) => {
                    const temp = arguments;
                    handler.apply(this, [request, reply]);
                    reply("Got it!");
                };
                route.handler = nHandler;
                break;
        }
        this.routes.push(route as hapi.RouteConfiguration);
        return route as hapi.RouteConfiguration;
    }

    private getMockData(type: string): any {
        let json: any;
        switch (type) {
            case "payment_create":
                json = {
                    intent: "sale",
                    payer: {
                        payment_method: "paypal",
                    },
                    redirect_urls: {
                        cancel_url: "http://cancel.url",
                        return_url: "http://return.url",
                    },
                    transactions: [{
                        amount: {
                            currency: "USD",
                            total: "1.00",
                        },
                        description: "This is the payment description.",
                        item_list: {
                            items: [{
                                currency: "USD",
                                name: "item",
                                price: "1.00",
                                quantity: 1,
                                sku: "item",
                            }],
                        },
                    }],
                };
                break;
        }

        return json;
    }

    private async enableWebhooks() {
        try {
            this.webhookEvents = await this.getWebhookEventTypes();
            const accountWebHooks = await this.getAccountWebhooks();
            this.webhook = accountWebHooks.filter((hook) => hook.url === this.webhook.url)[0] || this.webhook;
            if (!this.webhook.id) {
                this.webhook = await this.createWebhook();
            }
            this.webhook = await this.replaceWebhook();
        } catch (err) {
            throw err;
        }
    }

    private getWebhookEventTypes(): Promise<paypal.notification.NotificationEventType[]> {
        return new Promise((resolve, reject) => {
            paypal.notification.webhookEventType.list((error, webhooks) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(webhooks.event_types);
                }
            });
        });
    }

    private getAccountWebhooks(): Promise<paypal.notification.webhook.Webhook[]> {
        return new Promise((resolve, reject) => {
            paypal.notification.webhook.list((error, webhooks) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(webhooks.webhooks);
                }
            });
        });
    }

    private createWebhook(): Promise<paypal.notification.webhook.Webhook> {
        const webhookConfig = this.webhook;
        return new Promise((resolve, reject) => {
            paypal.notification.webhook.create(webhookConfig, (error, webhook) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(webhook);
                }
            });
        });
    }

    private replaceWebhook(): Promise<paypal.notification.webhook.Webhook> {
        const webhookConfig = this.webhook;
        return new Promise((resolve, reject) => {
            paypal.notification.webhook.replace(this.webhook.id, [{
                op: "replace",
                path: "/event_types",
                value: webhookConfig.event_types,
            }], (error, webhook) => {
                if (error && error.response.name !== "WEBHOOK_PATCH_REQUEST_NO_CHANGE") {
                    reject(error);
                } else {
                    resolve(webhook);
                }
            });
        });
    }

}
