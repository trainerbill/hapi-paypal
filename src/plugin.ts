import * as boom from "boom";
import * as hapi from "hapi";
import * as Joi from "joi";
import { IConfigureOptions, IWebhook, IWebhookEvent, PayPalRestApi, WebhookModel } from "paypal-rest-api";
import * as pkg from "../package.json";

export interface IHapiPayPalOptions {
    sdk: IConfigureOptions;
    routes?: string[];
    webhook?: IWebhook;
}

export interface IRouteConfiguration extends hapi.RouteConfiguration {
    handler: (request: hapi.Request, reply: hapi.ReplyNoContinue) => Promise<any>;
    custom?: (request: hapi.Request, reply: hapi.ReplyNoContinue, error: any, response: any) => Promise<any>;
}

export class HapiPayPal {
    public static webhookEvents = new Set([
        "BILLING.PLAN.CREATED",
        "BILLING.PLAN.UPDATED",
        "BILLING.SUBSCRIPTION.CANCELLED",
        "BILLING.SUBSCRIPTION.CREATED",
        "BILLING.SUBSCRIPTION.RE-ACTIVATED",
        "BILLING.SUBSCRIPTION.SUSPENDED",
        "BILLING.SUBSCRIPTION.UPDATED",
        "CUSTOMER.DISPUTE.CREATED",
        "CUSTOMER.DISPUTE.RESOLVED",
        "CUSTOMER.DISPUTE.UPDATED",
        "IDENTITY.AUTHORIZATION-CONSENT.REVOKED",
        "INVOICING.INVOICE.CANCELLED",
        "INVOICING.INVOICE.CREATED",
        "INVOICING.INVOICE.PAID",
        "INVOICING.INVOICE.REFUNDED",
        "INVOICING.INVOICE.UPDATED",
        "MERCHANT.ONBOARDING.COMPLETED",
        "PAYMENT.AUTHORIZATION.CREATED",
        "PAYMENT.AUTHORIZATION.VOIDED",
        "PAYMENT.CAPTURE.COMPLETED",
        "PAYMENT.CAPTURE.DENIED",
        "PAYMENT.CAPTURE.PENDING",
        "PAYMENT.CAPTURE.REFUNDED",
        "PAYMENT.CAPTURE.REVERSED",
        "PAYMENT.ORDER.CANCELLED",
        "PAYMENT.ORDER.CREATED",
        "PAYMENT.PAYOUTS-ITEM.BLOCKED",
        "PAYMENT.PAYOUTS-ITEM.CANCELED",
        "PAYMENT.PAYOUTS-ITEM.DENIED",
        "PAYMENT.PAYOUTS-ITEM.FAILED",
        "PAYMENT.PAYOUTS-ITEM.HELD",
        "PAYMENT.PAYOUTS-ITEM.REFUNDED",
        "PAYMENT.PAYOUTS-ITEM.RETURNED",
        "PAYMENT.PAYOUTS-ITEM.SUCCEEDED",
        "PAYMENT.PAYOUTS-ITEM.UNCLAIMED",
        "PAYMENT.PAYOUTSBATCH.DENIED",
        "PAYMENT.PAYOUTSBATCH.PROCESSING",
        "PAYMENT.PAYOUTSBATCH.SUCCESS",
        "PAYMENT.SALE.COMPLETED",
        "PAYMENT.SALE.DENIED",
        "PAYMENT.SALE.PENDING",
        "PAYMENT.SALE.REFUNDED",
        "PAYMENT.SALE.REVERSED",
        "VAULT.CREDIT-CARD.CREATED",
        "VAULT.CREDIT-CARD.DELETED",
        "VAULT.CREDIT-CARD.UPDATED",
    ]);
    public routes: Map<string, IRouteConfiguration> = new Map();
    public webhook: WebhookModel;
    // private routes: Map<string, InternalRouteConfiguration> = new Map();
    private _server: hapi.Server;
    private _paypal: PayPalRestApi;

