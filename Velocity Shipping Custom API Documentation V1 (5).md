# **Velocity Shipping API Documentation for Custom Integration** 



## **Overview** 

This document serves as a complete and developer-friendly reference to the Velocity Shipping API suite. It is intended to help sellers and third-party platforms seamlessly integrate their custom websites, ERPs, or order management systems with Velocity Shipping (Formerly Shipfast). 

The documentation covers: 

- Clear and detailed API endpoint definitions 

- Field-level request specifications 

- Sample request and response payloads 

- Standard error codes with explanations 

By using these APIs, integrators can efficiently create, manage, and track shipments, enabling end-to-end order manifestation and shipping operations through Velocity Shipping. 

**Base URL:** https://shazam.velocity.in/ 

|**Standard Error**|**Codes:**|
|---|---|
|**HTTP Code**|**Description**|
|400|Validation error in request parameters|
|401|Authorization failed due to invalid or missing credentials|
|422|Waybill operation failed|
|422|Shipment cancellation failed|



## **1. Authentication - Get Token** 

### **Purpose** 

Obtain API token for Authorization header in subsequent requests. 

### **Method** : POST 

**Endpoint -** <u>/custom/api/v1/auth-token</u> 

### **Request Fields** 

|**Field**|**Type**|**Required**|**Description**|**Example**|
|---|---|---|---|---|
|**username**|string|Yes|Mobile number with country<br>code (Velocity Shipping<br>Username)|+91xxxxxxxxx|
|**password**|string|Yes|Velocity Shipping Account<br>password|Your password|



### **Notes** 

**●** Use <mark>`Authorization: {{token}}`</mark> in all secured endpoints. 

- Token will be valid for 24 Hrs 

### **Sample Request Curl** 

curl --location '/custom/api/v1/auth-token' \ 

--header 'Content-Type: application/json' \ 

--data-raw '{ 

"username": "+919866340090", 

"password": "Velocity@123" 

}' 

### **Response** 

{ 

"token": "bbqRkOXw0xWLuYj9ubnDwg", 

"expires_at": "2025-09-17T10:11:40" 

} 

## **2. Create Warehouse** 

### **Purpose** 

Creates a new pickup warehouse in the Velocity Shipping system. 

### **Method** : POST 

**Endpoint:** <u>/custom/api/v1/warehouse</u> 

### **Request Fields** 

|**Field**|**Type**|**Required**|**Description**|**Example**|
|---|---|---|---|---|
|name|string|Yes|Warehouse display<br>name|Demo Warehouse|
|phone_number|string|Yes|POC Contact<br>number|8860606061|
|gst_no|string|Optional|Gst no. of the<br>warehouse|TY9782399913|
|email|string|Yes|POC email|shipfast-clickpost@ve<br>locity.in|
|contact_person|string|Yes|Warehouse POC|Raghuraj|
|address_attributes<br>.street_address|string|Yes|Street address|Incubex HSR Layout<br>...|
|address_attributes<br>.zip|string|Yes|PIN|560102|
|address_attributes<br>.city|string|Yes|City|Bangalore|
|address_attributes|string|Yes|State|Karnataka|



|.state|||||
|---|---|---|---|---|
|address_attributes|string|Yes|Country|India|
|.country|||||



### **Sample Request Curl** 

curl --location '/custom/api/v1/warehouse' \ --header 'Content-Type: application/json' \ --header 'Authorization: bbqRkOXw0xWLuYj9ubnDwg' \ --data-raw '{ "name": "Demo Warehouse", "phone_number": "8860606061", "gst_no": "886060608861", "email": "shipfast-clickpost@velocity.in", "contact_person": "Raghuraj", "address_attributes": { "street_address": "Incubex HSR Layout (HSR6) #1504, 19th Main, 11th Cross Rd, opposite Decathlon, 1st Sector, HSR Layout", "zip": "560102", "city": "Bangalore", "state": "Karnataka", "country": "India" } }' 

### **Response** 

{ "status": "SUCCESS", "payload": { "warehouse_id": "WH66DU" } } 

## **3. Serviceability API** 

### **Purpose** 

Checks whether pickup and delivery are supported between two pincodes for a given payment mode and shipment type and also shares a list of eligible carriers for the lane. 

### **Method** : POST 

**Endpoint:** <u>/custom/api/v1/serviceability</u> 

