import * as mongoose from "mongoose";

const Schema = {
    create_time: String,
    event_type: String,
    event_version: String,
    id: String,
    resource: Object,
    resource_type: String,
    summary: String,
};

const options = {
  timestamps: true,
};

const WebhookSchema = new mongoose.Schema(Schema, options);
export default mongoose.model("PayPalWebhook", WebhookSchema);
