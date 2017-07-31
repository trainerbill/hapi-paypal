import * as hapi from "hapi";
import * as Joi from "joi";
import * as paypal from "paypal-rest-sdk";
import * as pkg from "../package.json";

export type Partial<T> = {
    [P in keyof T]?: T[P];
};

export interface IHapiPayPalOptions {
    sdk: any;
    routes?: [Partial<IPayPalRouteConfiguration>];
    webhook?: paypal.notification.webhook.Webhook;
}

export interface IPayPalRouteConfiguration extends hapi.RouteConfiguration {
    handler?: IPayPalRouteHandler;
    config: {
        id: string;
    };
}

export type IPayPalRouteHandler = (
    request: hapi.Request,
    reply: hapi.ReplyNoContinue,
    error: any,
    response: any,
) => void;

export interface InternalRouteConfiguration extends hapi.RouteConfiguration {
    handler?: InternalRouteHandler;
    config: {
        id: string;
    };
}

export type InternalRouteHandler = (
    request: hapi.Request,
    reply: hapi.ReplyNoContinue,
    ohandler: IPayPalRouteHandler,
) => void;

export class HapiPayPal {

    private webhookEvents: paypal.notification.NotificationEventType[];
    private webhook: paypal.notification.webhook.Webhook;
    private routes: Map<string, InternalRouteConfiguration> = new Map();
    private server: hapi.Server;

    constructor() {
        this.register.attributes = {
            pkg,
        };

        this.routes.set("paypal_payment_create", {
            config: {
                id: "paypal_payment_create",
            },
            handler: (request, reply, ohandler) => {
                paypal.payment.create(request.payload, (error, response) => {
                    if (ohandler) {
                        ohandler.apply(this, [request, reply, error, response]);
                    }
                });
                return;
            },
            method: "POST",
            path: "/paypal/payment/create",
        });

        this.routes.set("paypal_webhooks_listen", {
            config: {
                id: "paypal_webhooks_listen",
            },
            handler: (request, reply, ohandler) => {
                ohandler(request, reply, null, null);
                return;
            },
            method: "POST",
            path: "/paypal/webhooks/listen",
        });

    }

    // tslint:disable-next-line:max-line-length
    public register: hapi.PluginFunction<any> = (server: hapi.Server, options: IHapiPayPalOptions, next: hapi.ContinuationFunction) => {
        this.server = server;
        const promises = [];
        const sdkSchema = Joi.object().keys({
            client_id: Joi.string().min(10).required(),
            client_secret: Joi.string().min(10).required(),
            mode: Joi.string().valid("sandbox", "live").required(),
        });

        const sdkValidate = Joi.validate(options.sdk, sdkSchema);
        if (sdkValidate.error) {
            throw sdkValidate.error;
        }

        paypal.configure(options.sdk);

        server.expose("paypal", paypal);
        if (options.routes && options.routes.length > 0) {
            this.buildRoutes(options.routes);
        }

        if (options.webhook) {
            const webhooksSchema = Joi.object().keys({
                event_types: Joi.array().min(1).required(),
                url: Joi.string().uri({ scheme: ["https"] }).required(),
            });

            const validate = Joi.validate(options.webhook, webhooksSchema);
            if (validate.error) {
                throw validate.error;
            }

            const webhookRoute = server.lookup("paypal_webhooks_listen");
            if (!webhookRoute) {
                throw new Error("You enabled webhooks without a route listener.");
            }

            const wopts = { ...options.webhook };
            wopts.url += webhookRoute.path;
            const test = this.enableWebhooks(wopts);
            promises.push(test);

        }
        Promise.all(promises).then(() => {
            next();
        });
    }

    private buildRoutes(routes: [Partial<IPayPalRouteConfiguration>]) {
        routes.forEach((route) =>  {
            const dRoute = this.routes.get(route.config.id);
            const nRoute: hapi.RouteConfiguration = {
                handler: (request, reply) => {
                    dRoute.handler(request, reply, route.handler);
                },
                method: route.method || dRoute.method,
                path: route.path || dRoute.path,
            };
            this.server.route({ ...route, ...nRoute });
        });
    }

    /*
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
        // this.routes.push(route as hapi.RouteConfiguration);
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
    */

    private async enableWebhooks(webhook: paypal.notification.webhook.Webhook) {
        try {
            this.webhookEvents = await this.getWebhookEventTypes();
            const accountWebHooks = await this.getAccountWebhooks();
            this.webhook = accountWebHooks.filter((hook) => hook.url === webhook.url)[0];
            this.webhook = !this.webhook ? await this.createWebhook(webhook) : await this.replaceWebhook(webhook);
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

    private createWebhook(webhook: paypal.notification.webhook.Webhook): Promise<paypal.notification.webhook.Webhook> {
        return new Promise((resolve, reject) => {
            paypal.notification.webhook.create(webhook, (error, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });
    }

    private replaceWebhook(webhook: paypal.notification.webhook.Webhook): Promise<paypal.notification.webhook.Webhook> {
        return new Promise((resolve, reject) => {
            paypal.notification.webhook.replace(this.webhook.id, [{
                op: "replace",
                path: "/event_types",
                value: webhook.event_types,
            }], (error, response) => {
                if (error && error.response.name !== "WEBHOOK_PATCH_REQUEST_NO_CHANGE") {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });
    }

}