### **Request Fields** 

|**Field**|**Type**|**Required**|**Description**|**Example**|
|---|---|---|---|---|
|from|string|Yes|Pickup pincode|560068|
|to|string|Yes|Destination pincode|560068|
|payment_mode|enum|Yes|cod or prepaid|cod|
|shipment_type|enum|Yes|forward or return|forward|



### **Sample Request Curl** 

curl --location 'https://shazam.velocity.in/custom/api/v1/serviceability' \ --header 'Content-Type: application/json' \ --header 'Authorization: DO190JE4z8qD4S7ly6hx9Q' \ 

--data '{ "from": "560068", "to": "560068", "payment_mode": "cod", "shipment_type": "forward" }' 

### **Response** 

{ "result": { "serviceability_results": [ { "carrier_id": "CAR0EPDPJXXL4", 

"carrier_name": "DTDC Standard" 

}, { "carrier_id": "CARCVBWTPRH08", "carrier_name": "Ekart Standard" }, { "carrier_id": "CAR5IXXJVT5MD", "carrier_name": "Delhivery Standard 5 Kg" }, { "carrier_id": "CARVKGNGNLOCU", "carrier_name": "Blitz Special" }, { "carrier_id": "CARFYXUKCQHBM", "carrier_name": "Delhivery Special Standard 20 kg" }, { "carrier_id": "CARVPHPLJQJOA", "carrier_name": "Delhivery Special Standard 10 kg" }, { "carrier_id": "CARO0ZZQH1H6U", "carrier_name": "Delhivery Standard" }, { "carrier_id": "CAR2FZNOLGJ2X", "carrier_name": "Bluedart Standard" }, { "carrier_id": "CARLTTKCUYWRM", "carrier_name": "Delhivery Standard 250G" }, { "carrier_id": "CARTS5SW8LSJT", "carrier_name": "XpressBees Standard" }, { "carrier_id": "CARKX7WW6UNS8", "carrier_name": "Pikndel NDD" } ], "zone": "zone_a" }, 

"status": "SUCCESS" 

} 

## **4. Forward Shipment - Create Order** 

### **Purpose** 

Creates and manifests a forward shipment (i.e. create an order and also assign to a courier) after successful serviceability validation. 

**Method** : POST 

**Endpoint** : /custom/api/v1/forward-order-orchestration 

### **<u>Forward Shipment - Field-Level Table</u>** 

**i) Order, Channel & Carrier** 

|**Field**|**Type**|**Require**<br>**d**|**Description**|**Example**|
|---|---|---|---|---|
|order_id|string|Yes|Unique per order|ORDER-49|
|order_date|string|Yes|YYYY-MM-DD HH:mm|2018-05-08 12:23|
|carrier_id|string|Optional|carrier_id is fetched from the<br>Serviceability API; leave it blank<br>for automatic courier<br>assignment based on<br>configured shipping rules, or<br>pass a specific carrier_id to<br>assign a particular courier.|<br>CARO0ZZQH1H6U|



### **ii) Billing & Shipping** 

|**Field**|**Type**|**Require**<br>**d**|**Description**|**Example**|
|---|---|---|---|---|



|billing_customer<br>_name|string|Yes|First name|Saurabh|
|---|---|---|---|---|
|billing_last_nam<br>e|string|Optional|Last name|Jindal|
|billing_address|string|Yes|Address line 1|Incubex, Velocity|
|billing_city|string|Yes|City|Bangalore|
|billing_pincode|string|Yes|6-digit PIN|560102|
|billing_state|string|Yes|State|Karnataka|
|billing_country|string|Yes|Country|India|
|billing_email|string|Optional|Email|saurabh+123891@v<br>elocity.in|
|billing_phone|string|Yes|Phone|8860697807|
|shipping_is_billi<br>ng|boolean|Optional|True if shipping same as<br>billing|TRUE|
|print_label|boolean|Yes|Auto-generate label|TRUE|



### **iii) Items & Payment** 

|**Field**|**Type**|**Require**<br>**d**|**Description**|**Example**||
|---|---|---|---|---|---|
|order_items[]|array|Yes|List of items|see JSON||
|payment_metho<br>d|enum|Yes|COD or PREPAID|COD||
|sub_total|number|Yes|Order subtotal||990|
|cod_collectible|number|Yes|Required if payment_method<br>is COD, pass 0 in case of<br>PREPAID||990|



