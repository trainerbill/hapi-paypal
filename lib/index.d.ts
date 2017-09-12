import * as hapi from "hapi";
import { IConfigureOptions, IWebhook } from "paypal-rest-api";
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
export declare type IPayPalRouteHandler = (request: hapi.Request, reply: hapi.ReplyNoContinue, error: any, response: any) => void;
export interface InternalRouteConfiguration extends hapi.RouteConfiguration {
    handler?: InternalRouteHandler;
    config: {
        id: string;
    };
}
export declare type InternalRouteHandler = (request: hapi.Request, reply: hapi.ReplyNoContinue, ohandler: IPayPalRouteHandler) => void;
export declare class HapiPayPal {
    private webhookEvents;
    private webhook;
    private routes;
    private server;
    private paypal;
    constructor();
    register: hapi.PluginFunction<any>;
    private setupRoutes();
    private defaultResponseHandler(ohandler, request, reply, error, response);
    private buildRoutes(routes);
    private enableWebhooks(webhook);
    private getWebhookEventTypes();
    private getAccountWebhooks();
    private createWebhook(webhook);
    private replaceWebhook(webhook);
}
