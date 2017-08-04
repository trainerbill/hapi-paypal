import * as joi from "joi";
import * as us from "us";

const abbrs = us.STATES.map((state: any) => {
    return state.abbr;
});

export const paypalAddressSchema = joi.object().keys({
    city: joi.string().required(),
    country_code: joi.string().empty("").trim().max(2).default("US"),
    line1: joi.string().empty("").trim().required(),
    line2: joi.string().empty("").trim().optional(),
    phone: joi.string().empty("").trim().optional(),
    postal_code: joi.string().empty("").trim().required(),
    state: joi.string().empty("").trim().allow(abbrs).required(),
});

export const paypalPhoneSchema = joi.object().keys({
    country_code: joi.string().regex(/^[0-9]{1,3}?$/).empty("").trim().default("1"),
    national_number: joi.string().regex(/^[0-9]{1,14}?$/).empty("").trim().required(),
});

export const paypalCurrencySchema = joi.object().keys({
    currency: joi.string().max(3).empty("").trim().default("USD"),
    value: joi.string().empty("").trim().required(),
});

export const paypalTaxSchema = joi.object().keys({
    amount: paypalCurrencySchema.optional(),
    name: joi.string().empty("").trim().optional(),
    percent: joi.number().min(0).max(100).optional(),
});

export const paypalCostSchema = joi.object().keys({
    amount: paypalCurrencySchema.optional(),
    percent: joi.number().min(0).max(100).optional(),
});

export const paypalShippingCostSchema = joi.object().keys({
    amount: paypalCurrencySchema.required(),
    tax: paypalTaxSchema.optional(),
});

export const paypalCustomAmountSchema = joi.object().keys({
    amount: paypalCurrencySchema.required(),
    label: joi.string().max(50).empty("").trim().required(),
});
