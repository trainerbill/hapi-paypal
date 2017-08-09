import * as joi from "joi";

export const paypalSdkSchema = joi.object().keys({
    authorize_url: joi.string().optional(),
    client_id: joi.string().min(10).required(),
    client_secret: joi.string().min(10).required(),
    headers: joi.object().optional(),
    host: joi.string().optional(),
    logout_url: joi.string().optional(),
    mode: joi.string().valid("sandbox", "live").required(),
    openid_connect_host: joi.string().optional(),
    openid_connect_port: joi.string().optional(),
    openid_connect_schema: joi.string().optional(),
    port: joi.string().optional(),
});