    constructor() {
        this.register.attributes = {
            pkg,
        };

        // Setup Routes
        this.routes.set("paypal_payment_create", {
            config: {
                id: "paypal_payment_create",
            },
            handler: async (request, reply) => {
                let response = null;
                let error = null;
                try {
                    response = await this.paypal.payment.api.create({ body: request.payload });
                } catch (err) {
                    error = err;
                }
                this.responseHandler("paypal_payment_create", request, reply, error, response);
            },
            method: "POST",
            path: "/paypal/payment",
        });

        this.routes.set("paypal_webhooks_listen", {
            config: {
                id: "paypal_webhooks_listen",
                payload: {
                    parse: false,
                },
            },
            handler: async (request, reply) => {
                let response = null;
                let error = null;
                try {
                    // tslint:disable-next-line:max-line-length 1X200851AC360471T
                    response = await this.paypal.webhookEvent.verify(this.webhook.model.id, request.headers, request.payload.toString());
                    if (response.verification_status !== "SUCCESS") {
                        throw new Error("Webhook Verification Error");
                    }
                    request.payload = JSON.parse(request.payload.toString());
                } catch (err) {
                    error = err;
                }
                this.responseHandler("paypal_webhooks_listen", request, reply, error, response);
            },
            method: "POST",
            path: "/paypal/webhooks/listen",
        });

        this.routes.set("paypal_webhooks_test", {
            config: {
                id: "paypal_webhooks_test",
            },
            handler: async (request, reply) => {
                let response = null;
                let error = null;
                try {
                    response = await this.paypal.webhookEvent.api.get(request.params.webhookid);
                } catch (err) {
                    error = err;
                }
                this.responseHandler("paypal_webhooks_test", request, reply, error, response);
            },
            method: "GET",
            path: "/paypal/webhooks/listen/{webhookid}",
        });

        this.routes.set("paypal_invoice_search", {
            config: {
                id: "paypal_invoice_search",
            },
            handler: async (request, reply) => {
                let response = null;
                let error = null;
                try {
                    response = await this.paypal.invoice.api.search({ body: request.payload });
                } catch (err) {
                    error = err;
                }
                this.responseHandler("paypal_invoice_search", request, reply, error, response);
            },
            method: "POST",
            path: "/paypal/invoice/search",
        });

        this.routes.set("paypal_invoice_create", {
            config: {
                id: "paypal_invoice_create",
            },
            handler: async (request, reply) => {
                let response = null;
                let error = null;
                try {
                    response = await this.paypal.invoice.api.create({ body: request.payload });
                } catch (err) {
                    error = err;
                }
                this.responseHandler("paypal_invoice_create", request, reply, error, response);
            },
            method: "POST",
            path: "/paypal/invoice",
        });

        this.routes.set("paypal_invoice_send", {
            config: {
                id: "paypal_invoice_send",
            },
            handler: async (request, reply) => {
                let response = null;
                let error = null;
                try {
                    response = await this.paypal.invoice.api.send(request.params.invoiceid, {
                        body: request.payload,
                    });
                } catch (err) {
                    error = err;
                }
                this.responseHandler("paypal_invoice_send", request, reply, error, response);
            },
            method: "POST",
            path: "/paypal/invoice/{invoiceid}/send",
        });

        this.routes.set("paypal_invoice_send", {
            config: {
                id: "paypal_invoice_send",
            },
            handler: async (request, reply) => {
                let response = null;
                let error = null;
                try {
                    response = await this.paypal.invoice.api.send(request.params.invoiceid, {
                        body: request.payload,
                    });
                } catch (err) {
                    error = err;
                }
                this.responseHandler("paypal_invoice_send", request, reply, error, response);
            },
            method: "POST",
            path: "/paypal/invoice/{invoiceid}/send",
        });

        this.routes.set("paypal_invoice_get", {
            config: {
                id: "paypal_invoice_get",
            },
            handler: async (request, reply) => {
                let response = null;
                let error = null;
                try {
                    response = await this.paypal.invoice.api.get(request.params.invoiceid);
                } catch (err) {
                    error = err;
                }
                this.responseHandler("paypal_invoice_get", request, reply, error, response);
            },
            method: "GET",
            path: "/paypal/invoice/{invoiceid}",
        });

        this.routes.set("paypal_invoice_cancel", {
            config: {
                id: "paypal_invoice_cancel",
            },
            handler: async (request, reply) => {
                let response = null;
                let error = null;
                try {
                    response = await this.paypal.invoice.api.cancel(request.params.invoiceid, {
                        body: request.payload,
                    });
                } catch (err) {
                    error = err;
                }
                this.responseHandler("paypal_invoice_cancel", request, reply, error, response);
            },
            method: "POST",
            path: "/paypal/invoice/{invoiceid}/cancel",
        });

        this.routes.set("paypal_invoice_update", {
            config: {
                id: "paypal_invoice_update",
            },
            handler: async (request, reply) => {
                let response = null;
                let error = null;
                try {
                    response = await this.paypal.invoice.api.update(request.params.invoiceid, {
                        body: request.payload,
                    });
                } catch (err) {
                    error = err;
                }
                this.responseHandler("paypal_invoice_update", request, reply, error, response);
            },
            method: "PUT",
            path: "/paypal/invoice/{invoiceid}",
        });

        this.routes.set("paypal_invoice_remind", {
            config: {
                id: "paypal_invoice_remind",
            },
            handler: async (request, reply) => {
                let response = null;
                let error = null;
                try {
                    response = await this.paypal.invoice.api.remind(request.params.invoiceid, {
                        body: request.payload,
                    });
                } catch (err) {
                    error = err;
                }
                this.responseHandler("paypal_invoice_remind", request, reply, error, response);
            },
            method: "POST",
            path: "/paypal/invoice/{invoiceid}/remind",
        });

        this.routes.set("paypal_sale_refund", {
            config: {
                id: "paypal_sale_refund",
            },
            handler: async (request, reply) => {
                let response = null;
                let error = null;
                try {
                    response = await this.paypal.sale.api.refund(request.params.transactionid, {
                        body: request.payload,
                    });
                } catch (err) {
                    error = err;
                }
                this.responseHandler("paypal_sale_refund", request, reply, error, response);
            },
            method: "POST",
            path: "/paypal/sale/{transactionid}/refund",
        });

        this.routes.set("paypal_webhook_list", {
            config: {
                id: "paypal_webhook_list",
            },
            handler: async (request, reply) => {
                let response = null;
                let error = null;
                try {
                    response = await this.paypal.webhook.api.list({
                        qs: request.query,
                    });
                } catch (err) {
                    error = err;
                }
                this.responseHandler("paypal_webhook_list", request, reply, error, response);
            },
            method: "GET",
            path: "/paypal/webhook",
        });
    }

