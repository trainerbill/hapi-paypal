import * as joi from "joi";
import * as common from "./common";

export const paypalInvoiceItemsSchema = joi.object().keys({
    date: joi.date().optional(),
    description: joi.string().max(1000).optional(),
    discount: common.paypalCostSchema.optional(),
    name: joi.string().max(200).required(),
    quantity: joi.number().greater(-10000).less(10000).required(),
    tax: common.paypalTaxSchema.optional(),
    unit_of_measure: joi.string().allow(["QUANTITY", "HOURS", "AMOUNT"]),
    unit_price: common.paypalCurrencySchema.required(),
});

export const paypalInvoiceTermSchema = joi.object().min(1).keys({
    due_date: joi.date(),
    term_type: joi.string().allow([
        "DUE_ON_RECEIPT",
        "DUE_ON_DATE_SPECIFIED",
        "NET_10",
        "NET_15",
        "NET_30",
        "NET_45",
        "NET_60",
        "NET_90",
        "NO_DUE_DATE"]),
});

export const paypalInvoiceSchema = joi.object().keys({
    allow_tip: joi.boolean().optional(),
    billing_info: joi.array().min(1).items(
        joi.object().keys({
            additional_info: joi.string().optional(),
            address: common.paypalAddressSchema.optional(),
            business_name: joi.string().optional(),
            email: joi.string().optional(),
            first_name: joi.string().optional(),
            language: joi.string().optional(),
            last_name: joi.string().length(5).optional(),
            phone: common.paypalPhoneSchema.optional(),
        }).required(),
    ).required(),
    cc_info: joi.array().items(
        joi.object().keys({
            email: joi.string().required(),
        }),
    ).optional(),
    custom: common.paypalCustomAmountSchema.optional(),
    discount: common.paypalCostSchema.optional(),
    invoice_date: joi.date().optional(),
    items: joi.array().min(1).items(paypalInvoiceItemsSchema).required(),
    logo_url: joi.string().max(4000).optional(),
    merchant_info: joi.object().keys({
        address: common.paypalAddressSchema.optional(),
        business_name: joi.string().max(100).required(),
        email: joi.string().max(260).optional(),
        first_name: joi.string().max(256).optional(),
        last_name: joi.string().max(256).optional(),
        phone: common.paypalPhoneSchema.optional(),
    }).required(),
    merchant_memo: joi.string().max(500).optional(),
    minimum_amount_due: common.paypalCurrencySchema.optional(),
    note: joi.string().max(4000).optional(),
    number: joi.string().required(),
    payment_term: paypalInvoiceTermSchema.required(),
    reference: joi.string().max(60).optional(),
    shipping_info: joi.object().keys({
        address: common.paypalAddressSchema.optional(),
        business_name: joi.string().max(100).required(),
        first_name: joi.string().max(256).optional(),
        last_name: joi.string().max(256).optional(),
    }).optional(),
    tax_calculated_after_discount: joi.boolean().optional(),
    tax_inclusive: joi.boolean().optional(),
    template_id: joi.string().optional(),
    terms: joi.string().max(4000).optional(),
});
