import * as hapi from "hapi";
import * as paypal from "paypal-rest-sdk";
export interface IHapiPayPalOptions {
    sdk: any;
    routes: IPayPalRouteConfiguration[];
    webhook: paypal.notification.webhook.Webhook;
}
export interface IPayPalRouteConfiguration {
    method?: string;
    path?: string;
    handler?: hapi.RouteHandler | IPayPalRouteHandler;
    config: {
        id: string;
    };
}
export declare type IPayPalRouteHandler = (request: hapi.Request, reply: hapi.ReplyNoContinue, response: any) => void;
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