    get paypal() {
        return this._paypal;
    }

    set paypal(paypal) {
        if (!(paypal instanceof PayPalRestApi)) {
            throw new Error("paypal must be instance of PayPalRestApi");
        }
        this._paypal = paypal;
    }

    get server() {
        return this._server;
    }

    set server(server) {
        this._server = server;
    }

    // tslint:disable-next-line:max-line-length
    public register: hapi.PluginFunction<any> = (server: hapi.Server, options: IHapiPayPalOptions, next: hapi.ContinuationFunction) => {
        if (!this.server) {
            this.server = server;
        }
        if (!this.paypal) {
            this.paypal = new PayPalRestApi(options.sdk);
        }

        if (!this.paypal.config.requestOptions.headers["PayPal-Partner-Attribution-Id"]) {
            this.paypal.config.requestOptions.headers["PayPal-Partner-Attribution-Id"] = "Hapi-PayPal";
        }

        this.server.expose("paypal", this.paypal);

        let webhookPromise = Promise.resolve();
        if (options.webhook) {
            const webhooksSchema = Joi.object().keys({
                event_types: Joi.array().min(1).required(),
                url: Joi.string()
                        .replace(/^https:\/\/(www\.)?localhost/gi, "").uri({ scheme: ["https"] }).required()
                        .error(new Error("Webhook url must be https and cannot be localhost.")),
            });

            const validate = Joi.validate(options.webhook, webhooksSchema);
            if (validate.error) {
                this.server.log("error", validate.error);
            } else {
                webhookPromise = this.enableWebhooks(options.webhook);
            }

        }

        if (options.routes && options.routes.length > 0) {
            options.routes.forEach((route) => {
                const { custom, ...hRoute } = this.routes.get(route);
                this.server.route(hRoute);
            });
        }

        webhookPromise
            .then(() => {
                next();
            });

    }

    // tslint:disable-next-line:max-line-length
    private responseHandler(routeId: string, request: hapi.Request, reply: hapi.ReplyNoContinue, error: Error, response: any) {
        const route = this.routes.get(routeId);
        if (route.custom) {
            return route.custom(request, reply, error, response);
        }

        if (error) {
            const bError = boom.badRequest(error.message);
            bError.reformat();
            return reply(bError);
        }
        return reply(response.body);
    }