### **iv) Dimensions & Warehouse** 

|**Field**|**Type**|**Require**<br>**d**|**Description**|**Example**|
|---|---|---|---|---|
|length|number|Yes|cm|100|
|breadth|number|Yes|cm|50|



|height|number|Yes|cm||10|
|---|---|---|---|---|---|
|weight|number|Yes|kg||0.5|
|pickup_location|string|Yes|Pickup Location Name|Lucknow<br>Warehouse||
|warehouse_id|string|Yes|Pickup warehouse Id in<br>Velocity Shipping Portal|WHYYB5||



### **v) Vendor details (Pickup Location details)** 

|**Field**|**Type**|**Required**|**Description**|**Example**|
|---|---|---|---|---|
|email|string|Optional|Vendor email|abcdd@abcdd.com|
|phone|string|Optional|Vendor phone|9879879879|
|name|string|Optional|Vendor name|Coco Cookie|
|address|string|Optional|Address|Street 1|
|city|string|Optional|City|delhi|
|state|string|Optional|State|new delhi|
|country|string|Optional|Country|india|
|pin_code|string|Optional|PIN|110077|
|pickup_location|string|Optional|Pickup label|HomeNew|



### **Sample Request Curl** 

curl --location 'https://shazam.velocity.in/custom/api/v1/forward-order-orchestration' \ 

- --header 'Content-Type: application/json' \ 

- --header 'Authorization: DO190JE4z8qD4S7ly6hx9Q' \ 

- --data-raw '{ 

"order_id": "ORDER-43242", 

"order_date": "2018-05-08 12:23", 

"carrier_id": "CARO0ZZQH1H6U",        // 

"billing_customer_name": "Saurabh", 

"billing_last_name": "Jindal", 

"billing_address": "Incubex, Velocity", 

"billing_city": "Bangalore", 

"billing_pincode": "560102", 

"billing_state": "Karnataka", "billing_country": "India", "billing_email": "saurabh+123891@velocity.in", "billing_phone": "8860697807", "shipping_is_billing": true, "print_label": true, "order_items": [{"name": "T-shirt Round Neck","sku": "t-shirt-round1474","units": 2,"selling_price": 1000,"discount": 100,"tax": 10}], "payment_method": "COD", "sub_total": 990, "cod_collectible": 990, "length": 100, "breadth": 50, "height": 10, "weight": 0.5, "pickup_location": "HomeNew", "warehouse_id": "WHZWUN", "vendor_details": {"email": "abcdd@abcdd.com","phone": "9879879879","name": "Coco Cookie","address": "Street 1","address_2": "","city": "delhi","state": "new delhi","country": "india","pin_code": "110077","pickup_location": "HomeNew"}} ' 

**Response** { "status": 1, "payload": { "pickup_location_added": 1, "order_created": 1, "awb_generated": 1, "label_generated": 1, "pickup_generated": 1, "manifest_generated": 0, "pickup_scheduled_date": null, "pickup_booked_date": null, "order_id": "ORDKDKHOFL07I", "shipment_id": "SHIHB0BMT4DYM", "awb_code": "34812010700125", "courier_company_id": "CARO0ZZQH1H6U", "courier_name": "Delhivery Standard", "assigned_date_time": { 

"date": "2025-09-30T17:50:50.424+05:30", "timezone_type": 3, "timezone": "Asia/Kolkata" }, "applied_weight": 0.5, "cod": 1, "label_url": "https://velocity-shazam-prod.s3.ap-south-1.amazonaws.com/n9u98s8nodhjgqhnl4fh85 2tvqo5?response-content-disposition=inline%3B%20filename%3D%223481201070012 5_shipping_label.pdf%22%3B%20filename%2A%3DUTF-8%27%2734812010700125_ shipping_label.pdf&response-content-type=application%2Fpdf&X-Amz-Algorithm=AWS 4-HMAC-SHA256&X-Amz-Credential=AKIAU4T4YDSMMKHXEIKS%2F20250930%2Fa p-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250930T122050Z&X-Amz-Expires =3600&X-Amz-SignedHeaders=host&X-Amz-Signature=9f1e2e859fa917841c1b74ff282 2d28cda2661b64be6c0191daf6390e4647ca2", "manifest_url": null, "routing_code": null, "rto_routing_code": null, "pickup_token_number": null, "charges": { "frwd_charges": { "shipping_charges": "44.40", "cod_charges": "31.30", "dead_weight_billing": true }, "rto_charges": { "rto_charges": "40.00" } } } } 

