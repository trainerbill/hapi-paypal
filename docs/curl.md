# Curl Calls for testing
You must run 
```
npm run start
```
before executing the CURL calls

## Payment Create
```sh
curl -H "Content-Type:application/json" -X POST http://localhost:3000/paypal/payment -d '{"intent":"sale","payer":{"payment_method":"paypal"},"transactions":[{"amount":{"total":"30.11","currency":"USD","details":{"subtotal":"30.00","tax":"0.07","shipping":"0.03","handling_fee":"1.00","shipping_discount":"-1.00","insurance":"0.01"}},"description":"The payment transaction description.","custom":"EBAY_EMS_90048630024435","invoice_number":"48787589673","payment_options":{"allowed_payment_method":"INSTANT_FUNDING_SOURCE"},"soft_descriptor":"ECHI5786786","item_list":{"items":[{"name":"hat","description":"Brown hat.","quantity":"5","price":"3","tax":"0.01","sku":"1","currency":"USD"},{"name":"handbag","description":"Black handbag.","quantity":"1","price":"15","tax":"0.02","sku":"product34","currency":"USD"}],"shipping_address":{"recipient_name":"Brian Robinson","line1":"4th Floor","line2":"Unit #34","city":"San Jose","country_code":"US","postal_code":"95131","phone":"011862212345678","state":"CA"}}}],"note_to_payer":"Contact us for any questions on your order.","redirect_urls":{"return_url":"http://www.paypal.com/return","cancel_url":"http://www.paypal.com/cancel"}}'
```

## Invoice Create
```sh
curl -H "Content-Type:application/json" -X POST http://localhost:3000/paypal/invoice -d '{"billing_info":[{"address":{"city":"Omaha","line1":"One payment way","postal_code":"68136","state":"Nebraska"},"business_name":"Andrew Throener","email":"athroener@gmail.com","first_name":"Andrew","last_name":"Throener","phone":{"country_code":"1","national_number":"4021112222"}}],"items":[{"name":"Item1","quantity":1,"unit_price":{"currency":"USD","value":"50.00"}},{"name":"Item1","quantity":1,"unit_price":{"currency":"USD","value":"87.00"}}],"merchant_info":{"address":{"city":"San Jose","country_code":"US","line1":"2211 North First St","postal_code":"95131","state":"CA"},"business_name":"ACME","email":"seller@awesome.com","first_name":"Dennis","last_name":"Doctor","phone":{"country_code":"1","national_number":"4082564877"}},"note":"Thanks for your business!","number":"2397","payment_term":{"term_type":"NET_15"},"shipping_info":{"address":{"city":"Omaha","line1":"One payment way","postal_code":"68136","state":"Nebraska"},"business_name":"Andrew Throener(CCUST-00124)","first_name":"Andrew","last_name":"Throener"},"tax_inclusive":true}'
```
                        