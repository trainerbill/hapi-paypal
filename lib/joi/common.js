"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const joi = require("joi");
const us = require("us");
const abbrs = us.STATES.map((state) => {
    return state.abbr;
});
exports.paypalAddressSchema = joi.object().keys({
    city: joi.string().required(),
    country_code: joi.string().empty("").trim().max(2).default("US"),
    line1: joi.string().empty("").trim().required(),
    line2: joi.string().empty("").trim().optional(),
    phone: joi.string().empty("").trim().optional(),
    postal_code: joi.string().empty("").trim().required(),
    state: joi.string().empty("").trim().allow(abbrs).required(),
});
exports.paypalPhoneSchema = joi.object().keys({
    country_code: joi.string().regex(/^[0-9]{1,3}?$/).empty("").trim().default("1"),
    national_number: joi.string().regex(/^[0-9]{1,14}?$/).empty("").trim().required(),
});
exports.paypalCurrencySchema = joi.object().keys({
    currency: joi.string().max(3).empty("").trim().default("USD"),
    value: joi.string().empty("").trim().required(),
});
exports.paypalTaxSchema = joi.object().keys({
    amount: exports.paypalCurrencySchema.optional(),
    name: joi.string().empty("").trim().optional(),
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
    label: joi.string().max(50).empty("").trim().required(),
});
//# sourceMappingURL=common.js.map