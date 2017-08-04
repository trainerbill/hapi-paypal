"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const joi = require("joi");
const us = require("us");
const abbrs = us.STATES.map((state) => {
    return state.abbr;
});
exports.paypalAddressSchema = joi.object().keys({
    city: joi.string().required(),
    country_code: joi.string().empty("").max(2).required(),
    line1: joi.string().empty("").required(),
    line2: joi.string().empty("").optional(),
    phone: joi.string().empty("").optional(),
    postal_code: joi.string().empty("").required(),
    state: joi.string().empty("").allow(abbrs).required(),
});
exports.paypalPhoneSchema = joi.object().keys({
    country_code: joi.string().regex(/^[0-9]{1,3}?$/),
    national_number: joi.string().regex(/^[0-9]{1,14}?$/),
});
exports.paypalCurrencySchema = joi.object().keys({
    currency: joi.string().max(3).required(),
    value: joi.string().required(),
});
exports.paypalTaxSchema = joi.object().keys({
    amount: exports.paypalCurrencySchema.optional(),
    name: joi.string().optional(),
    percent: joi.number().min(0).max(100),
});
exports.paypalCostSchema = joi.object().keys({
    amount: exports.paypalCurrencySchema.optional(),
    percent: joi.number().min(0).max(100),
});
exports.paypalShippingCostSchema = joi.object().keys({
    amount: exports.paypalCurrencySchema.required(),
    tax: exports.paypalTaxSchema.optional(),
});
exports.paypalCustomAmountSchema = joi.object().keys({
    amount: exports.paypalCurrencySchema.required(),
    label: joi.string().max(50).required(),
});
//# sourceMappingURL=common.js.map