"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require("joi");
const paypal = require("paypal-rest-sdk");
const pkg = require("../package.json");
class HapiPayPal {
    constructor() {
        this.routes = [];
        this.register = (server, options, next) => {
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
            server.expose("paypal", paypal);
            options.routes.forEach((route) => server.route(this.buildRoute(route)));
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
                const webhookRoute = options.routes.filter((route) => route.config.id === "paypal_webhooks_listen")[0];
                if (!webhookRoute) {
                    throw new Error("You enabled webhooks without a route listener.");
                }
                this.webhook.url += webhookRoute.path;
                this.enableWebhooks();
            }
            next();
        };
        this.register.attributes = {
            pkg,
        };
    }
    buildRoute(route) {
        const handler = route.handler;
        let nHandler;
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
                        }
                        else {
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
        this.routes.push(route);
        return route;
    }
    getMockData(type) {
        let json;
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
    enableWebhooks() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.webhookEvents = yield this.getWebhookEventTypes();
                const accountWebHooks = yield this.getAccountWebhooks();
                this.webhook = accountWebHooks.filter((hook) => hook.url === this.webhook.url)[0] || this.webhook;
                if (!this.webhook.id) {
                    this.webhook = yield this.createWebhook();
                }
                this.webhook = yield this.replaceWebhook();
            }
            catch (err) {
                throw err;
            }
        });
    }
    getWebhookEventTypes() {
        return new Promise((resolve, reject) => {
            paypal.notification.webhookEventType.list((error, webhooks) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(webhooks.event_types);
                }
            });
        });
    }
    getAccountWebhooks() {
        return new Promise((resolve, reject) => {
            paypal.notification.webhook.list((error, webhooks) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(webhooks.webhooks);
                }
            });
        });
    }
    createWebhook() {
        const webhookConfig = this.webhook;
        return new Promise((resolve, reject) => {
            paypal.notification.webhook.create(webhookConfig, (error, webhook) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(webhook);
                }
            });
        });
    }
    replaceWebhook() {
        const webhookConfig = this.webhook;
        return new Promise((resolve, reject) => {
            paypal.notification.webhook.replace(this.webhook.id, [{
                    op: "replace",
                    path: "/event_types",
                    value: webhookConfig.event_types,
                }], (error, webhook) => {
                if (error && error.response.name !== "WEBHOOK_PATCH_REQUEST_NO_CHANGE") {
                    reject(error);
                }
                else {
                    resolve(webhook);
                }
            });
        });
    }
}
exports.HapiPayPal = HapiPayPal;
//# sourceMappingURL=index.js.map