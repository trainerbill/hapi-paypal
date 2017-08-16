import * as boom from "boom";
import * as hapi from "hapi";
import * as Joi from "joi";
import * as paypal from "paypal-rest-sdk";
import * as pkg from "../package.json";
import { paypalSdkSchema } from "./joi";
export * from "./joi";

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
                    this.defaultResponseHandler(ohandler, request, reply, error, response);
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
                // tslint:disable-next-line:max-line-length
                paypal.notification.webhookEvent.verify(request.headers, request.payload, this.webhook.id, (error, response) => {
                    if (error || response.verification_status !== "SUCCESS") {
                        this.server.log("error", `PayPal Webhook not verified: ${JSON.stringify(request.payload)}`);
                    }
                    this.defaultResponseHandler(ohandler, request, reply, error, response);
                });
            },
            method: "POST",
            path: "/paypal/webhooks/listen",
        });

        this.routes.set("paypal_webhooks_test", {
            config: {
                id: "paypal_webhooks_test",
            },
            handler: (request, reply, ohandler) => {
                paypal.notification.webhookEvent.get(request.params.webhookid, request.payload, (error, response) => {
                    this.server.inject({
                        headers: {
                            "PAYPAL-AUTH-ALGO": "SHA256withRSA",
                            // tslint:disable-next-line:max-line-length
                            "PAYPAL-CERT-URL": "https://api.sandbox.paypal.com/v1/notifications/certs/CERT-360caa42-fca2a594-aecacc47",
                            "PAYPAL-TRANSMISSION-ID": "612a7da0-7962-11e7-ac1e-6b62a8a99ac4",
                            // tslint:disable-next-line:max-line-length
                            "PAYPAL-TRANSMISSION-SIG": "ndfYExTW3yL7bE2EyxrtoSl3nzXBLF3oPehp2DUodt2KMM3qw9STgYes2WJ8lpQPA40Hrtrbac/xb/Hh73Oc4hf0ELrzNGhkGllQM5SgpqM/E+AJijQcQR35SHd+ghp9yh1FOQvcNTtU06e8IqYQIExVoZ0aq9NWvughtC4ELA4SGAqWxhM+jHpzZyOen3E4YJrr5qtOHroPjiTMkHBgYh50VZMPl94D6GTTdPU1gSkXR98WGyvVKuAJ4YNF5mppIYjlBm1RQYw3zj0xmlA6VSlLMW5T0WDo8nJk2PK5RNCG1Y+gIZBOfgqpMH8R4qrBXbppfTYMFh+gWPpk33bsnw==",
                            "PAYPAL-TRANSMISSION-TIME": "2017-08-04T22:15:10Z",
                        },
                        method: "POST",
                        payload: response,
                        url: "/paypal/webhooks/listen",
                    }, (res) => {
                        reply(response);
                    });
                });
                return;
            },
            method: "GET",
            path: "/paypal/webhooks/test/{webhookid}",
        });

        this.routes.set("paypal_invoice_search", {
            config: {
                id: "paypal_invoice_search",
            },
            handler: (request, reply, ohandler) => {
                paypal.invoice.search(request.payload, (error, response) => {
                    this.defaultResponseHandler(ohandler, request, reply, error, response);
                });
            },
            method: "POST",
            path: "/paypal/invoice/search",
        });

        this.routes.set("paypal_invoice_create", {
            config: {
                id: "paypal_invoice_create",
            },
            handler: (request, reply, ohandler) => {
                paypal.invoice.create(request.payload, (error, response) => {
                    this.defaultResponseHandler(ohandler, request, reply, error, response);
                });
            },
            method: "POST",
            path: "/paypal/invoice",
        });

        this.routes.set("paypal_invoice_send", {
            config: {
                id: "paypal_invoice_send",
            },
            handler: (request, reply, ohandler) => {
                paypal.invoice.send(request.params.invoiceid, request.payload, (error, response) => {
                    this.defaultResponseHandler(ohandler, request, reply, error, response);
                });
                return;
            },
            method: "POST",
            path: "/paypal/invoice/{invoiceid}/send",
        });

        this.routes.set("paypal_invoice_get", {
            config: {
                id: "paypal_invoice_get",
            },
            handler: (request, reply, ohandler) => {
                paypal.invoice.get(request.params.invoiceid, (error, response) => {
                    this.defaultResponseHandler(ohandler, request, reply, error, response);
                });
                return;
            },
            method: "GET",
            path: "/paypal/invoice/{invoiceid}",
        });

        this.routes.set("paypal_invoice_cancel", {
            config: {
                id: "paypal_invoice_cancel",
            },
            handler: (request, reply, ohandler) => {
                paypal.invoice.cancel(request.params.invoiceid, request.payload, (error, response) => {
                    this.defaultResponseHandler(ohandler, request, reply, error, response);
                });
            },
            method: "POST",
            path: "/paypal/invoice/{invoiceid}/cancel",
        });

        this.routes.set("paypal_invoice_remind", {
            config: {
                id: "paypal_invoice_remind",
            },
            handler: (request, reply, ohandler) => {
                paypal.invoice.remind(request.params.invoiceid, request.payload, (error, response) => {
                    this.defaultResponseHandler(ohandler, request, reply, error, response);
                });
            },
            method: "POST",
            path: "/paypal/invoice/{invoiceid}/remind",
        });

        this.routes.set("paypal_sale_refund", {
            config: {
                id: "paypal_sale_refund",
            },
            handler: (request, reply, ohandler) => {
                paypal.sale.refund(request.params.transactionid, request.payload || {}, (error, response) => {
                    this.defaultResponseHandler(ohandler, request, reply, error, response);
                });
                return;
            },
            method: "POST",
            path: "/paypal/sale/{transactionid}/refund",
        });

    }

    // tslint:disable-next-line:max-line-length
    public register: hapi.PluginFunction<any> = (server: hapi.Server, options: IHapiPayPalOptions, next: hapi.ContinuationFunction) => {
        this.server = server;
        const promises = [];

        const sdkValidate = Joi.validate(options.sdk, paypalSdkSchema);
        if (sdkValidate.error) {
            throw sdkValidate.error;
        }

        if (typeof options.sdk.headers !== "object") {
            options.sdk.headers = {};
        }

        if (!options.sdk.headers["PayPal-Partner-Attribution-Id"]) {
            options.sdk.headers["PayPal-Partner-Attribution-Id"] = "Hapi-PayPal";
        }

        paypal.configure(options.sdk);

        this.server.expose("paypal", paypal);
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

            const webhookRoute = this.server.lookup("paypal_webhooks_listen");
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

    private defaultResponseHandler(
        ohandler: IPayPalRouteHandler,
        request: hapi.Request,
        reply: hapi.ReplyNoContinue,
        error: paypal.SDKError,
        response: any,
    ) {
        if (ohandler) {
            ohandler(request, reply, error, response);
        } else {
            if (error) {
                const bError = boom.badRequest(error.response.message);
                (bError.output.payload as any).details = error.response.details;
                bError.reformat();
                return reply(bError);
            }
            return reply(response);
        }
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
