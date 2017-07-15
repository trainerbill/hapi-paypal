import * as hapi from "hapi";
import * as paypal from "paypal-rest-sdk";
export interface IHapiPayPalOptions {
    sdk: paypal.IConfigureOptions;
    routes: hapi.RouteConfiguration[];
    webhooks: paypal.IWebhookRequest;
}
export interface IPayPalRouteHandler extends hapi.RouteHandler {
    (response: any): void;
}
export declare class HapiPayPal {
    private webhookEvents;
    private webhookConfig;
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
