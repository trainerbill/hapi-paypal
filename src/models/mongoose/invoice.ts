import * as mongoose from "mongoose";

const Schema = {
    allow_partial_payment: Boolean,
    attachments: Array,
    billing_info: Array,
    cc_info: Array,
    custom: Object,
    discount: Object,
    id: String,
    invoice_date: Date,
    items: Array,
    merchant_info: Object,
    merchant_memo: String,
    metadata: Object,
    minimum_amount_due: Object,
    note: String,
    number: String,
    paid_amount: Object,
    payment_summary: Object,
    payment_term: Object,
    payments: Array,
    phone: Object,
    reference: String,
    refunded_amount: Object,
    refunds: Array,
    shipping_cost: Object,
    shipping_info: Object,
    status: String,
    tax_calculated_after_discount: Boolean,
    tax_inclusive: Boolean,
    template_id: String,
    terms: String,
    total_amount: Object,
    uri: String,
};

const options = {
  timestamps: true,
};

const InvoiceSchema = new mongoose.Schema(Schema, options);
export default mongoose.model("PayPalInvoice", InvoiceSchema);