### **<u>Create Order and Shipment Separately</u>** 

Velocity Shipping allows you to create an order without assigning a courier and assign the courier later by creating the shipment in a separate step. This is useful when courier selection needs to be deferred or handled through shipping rules. 

### **a) Create Order Only (No Courier Assignment)** 

### **Sample Request Curl** 

curl --location 'https://shazam.velocity.in/custom/api/v1/forward-order' \ --header 'Authorization: Iu9npoZf8PWpvIIBeMZXWQ' \ --header 'Content-Type: application/json' \ --data-raw '{ "order_id": "ORDER-0099iyhih", "order_date": "2018-05-08 12:23", "channel_id": "27202", "billing_customer_name": "Saurabh", "billing_last_name": "Jindal", "billing_address": "Incubex, Velocity", "billing_city": "Bangalore", "billing_pincode": "560102", "billing_state": "Karnataka", "billing_country": "India", "billing_email": "saurabh+123891@velocity.in", "billing_phone": "8860697807", "shipping_is_billing": true, "print_label": true, "order_items": [ { "name": "T-shirt Round Neck", "sku": "t-shirt-round1474", "units": 2, "selling_price": 1000, "discount": 100, "tax": 10 }, { "name": "T-shirt Round Neck V2", "sku": "t-shirt-V", "units": 10, "selling_price": 100, "discount": 10, "tax": 10 } ], "payment_method": "COD", "sub_total": 990, "length": 100, "cod_collectible": 990, "breadth": 50, 

"height": 10, "weight": 0.50, "pickup_location": "HomeNew", "warehouse_id": "WHYYB5", "vendor_details": { "email": "abcdd@abcdd.com", "phone": "9879879879", "name": "Coco Cookie", "address": "Street 1", "address_2": "", "city": "delhi", "state": "new delhi", "country": "india", "pin_code": "110077", "pickup_location": "HomeNew" } }' **Response** 

{ "status": 1, "payload": { "pickup_location_added": 1, "order_created": 1, "awb_generated": 0, "pickup_generated": 0, "shipment_id": "SHIXRE1ER7BQI", "order_id": "ORDBJSDAMG9YN", "assigned_date_time": { "date": "2026-01-20T16:59:16.669+05:30", "timezone_type": 3, "timezone": "Asia/Kolkata" }, "applied_weight": null, "cod": 1, "label_url": null, "manifest_url": null, "routing_code": null, "rto_routing_code": null, "pickup_token_number": null } 

} 

_Note:_ At this stage, the order and shipment are created, but no courier is assigned and no AWB is generated. 

### **b) Create Shipment (Assign Courier)** 

Use the shipment_id received in the previous step to assign a courier and create the shipment. 

### **Sample Request Curl** 

curl --location 

'https://shazam.stagingvelocity.in/custom/api/v1/forward-order-shipment' \ --header 'Authorization: RJShHQFn_YuXsMzfZb9-1A' \ 

--header 'Content-Type: application/json' \ 

--data '{ "shipment_id":"SHIXRE1ER7BQI", "carrier_id":"" 

}' 

### **Response** 

{ "status": 1, "payload": { "pickup_location_added": 1, "order_created": 1, "awb_generated": 1, "label_generated": 1, "pickup_generated": 1, "manifest_generated": 0, "pickup_scheduled_date": null, "pickup_booked_date": null, "order_id": "ORDKDKHOFL07I", "shipment_id": "SHIHB0BMT4DYM", "awb_code": "34812010700125", "courier_company_id": "CARO0ZZQH1H6U", "courier_name": "Delhivery Standard", "assigned_date_time": { 

"date": "2025-09-30T17:50:50.424+05:30", "timezone_type": 3, "timezone": "Asia/Kolkata" }, "applied_weight": 0.5, "cod": 1, "label_url": 

"https://velocity-shazam-prod.s3.ap-south-1.amazonaws.com/n9u98s8nodhjgqhn l4fh852tvqo5?response-content-disposition=inline%3B%20filename%3D%22348 12010700125_shipping_label.pdf%22%3B%20filename%2A%3DUTF-8%27%27 34812010700125_shipping_label.pdf&response-content-type=application%2Fpdf &X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAU4T4YDSM MKHXEIKS%2F20250930%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Dat e=20250930T122050Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-A mz-Signature=9f1e2e859fa917841c1b74ff2822d28cda2661b64be6c0191daf639 0e4647ca2", 

"manifest_url": null, "routing_code": null, "rto_routing_code": null, "pickup_token_number": null, "charges": { "frwd_charges": { "shipping_charges": "44.40", "cod_charges": "31.30", "dead_weight_billing": true }, "rto_charges": { "rto_charges": "40.00" } } } } 

