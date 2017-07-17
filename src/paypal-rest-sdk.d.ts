declare module "paypal-rest-sdk" {

    export interface IItem {
        currency: string;
        name: string;
        price: string;
        quantity: number;
        sku?: string;
    }

    export interface ITransaction {
        amount: {
            currency: string;
            total: string;
        };
        description?: string;
        item_list?: {
            items: [IItem];
        };
    }

    export interface IPaymentRequest {
        intent: string;
        payer: {
            payment_method: string;
        };
        redirect_urls?: {
            cancel_url: string;
            return_url: string;
        };
        transactions: [ITransaction];
    }

    export interface IWebhookRequest {
        url: string;
        event_types: IEventType[];
    }

    export interface IResponse {
        httpStatusCode: number;
        create_time: string;
    }

    interface ILink {
        href: string;
        method: string;
        rel: string;
    }

    export interface IListWebookEventsResponse extends IResponse {
        event_types: IEventType[];
    }

    export interface IWebhookResponse extends IResponse {
        webhooks: IWebhook[];
    }

    export interface IEventType {
        description?: string;
        name: string;
        status?: string;
    }

    export interface IWebhook {
        event_types: [IEventType];
        id: string;
        links: [ILink];
        url: string;
    }

    export interface IPaymentResponse extends IResponse {
        id: string;
        intent: string;
        state: string;
        payer: {
            payment_method: string;
        };
        transactions: [ ITransaction ];
    }

    type ICallbackFunction<T> = ( err: any, response: T) => any;

    export interface IConfigureOptions {
        client_id: string;
        client_secret: string;
        mode: string;
        schema?: string;
        host?: string;
        port?: string;
        openid_connect_schema?: string;
        openid_connect_host?: string;
        openid_connect_port?: string;
        authorize_url?: string;
        logout_url?: string;
        headers?: any;
    }

    export interface IPayment {
        create(request: IPaymentRequest, cb: ICallbackFunction<IPaymentResponse>): void;
    }

    export interface INotification {
        webhook: {
            list(cb: ICallbackFunction<IWebhookResponse>): void;
            create(webhook: IWebhookRequest, cb: ICallbackFunction<any>): void;
            replace(id: string, webhook: any, cb: ICallbackFunction<any>): void;
        };
        webhookEventType: {
            list(cb: ICallbackFunction<IListWebookEventsResponse>): void;
        };
    }

    export function configure(options: IConfigureOptions): void;
    export let payment: IPayment;
    export let notification: INotification;
}
