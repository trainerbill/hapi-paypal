import * as joi from "joi";
import * as us from "us";

const abbrs = us.STATES.map((state: any) => {
    return state.abbr;
});

export const paypalAddressSchema = joi.object().keys({
    city: joi.string().required(),
    country_code: joi.string().empty("").max(2).required(),
    line1: joi.string().empty("").required(),
    line2: joi.string().empty("").optional(),
    phone: joi.string().empty("").optional(),
    postal_code: joi.string().empty("").required(),
    state: joi.string().empty("").allow(abbrs).required(),
});

export const paypalPhoneSchema = joi.object().keys({
    country_code: joi.string().regex(/^[0-9]{1,3}?$/),
    national_number: joi.string().regex(/^[0-9]{1,14}?$/),
});

export const paypalCurrencySchema = joi.object().keys({
    currency: joi.string().max(3).required(),
    value: joi.string().required(),
});

export const paypalTaxSchema = joi.object().keys({
    amount: paypalCurrencySchema.optional(),
    name: joi.string().optional(),
    percent: joi.number().min(0).max(100),
});

export const paypalCostSchema = joi.object().keys({
    amount: paypalCurrencySchema.optional(),
    percent: joi.number().min(0).max(100),
});

export const paypalShippingCostSchema = joi.object().keys({
    amount: paypalCurrencySchema.required(),
    tax: paypalTaxSchema.optional(),
});

export const paypalCustomAmountSchema = joi.object().keys({
    amount: paypalCurrencySchema.required(),
    label: joi.string().max(50).required(),
});
