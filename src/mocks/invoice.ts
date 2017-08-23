import * as paypal from "paypal-rest-sdk";

// tslint:disable:object-literal-sort-keys
// TODO: Change to paypal.invoice.Invoice type
// when this PR merges https://github.com/DefinitelyTyped/DefinitelyTyped/pull/19288
export const mockPaypalInvoice: any = {
    id: "INV2-94XS-GASK-LDJC-2HV2",
    number: "2460",
    template_id: "TEMP-5ML62849WY523084R",
    status: "SENT",
    merchant_info: {
        email: "seller@awesome.com",
        first_name: "Dennis",
        last_name: "Doctor",
        business_name: "ACME",
        phone: {
            country_code: "1",
            national_number: "4082564877",
        },
        address: {
            line1: "2211 North First St",
            city: "San Jose",
            state: "CA",
            postal_code: "95131",
            country_code: "US",
            phone: {
                country_code: "1",
                national_number: "4082564877",
            },
        },
    },
    billing_info: [{
        email: "fflintstone@gmail.com",
        first_name: "Fred",
        last_name: "Flintstone",
        business_name: "Fred Flintstone",
        phone: {
            country_code: "1",
            national_number: "4021112222",
        },
        address: {
            line1: "2211 North First St",
            city: "San Jose",
            state: "CA",
            postal_code: "95131",
            country_code: "US",
            phone: {
                country_code: "1",
                national_number: "4082564877",
            },
        },
        additional_info: "CUST-00124",
    }],
    shipping_info: {
        first_name: "Andrew",
        last_name: "Throener",
        business_name: "Andrew Throener(CCUST-00124)",
        address: {
            line1: "2211 North First St",
            city: "San Jose",
            state: "CA",
            postal_code: "95131",
            country_code: "US",
            phone: {
                country_code: "1",
                national_number: "4082564877",
            },
        },
    },
    items: [{
        name: "Item Name",
        quantity: 1,
        unit_price: {
            currency: "USD",
            value: "60.00",
        },
    },
    {
        name: "Item Name",
        quantity: 1,
        unit_price: {
            currency: "USD",
            value: "100.00",
        },
    }],
    invoice_date: "2017-08-21 PDT",
    payment_term: {
        term_type: "NET_15",
        due_date: "2017-09-05 PDT",
    },
    tax_calculated_after_discount: false,
    tax_inclusive: true,
    note: "Thanks for your business!",
    total_amount: {
        currency: "USD",
        value: "160.00",
    },
    metadata: {
        created_date: "2017-08-21 09:01:47 PDT",
        first_sent_date: "2017-08-21 11:03:12 PDT",
        last_sent_date: "2017-08-21 11:03:12 PDT",
        payer_view_url: "https://www.sandbox.paypal.com/invoice/payerView/details/INV2-94XS-GASK-LDJC-2HV2",
    },
    allow_tip: false,
    links: [{
        rel: "self",
        href: "https://api.sandbox.paypal.com/v1/invoicing/invoices/INV2-94XS-GASK-LDJC-2HV2",
        method: "GET",
    },
    {
        rel: "update",
        href: "https://api.sandbox.paypal.com/v1/invoicing/invoices/INV2-94XS-GASK-LDJC-2HV2/update",
        method: "PUT",
    },
    {
        rel: "cancel",
        href: "https://api.sandbox.paypal.com/v1/invoicing/invoices/INV2-94XS-GASK-LDJC-2HV2/remind",
        method: "POST",
    },
    {
        rel: "remind",
        href: "https://api.sandbox.paypal.com/v1/invoicing/invoices/INV2-94XS-GASK-LDJC-2HV2/cancel",
        method: "POST",
    },
    {
        rel: "record-payment",
        href: "https://api.sandbox.paypal.com/v1/invoicing/invoices/INV2-94XS-GASK-LDJC-2HV2/record-payment",
        method: "POST",
    }, {
        rel: "qr-code",
        href: "https://api.sandbox.paypal.com/v1/invoicing/invoices/INV2-94XS-GASK-LDJC-2HV2/qr-code",
        method: "GET",
    }],
};
// tslint:enable:object-literal-sort-keys
