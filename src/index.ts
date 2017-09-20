import * as boom from "boom";
import * as hapi from "hapi";
import * as Joi from "joi";
import { IConfigureOptions, IWebhook, IWebhookEvent, PayPalRestApi, WebhookModel } from "paypal-rest-api";
import * as pkg from "../package.json";

export interface IHapiPayPalOptions {
  sdk: IConfigureOptions;
  routes?: Array<Partial<IPayPalRouteConfiguration>>;
  webhook?: IWebhook;
}

export interface IPayPalRouteConfig extends hapi.RouteAdditionalConfigurationOptions {
  id: string;
}

export interface IPayPalRouteConfiguration extends hapi.RouteConfiguration {
  handler?: IPayPalRouteHandler;
  config: IPayPalRouteConfig;
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
    payload?: any;
  };
}

export type InternalRouteHandler = (
  request: hapi.Request,
  reply: hapi.ReplyNoContinue,
  ohandler: IPayPalRouteHandler,
) => void;

export class HapiPayPal {

  private webhookEvents: IWebhookEvent[];
  private webhook: WebhookModel;
  private routes: Map<string, InternalRouteConfiguration> = new Map();
  private server: hapi.Server;
  private paypal: PayPalRestApi;

  constructor() {
    this.register.attributes = {
      pkg,
    };
  }

  // tslint:disable-next-line:max-line-length
  public register: hapi.PluginFunction<any> = (server: hapi.Server, options: IHapiPayPalOptions, next: hapi.ContinuationFunction) => {
    this.server = server;
    let webhookPromise = Promise.resolve();

    this.paypal = new PayPalRestApi(options.sdk);
    if (!this.paypal.config.requestOptions.headers["PayPal-Partner-Attribution-Id"]) {
      this.paypal.config.requestOptions.headers["PayPal-Partner-Attribution-Id"] = "Hapi-PayPal";
    }

    this.server.expose("paypal", this.paypal);

    if (options.webhook) {
      const webhooksSchema = Joi.object().keys({
        event_types: Joi.array().min(1).required(),
        url: Joi.string().uri({ scheme: ["https"] }).required(),
      });

      const validate = Joi.validate(options.webhook, webhooksSchema);
      if (validate.error) {
        throw validate.error;
      }

      webhookPromise = this.enableWebhooks(options.webhook);

    }

    webhookPromise
      .then(() => {
        this.setupRoutes();
        if (options.routes && options.routes.length > 0) {
          this.buildRoutes(options.routes);
        }
      })
      .then(() => next());

  }