    private setupRoutes() {
        /*

        this.routes.set("paypal_webhook_list", {
            config: {
                id: "paypal_webhook_list",
            },
            handler: async (request, reply, ohandler) => {
                try {
                    const response = await this.paypal.webhook.list({
                        qs: request.query,
                    });
                    this.defaultResponseHandler(ohandler, request, reply, null, response);
                } catch (err) {
                    this.defaultResponseHandler(ohandler, request, reply, err, null);
                }
            },
            method: "GET",
            path: "/paypal/webhook",
        });

        this.routes.set("paypal_webhook_create", {
            config: {
                id: "paypal_webhook_create",
            },
            handler: async (request, reply, ohandler) => {
                try {
                    const response = await this.paypal.webhook.api.create({
                        body: request.payload,
                    });
                    this.defaultResponseHandler(ohandler, request, reply, null, response);
                } catch (err) {
                    this.defaultResponseHandler(ohandler, request, reply, err, null);
                }
            },
            method: "POST",
            path: "/paypal/webhook",
        });

        this.routes.set("paypal_webhook_get", {
            config: {
                id: "paypal_webhook_get",
            },
            handler: async (request, reply, ohandler) => {
                try {
                    const response = await this.paypal.webhook.get(request.params.webhook_id);
                    this.defaultResponseHandler(ohandler, request, reply, null, response);
                } catch (err) {
                    this.defaultResponseHandler(ohandler, request, reply, err, null);
                }
            },
            method: "GET",
            path: "/paypal/webhook/{webhook_id}",
        });

        this.routes.set("paypal_webhook_update", {
            config: {
                id: "paypal_webhook_update",
            },
            handler: async (request, reply, ohandler) => {
                terrry {
                    const response = await this.paypal.webhook.api.update(request.params.webhook_id, request.payload);
                    this.defaultResponseHandler(ohandler, request, reply, null, response);
                } catch (err) {
                    this.defaultResponseHandler(ohandler, request, reply, err, null);
                }
            },
            method: "PATCH",
            path: "/paypal/webhook/{webhook_id}",
        });

        this.routes.set("paypal_webhook_event_get", {
            config: {
                id: "paypal_webhook_event_get",
            },
            handler: async (request, reply, ohandler) => {
                try {
                    const response = await this.paypal.webhookEvent.api.get(request.params.webhookEvent_id);
                    this.defaultResponseHandler(ohandler, request, reply, null, response);
                } catch (err) {
                    this.defaultResponseHandler(ohandler, request, reply, err, null);
                }
            },
            method: "PATCH",
            path: "/paypal/webhookEvent/{webhookEvent_id}",
        });

        this.routes.set("paypal_webhook_events", {
            config: {
                id: "paypal_webhook_events",
            },
            handler: async (request, reply, ohandler) => {
                try {
                    const response = await this.paypal.webhook.api.types();
                    this.defaultResponseHandler(ohandler, request, reply, null, response);
                } catch (err) {
                    this.defaultResponseHandler(ohandler, request, reply, err, null);
                }
            },
            method: "PATCH",
            path: "/paypal/webhookEvent",
        });
        */
    }

    private async enableWebhooks(webhook: IWebhook) {
        try {
            const accountWebHooks = await this.getAccountWebhooks();
            const twebhook = accountWebHooks.filter((hook: IWebhook) => hook.url === webhook.url)[0];
            !twebhook ? await this.createWebhook(webhook) : await this.replaceWebhook(twebhook);
            this.server.log("info", "Webhook enabled successfully");
            this.server.log("info", this.webhook);
        } catch (err) {
            try {
                if (err.message) {
                    const error = JSON.parse(err.message);
                    if (error.name !== "WEBHOOK_PATCH_REQUEST_NO_CHANGE") {
                        throw err;
                    }
                }
            } catch (err) {
                throw err;
            }
        }
    }

    private async getAccountWebhooks() {
        const response = await this.paypal.webhook.api.list();
        return response.body.webhooks;
    }

    private async createWebhook(webhook: IWebhook) {
        const webhookmodel = new this.paypal.webhook(webhook);
        this.webhook = webhookmodel;
        await webhookmodel.create();
    }

    private async replaceWebhook(webhook: IWebhook) {
        const webhookmodel = new this.paypal.webhook(webhook);
        this.webhook = webhookmodel;
        await webhookmodel.update([
            {
                op: "replace",
                path: "/event_types",
                value: webhook.event_types,
            },
        ]);
    }

}