## **5. Reverse Pickup Shipment - Create Order** 

**Purpose** 

Creates and manifests a reverse (return) pickup shipment i.e. creates a reverse pickup order and also assigns a courier. 

### **Method** : POST 

**Endpoint:** <u>/custom/api/v1/reverse-order-orchestration</u> 

### **<u>Reverse Shipment - Field-Level Table</u>** 

### **i) Order, Channel & Carrier** 

|**Field**|**Type**|**Require**<br>**d**|**Description**|**Example**|
|---|---|---|---|---|
|order_id|string|Yes|Unique per return|ORDER-49|
|order_date|string|Yes|YYYY-MM-DD HH:mm|2018-05-08 12:23|
|carrier_id|string|Optional|carrier_id is fetched from the<br>Serviceability API; leave it<br>blank for automatic courier<br>assignment based on<br>configured shipping rules, or<br>pass a specific carrier_id to<br>assign a particular courier.|CARO0ZZQH1H6U|



### **ii) Pickup Address (Customer)** 

|**Field**|**Type**|**Required**|**Description**|**Example**|
|---|---|---|---|---|
|pickup_customer_nam<br>e|string|Yes|First name|Saurabh|
|pickup_last_name|string|Optional|Last name|Jindal|
|company_name|string|Optional|Company name|iorn pvt ltd|
|pickup_address|string|Yes|Address line 1|Incubex, Velocity|
|pickup_address_2|string|Optional|Address line 2||
|pickup_city|string|Yes|City|Bangalore|
|pickup_state|string|Yes|State|Karnataka|
|pickup_country|string|Yes|Country|India|
|pickup_pincode|string|Yes|PIN code|560102|



|pickup_email|string|Optional|Email|saurabh+123891@velo<br>city.in|
|---|---|---|---|---|
|pickup_phone|string|Yes|Phone|8860697807|
|pickup_isd_code|string|Optional|Country code|91|



**iii) Shipping Address (Destination / Warehouse)** 

|**Field**|**Type**|**Required**|**Description**|**Example**|
|---|---|---|---|---|
|shipping_customer<br>_name|string|Yes|Name|Jax|
|shipping_last_name|string|Optional|Last name|Doe|
|shipping_address|string|Yes|Address line 1|Castle|
|shipping_address_<br>2|string|Optional|Address line 2|Bridge|
|shipping_city|string|Yes|City|Delhi|
|shipping_state|string|Yes|State|New Delhi|
|shipping_country|string|Yes|Country|India|
|shipping_pincode|string|Yes|PIN|110015|
|shipping_email|string|Optional|Email|abhishek123@velo<br>city.in|
|shipping_isd_code|string|Optional|Country code|91|
|shipping_phone|string|Yes|Phone|8888888888|



### **Iv) Items & Payment** 

|**Field**|**Type**|**Require**<br>**d**|**Description**|**Example**||
|---|---|---|---|---|---|
|order_items[]|array|Yes|List of items|See JSON||
|payment_method|enum|Yes|Usually<br>PREPAID for<br>returns|PREPAID||
|total_discount|number/s<br>tring|Optional|Discount total||0|
|sub_total|number|Yes|Item value||400|



### **v) Dimensions & Warehouse** 

|**Field**|**Type**|**Require**<br>**d**|**Description**|**Example**||
|---|---|---|---|---|---|
|length|number|Yes|cm||3|
|breadth|number|Yes|cm||1|
|height|number|Yes|cm||1|
|weight|number|Yes|kg||0.3|
|warehouse_id|string|Yes|Destination<br>warehouse id as<br>per Velocity<br>Shipping Portal|WHYYB5||
|request_pickup|boolean|Optional|Auto pickup<br>scheduling|TRUE||



### **<u>Manifesting a QC shipment</u>** 

