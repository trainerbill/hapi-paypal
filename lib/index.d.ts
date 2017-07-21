import * as hapi from "hapi";
import * as paypal from "paypal-rest-sdk";
export declare type Partial<T> = {
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
export declare type IPayPalRouteHandler = (request: hapi.Request, reply: hapi.ReplyNoContinue, error: any, response: any) => void;
export declare class HapiPayPal {
    private webhookEvents;
    private webhook;
    private routes;
    constructor();
    register: hapi.PluginFunction<any>;
    private buildRoute(route);
    private getMockData(type);
    private enableWebhooks();
    private getWebhookEventTypes();
    private getAccountWebhooks();
    private createWebhook();
    private replaceWebhook();
}
