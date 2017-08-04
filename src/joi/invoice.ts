import * as joi from "joi";
import * as common from "./common";

export const paypalInvoiceItemsSchema = joi.object().keys({
    date: joi.date().empty("").optional(),
    description: joi.string().empty("").trim().max(1000).optional(),
    discount: common.paypalCostSchema.optional(),
    name: joi.string().empty("").trim().max(200).default("Item Name"),
    quantity: joi.number().greater(-10000).less(10000).required(),
    tax: common.paypalTaxSchema.optional(),
    unit_of_measure: joi.string().empty("").trim().allow(["QUANTITY", "HOURS", "AMOUNT"]).optional(),
    unit_price: common.paypalCurrencySchema.required(),
});

export const paypalInvoiceTermSchema = joi.object().min(1).keys({
    due_date: joi.date().empty("").optional(),
    term_type: joi.string().empty("").trim().allow([
        "DUE_ON_RECEIPT",
        "DUE_ON_DATE_SPECIFIED",
        "NET_10",
        "NET_15",
        "NET_30",
        "NET_45",
        "NET_60",
        "NET_90",
        "NO_DUE_DATE"]).optional(),
});

export const paypalInvoiceSchema = joi.object().keys({
    allow_tip: joi.boolean().default(false),
    billing_info: joi.array().min(1).items(
        joi.object().keys({
            additional_info: joi.string().empty("").trim().max(40).optional(),
            address: common.paypalAddressSchema.optional(),
            business_name: joi.string().empty("").trim().max(100).optional(),
            email: joi.string().empty("").trim().max(260).optional(),
            first_name: joi.string().empty("").trim().max(30).optional(),
            language: joi.string().empty("").trim().max(5).optional(),
            last_name: joi.string().empty("").trim().max(30).optional(),
            phone: common.paypalPhoneSchema.optional(),
        }).required(),
    ).required(),
    cc_info: joi.array().items(
        joi.object().keys({
            email: joi.string().empty("").trim().required(),
        }),
    ).optional(),
    custom: common.paypalCustomAmountSchema.optional(),
    discount: common.paypalCostSchema.optional(),
    invoice_date: joi.date().empty("").optional(),
    items: joi.array().min(1).items(paypalInvoiceItemsSchema).required(),
    logo_url: joi.string().empty("").trim().max(4000).optional(),
    merchant_info: joi.object().keys({
        address: common.paypalAddressSchema.optional(),
        business_name: joi.string().empty("").trim().max(100).required(),
        email: joi.string().empty("").trim().max(260).optional(),
        first_name: joi.string().empty("").trim().max(256).optional(),
        last_name: joi.string().empty("").trim().max(256).optional(),
        phone: common.paypalPhoneSchema.optional(),
    }).required(),
    merchant_memo: joi.string().empty("").trim().max(500).optional(),
    minimum_amount_due: common.paypalCurrencySchema.optional(),
    note: joi.string().empty("").trim().max(4000).optional(),
    number: joi.string().empty("").trim().optional(),
    payment_term: paypalInvoiceTermSchema.required(),
    reference: joi.string().empty("").trim().max(60).optional(),
    shipping_info: joi.object().keys({
        address: common.paypalAddressSchema.optional(),
        business_name: joi.string().empty("").trim().max(100).optional(),
        first_name: joi.string().empty("").trim().max(256).optional(),
        last_name: joi.string().empty("").trim().max(256).optional(),
    }).optional(),
    tax_calculated_after_discount: joi.boolean().default(false),
    tax_inclusive: joi.boolean().default(false),
    template_id: joi.string().empty("").trim().optional(),
    terms: joi.string().empty("").trim().max(4000).optional(),
});