### **A) Mandatory Parameters for QC Shipments** 

For manifesting a QC shipment, following parameters must be passed i.e name, product name and qc_enable = ‘true’ and qc_product image. 

### **B) Prerequisites for Enabling QC** 

To successfully manifest QC shipments, the following configurations must be completed on Velocity Shipping’s end: 

### ○ **Enable Return QC in Velocity Shipping:** 

Navigate to Settings → Return Quality Check to enable QC and select the parameters to be checked. 

### ○ **Check Courier-level QC Guidelines:** 

Ensure selected QC parameters comply with courier guidelines.Also,  It is important that the count of SKUs in a single return order is not more than 2 and no. of QC parameters for evaluation <=6. If sku count is > 2, it will be manifested as non QC. 

### ○ **Enable QC at SKU Level:** 

For each SKU requiring QC, the seller must enable QC and provide all required details applicable for parameters for which he wants to do QC such as image, brand, color, size, etc. Also please note - Product image is a mandatory field for successful QC manifestation. 

(For eg. if we want to qc check on color then color information needs to be captured at SKU level against the SKU In Return Quality Check> QC parameters>Sku> Edit details> Color) 

Once all configurations are complete, QC shipments can be manifested via API. 

### **C) Courier Coverage for Return QC** 

Currently, Return QC is supported only for Delhivery and Shadowfax. While courier allocation ensures that a QC shipment is assigned to a QC enabled shipment but in case of non serviceability or non availability of QC enabled couriers on a route, it can be routed via regular courier and it will automatically be treated as a Non-QC shipment. 

### **Sample Request Curl** 

curl --location 'https://shazam.velocity.in/custom/api/v1/reverse-order-orchestration' \ 

--header 'Content-Type: application/json' \ 

--header 'Authorization: oEKN6oibwqhFWhSnBDBJUQ' \ 

--data-raw '{ 

"order_id": "RET-12345157", "order_date": "2022-02-16", "carrier_id": "CARO0ZZQH1H6U", "pickup_customer_name": "Saurabh", "pickup_last_name": "Jindal", "company_name": "iorn pvt ltd", "pickup_address": "Incubex, Velocity", "pickup_address_2": "", "pickup_city": "Bangalore", "pickup_state": "Karnataka", "pickup_country": "India", "pickup_pincode": "560102", "pickup_email": "saurabh+123891@velocity.in", "pickup_phone": "8860697807", 

"pickup_isd_code": "91", "shipping_customer_name": "Jax", "shipping_last_name": "Doe", "shipping_address": "Castle", "shipping_address_2": "Bridge", "shipping_city": "Delhi", "shipping_country": "India", "shipping_pincode": 110015, "shipping_state": "New Delhi", "shipping_email": "kumar.abhishek123@velocity.in", "shipping_isd_code": "91", "shipping_phone": 8888888888, "warehouse_id": "WHO89A", "order_items": [{"name": "shoes","qc_enable": true,"qc_product_name": "shoes","sku": "WSH234","units": 1,"selling_price": 100,"discount": 0,"qc_brand": "Levi","qc_product_image": "https://example.com/image.jpg"}], "payment_method": "PREPAID", "total_discount": "0", "sub_total": 400, "length": 3, "breadth": 1, "height": 1, "weight": 0.3, "request_pickup": true }' 

### **Response** 

{ "status": 1, "payload": { "order_created": 1, "awb_generated": 1, "pickup_generated": 1, "pickup_scheduled_date": null, "order_id": "ORDMUJCVLS7CB", "shipment_id": "SHIUEOB5S6CS5", "awb_code": "VEHR4336705675", "courier_company_id": "CARCVBWTPRH08", "courier_name": "Ekart Standard", 

"assigned_date_time": { "date": "2025-10-03T15:39:11.189+05:30", "timezone_type": 3, "timezone": "Asia/Kolkata" }, "applied_weight": 0.34, "cod": 0, "is_return": 1, "routing_code": null, "rto_routing_code": null, "pickup_token_number": null, "charges": { "reverse_charges": "91.30", "qc": "0.00", "qc_leeway": "0.00", "dead_weight_billing": false } } } 

### **<u>Create Reverse Pickup Order and Shipment Separately</u>** 

Velocity Shipping allows you to create a reverse pickup order without assigning a courier and assign the courier later by creating the shipment in a separate step. This is useful when courier selection needs to be deferred or handled through shipping rules. 

