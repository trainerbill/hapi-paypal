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
const boom = require("boom");
const Joi = require("joi");
const paypal_rest_api_1 = require("paypal-rest-api");
const pkg = require("../package.json");
class HapiPayPal {
    constructor() {
        this.routes = new Map();
        this.register = (server, options, next) => {
            this.server = server;
            const promises = [];
            this.paypal = new paypal_rest_api_1.PayPalRestApi(options.sdk);
            if (!this.paypal.config.requestOptions.headers["PayPal-Partner-Attribution-Id"]) {
                this.paypal.config.requestOptions.headers["PayPal-Partner-Attribution-Id"] = "Hapi-PayPal";
            }
            this.server.expose("paypal", this.paypal);
            this.setupRoutes();
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
                promises.push(this.enableWebhooks(options.webhook));
            }
            Promise.all(promises).then(() => {
                next();
            });
        };
        this.register.attributes = {
            pkg,
        };
    }
    setupRoutes() {
        this.routes.set("paypal_payment_create", {
            config: {
                id: "paypal_payment_create",
            },
            handler: (request, reply, ohandler) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield this.paypal.payment.api.create({ body: request.payload });
                    this.defaultResponseHandler(ohandler, request, reply, null, response);
                }
                catch (err) {
                    this.defaultResponseHandler(ohandler, request, reply, err, null);
                }
            }),
            method: "POST",
            path: "/paypal/payment/create",
        });
        this.routes.set("paypal_webhooks_listen", {
            config: {
                id: "paypal_webhooks_listen",
            },
            handler: (request, reply, ohandler) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield this.paypal.webhookEvent.verify("test");
                    this.defaultResponseHandler(ohandler, request, reply, null, response);
                }
                catch (err) {
                    this.defaultResponseHandler(ohandler, request, reply, err, null);
                }
            }),
            method: "POST",
            path: "/paypal/webhooks/listen",
        });
        this.routes.set("paypal_webhooks_test", {
            config: {
                id: "paypal_webhooks_test",
            },
            handler: (request, reply, ohandler) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield this.paypal.webhookEvent.api.get(request.params.webhookid);
                    this.defaultResponseHandler(ohandler, request, reply, null, response);
                }
                catch (err) {
                    this.defaultResponseHandler(ohandler, request, reply, err, null);
                }
            }),
            method: "GET",
            path: "/paypal/webhooks/test/{webhookid}",
        });
        this.routes.set("paypal_invoice_search", {
            config: {
                id: "paypal_invoice_search",
            },
            handler: (request, reply, ohandler) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield this.paypal.invoice.api.search({ body: request.payload });
                    this.defaultResponseHandler(ohandler, request, reply, null, response);
                }
                catch (err) {
                    this.defaultResponseHandler(ohandler, request, reply, err, null);
                }
            }),
            method: "POST",
            path: "/paypal/invoice/search",
        });
        this.routes.set("paypal_invoice_create", {
            config: {
                id: "paypal_invoice_create",
            },
            handler: (request, reply, ohandler) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield this.paypal.invoice.api.create({ body: request.payload });
                    this.defaultResponseHandler(ohandler, request, reply, null, response);
                }
                catch (err) {
                    this.defaultResponseHandler(ohandler, request, reply, err, null);
                }
            }),
            method: "POST",
            path: "/paypal/invoice",
        });
        this.routes.set("paypal_invoice_send", {
            config: {
                id: "paypal_invoice_send",
            },
            handler: (request, reply, ohandler) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield this.paypal.invoice.api.send(request.params.invoiceid, {
                        body: request.payload,
                    });
                    this.defaultResponseHandler(ohandler, request, reply, null, response);
                }
                catch (err) {
                    this.defaultResponseHandler(ohandler, request, reply, err, null);
                }
            }),
            method: "POST",
            path: "/paypal/invoice/{invoiceid}/send",
        });
        this.routes.set("paypal_invoice_get", {
            config: {
                id: "paypal_invoice_get",
            },
            handler: (request, reply, ohandler) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield this.paypal.invoice.api.get(request.params.invoiceid);
                    this.defaultResponseHandler(ohandler, request, reply, null, response);
                }
                catch (err) {
                    this.defaultResponseHandler(ohandler, request, reply, err, null);
                }
            }),
            method: "GET",
            path: "/paypal/invoice/{invoiceid}",
        });
        this.routes.set("paypal_invoice_cancel", {
            config: {
                id: "paypal_invoice_cancel",
            },
            handler: (request, reply, ohandler) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield this.paypal.invoice.api.cancel(request.params.invoiceid, {
                        body: request.payload,
                    });
                    this.defaultResponseHandler(ohandler, request, reply, null, response);
                }
                catch (err) {
                    this.defaultResponseHandler(ohandler, request, reply, err, null);
                }
            }),
            method: "POST",
            path: "/paypal/invoice/{invoiceid}/cancel",
        });
        this.routes.set("paypal_invoice_update", {
            config: {
                id: "paypal_invoice_update",
            },
            handler: (request, reply, ohandler) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield this.paypal.invoice.api.update(request.params.invoiceid, {
                        body: request.payload,
                    });
                    this.defaultResponseHandler(ohandler, request, reply, null, response);
                }
                catch (err) {
                    this.defaultResponseHandler(ohandler, request, reply, err, null);
                }
            }),
            method: "PUT",
            path: "/paypal/invoice/{invoiceid}",
        });
        this.routes.set("paypal_invoice_remind", {
            config: {
                id: "paypal_invoice_remind",
            },
            handler: (request, reply, ohandler) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield this.paypal.invoice.api.remind(request.params.invoiceid, {
                        body: request.payload,
                    });
                    this.defaultResponseHandler(ohandler, request, reply, null, response);
                }
                catch (err) {
                    this.defaultResponseHandler(ohandler, request, reply, err, null);
                }
            }),
            method: "POST",
            path: "/paypal/invoice/{invoiceid}/remind",
        });
        this.routes.set("paypal_sale_refund", {
            config: {
                id: "paypal_sale_refund",
            },
            handler: (request, reply, ohandler) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield this.paypal.sale.api.refund(request.params.transactionid, {
                        body: request.payload,
                    });
                    this.defaultResponseHandler(ohandler, request, reply, null, response);
                }
                catch (err) {
                    this.defaultResponseHandler(ohandler, request, reply, err, null);
                }
            }),
            method: "POST",
            path: "/paypal/sale/{transactionid}/refund",
        });
    }
    defaultResponseHandler(ohandler, request, reply, error, response) {
        if (ohandler) {
            ohandler(request, reply, error, response);
        }
        else {
            if (error) {
                const bError = boom.badRequest(error.message);
                bError.reformat();
                return reply(bError);
            }
            return reply(response.body);
        }
    }
    buildRoutes(routes) {
        routes.forEach((route) => {
            const dRoute = this.routes.get(route.config.id);
            const nRoute = {
                handler: (request, reply) => {
                    dRoute.handler(request, reply, route.handler);
                },
                method: route.method || dRoute.method,
                path: route.path || dRoute.path,
            };
            this.server.route(Object.assign({}, route, nRoute));
        });
    }
    enableWebhooks(webhook) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const w = yield Promise.all([this.getWebhookEventTypes(), this.getAccountWebhooks()]);
                this.webhookEvents = w[0];
                const accountWebHooks = w[1];
                const twebhook = accountWebHooks.filter((hook) => hook.url === webhook.url)[0];
                !twebhook ? yield this.createWebhook(webhook) : yield this.replaceWebhook(twebhook);
            }
            catch (err) {
                try {
                    if (err.message) {
                        const error = JSON.parse(err.message);
                        if (error.name !== "WEBHOOK_PATCH_REQUEST_NO_CHANGE") {
                            throw err;
                        }
                    }
                }
                catch (err) {
                    throw err;
                }
            }
        });
    }
    getWebhookEventTypes() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.paypal.webhook.api.types();
            this.webhookEvents = response.body.event_types;
            return this.webhookEvents;
        });
    }
    getAccountWebhooks() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.paypal.webhook.api.list();
            return response.body.webhooks;
        });
    }
    createWebhook(webhook) {
        return __awaiter(this, void 0, void 0, function* () {
            const webhookmodel = new this.paypal.webhook(webhook);
            yield webhookmodel.create();
            this.webhook = webhookmodel;
        });
    }
    replaceWebhook(webhook) {
        return __awaiter(this, void 0, void 0, function* () {
            const webhookmodel = new this.paypal.webhook(webhook);
            yield webhookmodel.update([
                {
                    op: "replace",
                    path: "/event_types",
                    value: webhook.event_types,
                },
            ]);
            this.webhook = webhookmodel;
        });
    }
}
exports.HapiPayPal = HapiPayPal;
//# sourceMappingURL=index.js.map