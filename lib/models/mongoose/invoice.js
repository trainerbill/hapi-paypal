"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Mixed = mongoose.Schema.Types.Mixed;
const Schema = {
    allow_partial_payment: Boolean,
    attachments: Array,
    billing_info: Array,
    cc_info: Array,
    custom: Mixed,
    discount: Mixed,
    id: String,
    invoice_date: Date,
    items: Array,
    merchant_info: Mixed,
    merchant_memo: String,
    metadata: Mixed,
    minimum_amount_due: Mixed,
    note: String,
    number: String,
    paid_amount: Mixed,
    payment_summary: Mixed,
    payment_term: Mixed,
    payments: Array,
    phone: Mixed,
    reference: String,
    refunded_amount: Mixed,
    refunds: Array,
    shipping_cost: Mixed,
    shipping_info: Mixed,
    status: String,
    tax_calculated_after_discount: Boolean,
    tax_inclusive: Boolean,
    template_id: String,
    terms: String,
    total_amount: Mixed,
    uri: String,
};
const options = {
    timestamps: true,
};
const InvoiceSchema = new mongoose.Schema(Schema, options);
exports.default = mongoose.model("PayPalInvoice", InvoiceSchema);
//# sourceMappingURL=invoice.js.map