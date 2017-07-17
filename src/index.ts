import * as hapi from "hapi";
import * as Joi from "joi";
import * as paypal from "paypal-rest-sdk";
import * as pkg from "../package.json";

export interface IHapiPayPalOptions {
    sdk: paypal.IConfigureOptions;
    routes: hapi.RouteConfiguration[];
    webhooks: paypal.IWebhookRequest;
}

export interface IPayPalRouteHandler extends hapi.RouteHandler {
    (response: any): void;
}

export class HapiPayPal {

    private webhookEvents: paypal.IEventType[];
    private webhookConfig: paypal.IWebhookRequest;
    private webhook: paypal.IWebhook;
    private routes: hapi.RouteConfiguration[] = [];

    constructor() {
        this.register.attributes = {
            pkg,
        };

    }

    // tslint:disable-next-line:max-line-length
    public register: hapi.PluginFunction<any> = (server: hapi.Server, options: IHapiPayPalOptions, next: hapi.ContinuationFunction) => {

        const sdkSchema = Joi.object().keys({
            client_id: Joi.string().alphanum().min(10).required(),
            client_secret: Joi.string().alphanum().min(10).required(),
            mode: Joi.string().valid("sandbox", "live").required(),
        });

        Joi.validate(options.sdk, sdkSchema);

        paypal.configure({
            client_id: options.sdk.client_id,
            client_secret: options.sdk.client_secret,
            mode: "sandbox",
        });

        options.routes.forEach((route) =>  server.route(this.buildRoute(route)));

        if (options.webhooks) {
            const webhooksSchema = Joi.object().keys({
                enable: Joi.array().min(1).required(),
                url: Joi.string().uri(),
            });

            Joi.validate(options.webhooks, webhooksSchema);

            this.webhookConfig = options.webhooks;

            const webhookRoute = options.routes.filter((route) => route.config.id === "paypal_webhooks_listen")[0];
            if (!webhookRoute) {
                throw new Error("You enabled webhooks without a route listener.");
            }

            this.webhookConfig.url += webhookRoute.path;

            this.enableWebhooks();
        }

        next();

    }

    private buildRoute(route: hapi.RouteConfiguration): hapi.RouteConfiguration {
        const handler = route.handler as hapi.RouteHandler;
        if (!route.config.id) {
            throw new Error("You must set route.config.id");
        }
        switch (route.config.id) {
            case "paypal_payment_create":
                route.path = route.path || "/paypal/payment/create";
                route.method = route.method || "POST";
                const nHandler: hapi.RouteHandler = (request, reply) => {
                    const temp = arguments;
                    paypal.payment.create(this.getMockData("payment_create"), (error, payment) => {
                        if (handler) {
                            handler.apply(this, [request, reply, error || payment]);
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
                route.handler = (request, reply) => {
                    const temp = arguments;
                    handler.apply(this, [request, reply]);
                    reply("Got it!");
                };
                break;
        }
        this.routes.push(route);
        return route;
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
            this.webhook = accountWebHooks.filter((hook) => hook.url === this.webhookConfig.url)[0];
            if (!this.webhook) {
                await this.createWebhook();
            } else {
                await this.replaceWebhook();
            }
        } catch (err) {
            throw err;
        }
    }

    private getWebhookEventTypes(): Promise<paypal.IEventType[]> {
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

    private getAccountWebhooks(): Promise<paypal.IWebhook[]> {
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

    private createWebhook() {
        const webhookConfig = this.webhookConfig;
        return new Promise((resolve, reject) => {
            paypal.notification.webhook.create(webhookConfig, (error, webhooks) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    private replaceWebhook() {
        const webhookConfig = this.webhookConfig;
        return new Promise((resolve, reject) => {
            paypal.notification.webhook.replace(this.webhook.id, [{
                op: "replace",
                path: "/event_types",
                value: webhookConfig.event_types,
            }], (error, webhooks) => {
                if (error && error.response.name !== "WEBHOOK_PATCH_REQUEST_NO_CHANGE") {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

}