  private setupRoutes() {
    this.routes.set("paypal_payment_create", {
      config: {
        id: "paypal_payment_create",
      },
      handler: async (request, reply, ohandler) => {
        try {
          const response = await this.paypal.payment.api.create({ body: request.payload });
          this.defaultResponseHandler(ohandler, request, reply, null, response);
        } catch (err) {
          this.defaultResponseHandler(ohandler, request, reply, err, null);
        }
      },
      method: "POST",
      path: "/paypal/payment/create",
    });

    this.routes.set("paypal_webhooks_listen", {
      config: {
        id: "paypal_webhooks_listen",
        payload: {
          parse: false,
        },
      },
      handler: async (request, reply, ohandler) => {
        try {
          // tslint:disable-next-line:max-line-length 1X200851AC360471T
          const response = await this.paypal.webhookEvent.verify(this.webhook.model.id, request.headers, request.payload.toString());
          if (response.verification_status !== "SUCCESS") {
            throw new Error("Webhook Verification Error");
          }
          request.payload = JSON.parse(request.payload.toString());
          this.defaultResponseHandler(ohandler, request, reply, null, response);
        } catch (err) {
          this.defaultResponseHandler(ohandler, request, reply, err, null);
        }
      },
      method: "POST",
      path: "/paypal/webhooks/listen",
    });

    this.routes.set("paypal_webhooks_test", {
      config: {
        id: "paypal_webhooks_test",
      },
      handler: async (request, reply, ohandler) => {
        try {
          // Find this request.raw.req
          const response = await this.paypal.webhookEvent.api.get(request.params.webhookid);
          this.defaultResponseHandler(ohandler, request, reply, null, response);
        } catch (err) {
          this.defaultResponseHandler(ohandler, request, reply, err, null);
        }
      },
      method: "GET",
      path: "/paypal/webhooks/test/{webhookid}",
    });

    this.routes.set("paypal_invoice_search", {
      config: {
        id: "paypal_invoice_search",
      },
      handler: async (request, reply, ohandler) => {
        try {
          const response = await this.paypal.invoice.api.search({ body: request.payload });
          this.defaultResponseHandler(ohandler, request, reply, null, response);
        } catch (err) {
          this.defaultResponseHandler(ohandler, request, reply, err, null);
        }
      },
      method: "POST",
      path: "/paypal/invoice/search",
    });

    this.routes.set("paypal_invoice_create", {
      config: {
        id: "paypal_invoice_create",
      },
      handler: async (request, reply, ohandler) => {
        try {
          const response = await this.paypal.invoice.api.create({ body: request.payload });
          this.defaultResponseHandler(ohandler, request, reply, null, response);
        } catch (err) {
          this.defaultResponseHandler(ohandler, request, reply, err, null);
        }
      },
      method: "POST",
      path: "/paypal/invoice",
    });

    this.routes.set("paypal_invoice_send", {
      config: {
        id: "paypal_invoice_send",
      },
      handler: async (request, reply, ohandler) => {
        try {
          const response = await this.paypal.invoice.api.send(request.params.invoiceid, {
            body: request.payload,
          });
          this.defaultResponseHandler(ohandler, request, reply, null, response);
        } catch (err) {
          this.defaultResponseHandler(ohandler, request, reply, err, null);
        }
      },
      method: "POST",
      path: "/paypal/invoice/{invoiceid}/send",
    });

    this.routes.set("paypal_invoice_get", {
      config: {
        id: "paypal_invoice_get",
      },
      handler: async (request, reply, ohandler) => {
        try {
          const response = await this.paypal.invoice.api.get(request.params.invoiceid);
          this.defaultResponseHandler(ohandler, request, reply, null, response);
        } catch (err) {
          this.defaultResponseHandler(ohandler, request, reply, err, null);
        }
      },
      method: "GET",
      path: "/paypal/invoice/{invoiceid}",
    });

    this.routes.set("paypal_invoice_cancel", {
      config: {
        id: "paypal_invoice_cancel",
      },
      handler: async (request, reply, ohandler) => {
        try {
          const response = await this.paypal.invoice.api.cancel(request.params.invoiceid, {
            body: request.payload,
          });
          this.defaultResponseHandler(ohandler, request, reply, null, response);
        } catch (err) {
          this.defaultResponseHandler(ohandler, request, reply, err, null);
        }
      },
      method: "POST",
      path: "/paypal/invoice/{invoiceid}/cancel",
    });

    this.routes.set("paypal_invoice_update", {
      config: {
        id: "paypal_invoice_update",
      },
      handler: async (request, reply, ohandler) => {
        try {
          const response = await this.paypal.invoice.api.update(request.params.invoiceid, {
            body: request.payload,
          });
          this.defaultResponseHandler(ohandler, request, reply, null, response);
        } catch (err) {
          this.defaultResponseHandler(ohandler, request, reply, err, null);
        }
      },
      method: "PUT",
      path: "/paypal/invoice/{invoiceid}",
    });

    this.routes.set("paypal_invoice_remind", {
      config: {
        id: "paypal_invoice_remind",
      },
      handler: async (request, reply, ohandler) => {
        try {
          const response = await this.paypal.invoice.api.remind(request.params.invoiceid, {
            body: request.payload,
          });
          this.defaultResponseHandler(ohandler, request, reply, null, response);
        } catch (err) {
          this.defaultResponseHandler(ohandler, request, reply, err, null);
        }
      },
      method: "POST",
      path: "/paypal/invoice/{invoiceid}/remind",
    });

    this.routes.set("paypal_sale_refund", {
      config: {
        id: "paypal_sale_refund",
      },
      handler: async (request, reply, ohandler) => {
        try {
          const response = await this.paypal.sale.api.refund(request.params.transactionid, {
            body: request.payload,
          });
          this.defaultResponseHandler(ohandler, request, reply, null, response);
        } catch (err) {
          this.defaultResponseHandler(ohandler, request, reply, err, null);
        }
      },
      method: "POST",
      path: "/paypal/sale/{transactionid}/refund",
    });
  }

  private defaultResponseHandler(
    ohandler: IPayPalRouteHandler,
    request: hapi.Request,
    reply: hapi.ReplyNoContinue,
    error: Error,
    response: any,
  ) {
    if (ohandler) {
      ohandler(request, reply, error, response);
    } else {
      if (error) {
        const bError = boom.badRequest(error.message);
        bError.reformat();
        return reply(bError);
      }
      return reply(response.body);
    }
  }

  private buildRoutes(routes: Array<Partial<IPayPalRouteConfiguration>>) {
    routes.forEach((route) => {
      const dRoute = this.routes.get(route.config.id);
      const nRoute: hapi.RouteConfiguration = {
        config: {
          ...dRoute.config,
          ...route.config,
        },
        handler: (request, reply) => {
          dRoute.handler(request, reply, route.handler);
        },
        method: route.method || dRoute.method,
        path: route.path || dRoute.path,
      };
      this.server.route({ ...route, ...nRoute });
    });
  }

  private async enableWebhooks(webhook: IWebhook) {
    try {
      const w = await Promise.all([this.getWebhookEventTypes(), this.getAccountWebhooks()]);
      this.webhookEvents = w[0];
      const accountWebHooks = w[1];
      const twebhook = accountWebHooks.filter((hook: IWebhook) => hook.url === webhook.url)[0];
      !twebhook ? await this.createWebhook(webhook) : await this.replaceWebhook(twebhook);
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

  private async getWebhookEventTypes() {
      const response = await this.paypal.webhook.api.types();
      this.webhookEvents = response.body.event_types;
      return this.webhookEvents;
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
