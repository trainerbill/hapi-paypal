import * as joi from "joi";
import * as us from "us";

const abbrs = us.STATES.map((state: any) => {
    return state.abbr;
});

export const paypalAddressSchema = joi.object().keys({
    city: joi.string().trim().empty("").required(),
    country_code: joi.string().trim().empty("").max(2).default("US"),
    line1: joi.string().trim().empty("").required(),
    line2: joi.string().trim().empty("").optional(),
    phone: joi.string().trim().empty("").optional(),
    postal_code: joi.string().trim().empty("").required(),
    state: joi.string().trim().empty("").allow(abbrs).required(),
});

export const paypalPhoneSchema = joi.object().keys({
    country_code: joi.string().regex(/^[0-9]{1,3}?$/).trim().empty("").default("1"),
    national_number: joi.string().regex(/^[0-9]{1,14}?$/).trim().empty("").required(),
});

export const paypalCurrencySchema = joi.object().keys({
    currency: joi.string().max(3).trim().empty("").default("USD"),
    value: joi.string().trim().empty("").required(),
});

export const paypalTaxSchema = joi.object().keys({
    amount: paypalCurrencySchema.optional(),
    name: joi.string().trim().empty("").optional(),
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
    label: joi.string().max(50).trim().empty("").required(),
});
