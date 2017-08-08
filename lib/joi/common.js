"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const joi = require("joi");
const us = require("us");
const abbrs = us.STATES.map((state) => {
    return state.abbr;
});
exports.paypalAddressSchema = joi.object().keys({
    city: joi.string().trim().empty("").required(),
    country_code: joi.string().trim().empty("").max(2).default("US"),
    line1: joi.string().trim().empty("").required(),
    line2: joi.string().trim().empty("").optional(),
    phone: joi.string().trim().empty("").optional(),
    postal_code: joi.string().trim().empty("").required(),
    state: joi.string().trim().empty("").allow(abbrs).required(),
});
exports.paypalPhoneSchema = joi.object().keys({
    country_code: joi.string().regex(/^[0-9]{1,3}?$/).trim().empty("").default("1"),
    national_number: joi.string().regex(/^[0-9]{1,14}?$/).trim().empty("").required(),
});
exports.paypalCurrencySchema = joi.object().keys({
    currency: joi.string().max(3).trim().empty("").default("USD"),
    value: joi.string().trim().empty("").required(),
});
exports.paypalTaxSchema = joi.object().keys({
    amount: exports.paypalCurrencySchema.optional(),
    name: joi.string().trim().empty("").optional(),
    percent: joi.number().min(0).max(100).optional(),
});
exports.paypalCostSchema = joi.object().keys({
    amount: exports.paypalCurrencySchema.optional(),
    percent: joi.number().min(0).max(100).optional(),
});
exports.paypalShippingCostSchema = joi.object().keys({
    amount: exports.paypalCurrencySchema.required(),
    tax: exports.paypalTaxSchema.optional(),
});
exports.paypalCustomAmountSchema = joi.object().keys({
    amount: exports.paypalCurrencySchema.required(),
    label: joi.string().trim().empty("").max(50).required(),
});
//# sourceMappingURL=common.js.map