### **a) Create Reverse Pickup Order Only** 

### **Sample Request Curl** 

curl --location 'https://shazam.stagingvelocity.in/custom/api/v1/reverse-order' \ --header 'Authorization: RJShHQFn_YuXsMzfZb9-1A' \ --header 'Content-Type: application/json' \ --data-raw '{ "order_id": "rj-ddf21", "order_date": "2022-02-16", "channel_id": "2113680", "pickup_customer_name": "Saurabh", "pickup_last_name": "Jindal", 

"company_name": "iorn pvt ltd", "pickup_address": "Incubex, Velocity", "pickup_address_2": "", "pickup_city": "Bangalore", "pickup_state": "Karnataka", "pickup_country": "India", "pickup_pincode": "560068", "pickup_email": "saurabh+123891@velocity.in", "pickup_phone": "8860697807", "pickup_isd_code": "91", "shipping_customer_name": "Jax", "shipping_last_name": "Doe", "shipping_address": "Castle", "shipping_address_2": "Bridge", "shipping_city": "Delhi", "shipping_country": "India", "shipping_pincode": "560068", "shipping_state": "New Delhi", "shipping_email": "kumar.abhishek@shiprocket.com", "shipping_isd_code": "91", "shipping_phone": "8888888888", "warehouse_id": "WHFYPF", "order_items": [ { "name": "shoes", "qc_enable": true, "qc_product_name": "shoes", "sku": "WSH234", "units": 1, "selling_price": 100, "discount": 0, "qc_brand": "Levi", "qc_product_image": "https://assets.vogue.in/photos/5d7224d50ce95e0008696c55/2:3/w_2240,c_limit/ Joker.jpg" } ], "payment_method": "PREPAID", "total_discount": "0", "sub_total": 400, 

"length": 3, "breadth": 1, "height": 1, "weight": 0.3, "request_pickup": true }' 

### **Response** 

{"status":1,"payload":{"order_created":1,"awb_generated":0,"pickup_generated":0 ,"pickup_scheduled_date":null,"order_id":"ORDGMSLAUDVBF","return_id":"RET VTLUPWTWIK","assigned_date_time":{"date":"2026-01-20T17:01:40.864+05:30" ,"timezone_type":3,"timezone":"Asia/Kolkata"},"cod":0}} 

### **b) Create Reverse Shipment (Assign Courier)** 

Use the  return_id received in the previous step to assign a courier and create the shipment. 

### **Sample Request Curl** 

curl --location 

'https://shazam.stagingvelocity.in/custom/api/v1/reverse-order-shipment' \ 

--header 'Authorization: bN9m81J0bQWEfPhK4xDu1g' \ 

--header 'Content-Type: application/json' \ 

--data '{ "return_id": "RETYHL9924N5B", "warehouse_id": "WHYYB5", "carrier_id":"" //optional }' 

### **Response:** 

{ 

"status": 1, 

"payload": { 

"order_created": 0, 

"awb_generated": 1, "pickup_generated": 1, "pickup_scheduled_date": **null** , 

"order_id": **null** , "shipment_id": "SHILAVYR2A4YI", "awb_code": "R773426643VEL", "courier_company_id": "", "courier_name": "Shadowfax ROAD", "assigned_date_time": { "date": "2026-01-20T17:03:25.550+05:30", "timezone_type": 3, "timezone": "Asia/Kolkata" }, "applied_weight": 0.0006, "cod": 0, "is_return": 1, "routing_code": **null** , "rto_routing_code": **null** , "pickup_token_number": **null** , "charges": { "reverse_charges": "28.00", "qc": "0.00", "qc_leeway": "0.00", "dead_weight_billing": **false** , "platform_fee": 0.0 } } } 

## **6. Cancel Order** 

### **Purpose** 

Cancels one or more shipments that are not yet picked up. 

### **Method** : POST 

### **Endpoint:** <u>/custom/api/v1/cancel-order</u> 

### **Request Fields** 

|**Field**|**Type**|**Require**<br>**d**|**Description**|**Example**|
|---|---|---|---|---|
|awbs[]|array|Yes|List of AWBs to cancel<br>(Max 50)|["84161310011340"]|



### **Sample Request Curl** 

curl --location '/custom/api/v1/cancel-order' \ --header 'Content-Type: application/json' \ 

--header 'Authorization: bbqRkOXw0xWLuYj9ubnDwg' \ 

--data '{ "awbs": ["39879810176282"] }' 

### **Response** 

{ 

"message": "Bulk Shipment cancellation is in progress. Please wait for some time." } 

## **7. Order Tracking** 

### **Purpose** 

Fetches real-time tracking details for one or more shipments. 

**Method** : POST 

- **Endpoint:** <u>/custom/api/v1/order tracking</u> 

**Request Fields** 

|**Field**|**Type**|**Require**<br>**d**|**Description**|**Example**|
|---|---|---|---|---|
|awbs[]|array|Yes|List of AWBs to track|["84161310011340"]|



### **Sample Request Curl** 

curl --location '/custom/api/v1/order-tracking' \ --header 'Content-Type: application/json' \ 

--header 'Authorization: bbqRkOXw0xWLuYj9ubnDwg' \ --data '{ "awbs": ["PD6786164"] **}'** 

### **Response** 

{ "result": { "PD6786164": { "tracking_data": { "track_status": null, "shipment_status": "delivered", "shipment_track": [ { "id": "8be85889-7f3d-4d68-81aa-14ab5d40ada9", "awb_code": "PD6786164", "courier_company_id": "CARKX7WW6UNS8", "shipment_id": "SHIRDNEL4I8PC", "order_id": "ORDVRLXCBRT4E", "pickup_date": "2025-07-30 16:20:31", "delivered_date": "2025-07-30 17:39:29", "weight": 0.3, "packages": 1, "current_status": "delivered", "delivered_to": "Bengaluru", "destination": "Bengaluru", "consignee_name": "Arun nayak ", "origin": "Bangalore", "courier_agent_details": null 

} ], "shipment_track_activities": [ { "date": "2025-07-30 17:39:29", "activity": "DELIVERED", "location": "Bengaluru" }, { "date": "2025-07-30 17:38:18", "activity": "OUT FOR DELIVERY", "location": "Bengaluru" }, { "date": "2025-07-30 16:20:31", "activity": "PICKED UP", "location": "Bengaluru" }, { "date": "2025-07-30 16:20:30", "activity": "OUT FOR PICKUP", "location": "Bengaluru" } ], "track_url": "https://shipfastt.in/track/PD6786164" } } } } "count": 0, "sum_of_prepaid_orders": 0.0, "sum_of_cod_orders": 0.0 }, "total_shipments": 0 } } } 

## **8. Summary Report API** 

### **Purpose** 

Fetches status based summary report for forward and return/reverse pickup orders. 

### **Method** : POST 

**Endpoint:** /custom/api/v1/reports **Request Fields** 

|**Field**|**Type**|**Require**<br>**d**|**Description**|**Example**|
|---|---|---|---|---|
|start_date_<br>time|string|Yes|Start date & time based<br>on order creation date|2022-01-01T00:00:00Z|
|end_date_t<br>ime|string|Yes|End date & time based on<br>order creation date|2025-09-08T20:00:00Z|
|shipment_t<br>ype|string|Yes|Shipment journey -<br>Forward or reverse pickup|<br>forward<br>return|



### **Sample Request Curl** 

curl --location 'https://shazam.stagingvelocity.in/custom/api/v1/reports' \ --header 'Authorization: RJShHQFn_YuXsMzfZb9-1A' \ 

--header 'Content-Type: application/json' \ --data '{ "start_date_time":"2022-01-01T00:00:00Z", "end_date_time":"2025-09-08T20:00:00Z", "shipment_type": "return" }' 

### **Response:** 

{ 

"status": "SUCCESS", 

"payload": { "date_range": { "start_date_time": "2022-01-01T00:00:00Z", "end_date_time": "2025-09-08T20:00:00Z" }, "shipment_type": "return", "summary": { "return_pickup_scheduled": { "count": 0, "sum_of_prepaid_orders": 0.0, "sum_of_cod_orders": 0.0 }, "return_in_transit": { "count": 0, "sum_of_prepaid_orders": 0.0, "sum_of_cod_orders": 0.0 }, "return_delivered": { "count": 0, "sum_of_prepaid_orders": 0.0, "sum_of_cod_orders": 0.0 }, "cancelled": { "count": 0, "sum_of_prepaid_orders": 0.0, "sum_of_cod_orders": 0.0 } **}** 

