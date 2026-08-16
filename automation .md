# Build Swadyum V1 Customer Automation Engine in Admin Panel

## Objective

Add a **Customer Automation / Communication Automation system** inside the existing Swadyum admin panel.

The goal is to build a **lean V1 automation engine for Swadyum e-commerce**, inspired by the core workflow concept of GoHighLevel, but **do NOT build a full GoHighLevel clone**.

The system should allow the Swadyum admin to create automated customer journeys using:

**Trigger → Conditions → Wait → Action → Conditions → Action → End**

The system must support both:

* **Email**
* **WhatsApp**

The automation engine should be provider-independent so that email/WhatsApp providers can be changed later without rebuilding the automation engine.

---

# 1. IMPORTANT DEVELOPMENT RULES

Before modifying anything:

1. Inspect the existing Swadyum codebase.
2. Identify:

   * Existing admin panel
   * Authentication
   * Supabase setup
   * Customer tables
   * Orders tables
   * Order items
   * Products
   * Cart
   * Payment system
   * Razorpay integration
   * Shipping integration
   * Existing email functionality
   * Existing WhatsApp functionality
   * Existing notification/template systems
3. Reuse existing database tables and services wherever possible.
4. Do NOT duplicate existing functionality.
5. Do NOT break existing order, payment, checkout, inventory or customer functionality.
6. Follow the existing Swadyum UI design system.
7. Do not introduce unnecessary dependencies.
8. Do not over-engineer V1.
9. Keep the architecture extensible for future automation features.
10. Never expose API keys, provider secrets or service-role credentials to the frontend.

---

# 2. ADMIN PANEL LOCATION

Add a new section:

**Admin Panel → Marketing → Automations**

Suggested structure:

```text
Marketing
├── Automations
├── Email Templates
├── WhatsApp Templates
└── Communication Logs
```

If some of these already exist, integrate with them rather than creating duplicates.

---

# 3. AUTOMATION DASHBOARD

Create:

**Marketing → Automations**

The dashboard should show all automations.

Each automation card/table row should display:

* Automation name
* Trigger
* Channels used
* Status
* Total enrolled
* Currently running
* Completed
* Failed
* Created date
* Last activity
* Actions

Statuses:

```text
Draft
Active
Paused
Archived
```

Actions:

```text
Edit
Duplicate
Pause
Activate
Archive
View Runs
```

Add:

**+ Create Automation**

---

# 4. V1 AUTOMATION TRIGGERS

Only implement these 8 triggers.

Do NOT add unnecessary behavioral triggers in V1.

## Trigger 1 — Customer Registered

Event:

```text
customer_registered
```

Use cases:

* Welcome email
* Welcome WhatsApp

Available data:

```text
customer_name
customer_email
customer_phone
customer_id
registration_date
```

---

## Trigger 2 — Order Placed

Event:

```text
order_placed
```

Use cases:

* Order confirmation
* Order received notification

Available data:

```text
customer_name
customer_email
customer_phone
customer_id
order_id
order_number
order_value
currency
payment_method
products
quantity
shipping_address
billing_address
coupon
discount
```

Important:

The automation should NOT assume payment is successful simply because an order was created.

Payment status must be available as order data.

---

# 5. Trigger 3 — Payment Failed

Event:

```text
payment_failed
```

Use cases:

* Payment failure email
* WhatsApp payment retry message

Available data:

```text
customer
order_id
order_number
amount
payment_method
failure_reason
payment_retry_url
```

---

# 6. Trigger 4 — Cart Abandoned

Event:

```text
cart_abandoned
```

This is an important V1 revenue-recovery automation.

An abandoned cart should NOT trigger immediately.

The system should identify:

```text
Customer has cart
+
Customer has not completed checkout/order
+
Configured abandonment delay has passed
```

Default:

```text
1 hour
```

Workflow example:

```text
Cart Abandoned
      ↓
Wait 1 hour
      ↓
Send Email
      ↓
Wait 12 hours
      ↓
Check if order completed
      ↓
YES → End
NO  → Send WhatsApp
      ↓
End
```

Available data:

```text
customer_id
customer_name
email
phone
cart_id
cart_value
cart_items
product_name
product_image
product_price
quantity
cart_url
```

Critical rule:

Before every abandoned-cart message, verify that the customer has NOT completed the purchase.

If purchase completed:

```text
Stop automation
Mark run as completed/stopped_by_condition
Do not send further messages
```

---

# 7. Trigger 5 — Order Shipped

Event:

```text
order_shipped
```

Use cases:

* Shipment confirmation
* Tracking information

Available data:

```text
customer
order_id
order_number
products
courier_name
tracking_number
tracking_url
shipping_date
estimated_delivery_date
```

---

# 8. Trigger 6 — Out for Delivery

Event:

```text
out_for_delivery
```

Use cases:

* Delivery notification

Available data:

```text
customer
order
tracking_number
tracking_url
delivery_address
estimated_delivery_time
```

---

# 9. Trigger 7 — Order Delivered

Event:

```text
order_delivered
```

Use cases:

* Delivery confirmation
* Review request
* Basic post-purchase communication

Example:

```text
Order Delivered
      ↓
Wait 3 days
      ↓
Send WhatsApp
      ↓
Wait 2 days
      ↓
Send Email
      ↓
End
```

Available data:

```text
customer
order
products
delivery_date
review_url
```

The review workflow should be configurable.

---

# 10. Trigger 8 — Order Cancelled / Refund

Support:

```text
order_cancelled
refund_initiated
refund_completed
```

These can be represented either as separate trigger events internally or grouped under a UI category:

**Order Cancelled / Refund**

Use cases:

* Cancellation confirmation
* Refund initiated notification
* Refund completed notification

Available data:

```text
customer
order
refund_amount
refund_id
refund_reason
refund_status
```

---

# 11. V1 CONDITIONS

Do NOT create a complicated rules engine in V1.

Support these conditions only:

## Customer Type

```text
First-time Customer
Returning Customer
```

## Order Value

Operators:

```text
>
<
=
>=
<=
```

Example:

```text
Order Value > ₹999
```

## Product

Condition:

```text
Order contains Product
```

## Category

Condition:

```text
Order contains Category
```

## Payment Method

Values:

```text
COD
UPI
Card
Net Banking
Other
```

## Purchase Status

```text
Order Completed?
Yes
No
```

This condition is especially important for abandoned-cart workflows.

---

# 12. CONDITION LOGIC

V1 should support:

```text
AND
```

Example:

```text
Customer Type = Returning
AND
Order Value > ₹999
```

Do NOT build complex nested AND/OR/NOT logic in the first version unless it is extremely easy to implement without creating unnecessary complexity.

Architecture should allow adding:

```text
OR
NOT
Nested Groups
```

later.

---

# 13. V1 ACTIONS

Only implement these actions.

## Action 1 — Send Email

Parameters:

```text
Email Template
Recipient
Subject
```

Recipient should normally be the customer associated with the automation.

Support dynamic variables.

---

## Action 2 — Send WhatsApp

Parameters:

```text
WhatsApp Template
Recipient Phone
```

Use approved WhatsApp templates where required by the WhatsApp provider/API.

Do not attempt to bypass WhatsApp template/policy requirements.

---

## Action 3 — Wait

Support:

```text
Minutes
Hours
Days
```

Examples:

```text
30 minutes
1 hour
12 hours
3 days
7 days
```

Never hold a request open while waiting.

The system must create a scheduled automation job.

Example:

```text
next_execution_at = timestamp
status = waiting
```

---

## Action 4 — Add Customer Tag

Example:

```text
Add tag:
abandoned-cart
```

Tags should be reusable.

---

## Action 5 — Generate Coupon

Allow:

```text
Coupon type
Discount percentage
Discount fixed amount
Expiry
Usage limit
Minimum order value
```

Do NOT automatically generate a coupon unless this action is explicitly included in the workflow.

---

## Action 6 — Send Coupon

Can be combined with Email or WhatsApp personalization.

Example variables:

```text
{{coupon_code}}
{{discount}}
{{coupon_expiry}}
```

---

## Action 7 — End Automation

Stops the current automation run.

---

# 14. AUTOMATION BUILDER

Build a clean **vertical workflow builder** rather than an extremely complicated drag-and-drop canvas.

Example:

```text
CREATE AUTOMATION

Name:
[ Post Purchase Review ]

Trigger:
[ Order Delivered ]

        ↓

STEP 1
[ Wait ]
[ 3 Days ]

        ↓

STEP 2
[ Send WhatsApp ]
Template:
[ Review Request ]

        ↓

STEP 3
[ Wait ]
[ 2 Days ]

        ↓

STEP 4
[ Send Email ]
Template:
[ Review Request Email ]

        ↓

STEP 5
[ End ]

[ + Add Step ]

[ Save Draft ] [ Activate ]
```

Each step should be editable, removable and reorderable where logically possible.

---

# 15. STEP TYPES

The Add Step menu should contain:

```text
+ Send Email
+ Send WhatsApp
+ Wait
+ Condition
+ Add Customer Tag
+ Generate Coupon
+ Send Coupon
+ End Automation
```

The Condition step should allow selecting one of the V1 conditions.

---

# 16. AUTOMATION TEMPLATES

Provide prebuilt templates so the admin doesn't need to create everything manually.

Create these default automation templates:

## Template 1 — Welcome Customer

```text
Trigger:
Customer Registered

Action:
Send Email

Action:
Send WhatsApp

End
```

---

## Template 2 — Order Confirmation

```text
Trigger:
Order Placed

Action:
Send Email

Action:
Send WhatsApp

End
```

---

## Template 3 — Payment Failed

```text
Trigger:
Payment Failed

Action:
Send Email

Action:
Send WhatsApp

End
```

---

## Template 4 — Abandoned Cart Recovery

```text
Trigger:
Cart Abandoned

Wait:
1 hour

Send Email

Wait:
12 hours

Condition:
Order Completed?

YES:
End

NO:
Send WhatsApp

End
```

---

## Template 5 — Order Shipped

```text
Trigger:
Order Shipped

Send Email

Send WhatsApp

End
```

---

## Template 6 — Out for Delivery

```text
Trigger:
Out for Delivery

Send WhatsApp

Send Email

End
```

---

## Template 7 — Order Delivered

```text
Trigger:
Order Delivered

Wait:
3 days

Send WhatsApp

Wait:
2 days

Send Email

End
```

---

## Template 8 — Cancellation / Refund

```text
Trigger:
Order Cancelled / Refund

Send Email

Send WhatsApp

End
```

---

# 17. EMAIL TEMPLATE SYSTEM

Inside:

**Marketing → Email Templates**

Allow admin to create/edit templates.

Template fields:

```text
Template Name
Subject
Preheader
Email Body
Status
```

Support dynamic variables:

```text
{{customer_name}}
{{order_number}}
{{order_value}}
{{product_name}}
{{quantity}}
{{tracking_number}}
{{tracking_url}}
{{estimated_delivery_date}}
{{coupon_code}}
{{coupon_expiry}}
{{review_url}}
{{support_email}}
{{brand_name}}
```

Create a variable selector in the template editor so the admin does not have to memorize variables.

Example:

```text
[ Insert Variable ▼ ]

Customer
Order
Product
Shipping
Coupon
Support
```

---

# 18. WHATSAPP TEMPLATE SYSTEM

Inside:

**Marketing → WhatsApp Templates**

Allow the admin to manage WhatsApp templates.

Show:

```text
Template Name
Template ID
Language
Category
Status
Provider
```

The system should respect WhatsApp Business/Meta template requirements.

Do not assume arbitrary free-form WhatsApp messages can always be sent.

---

# 19. COMMUNICATION PROVIDER ARCHITECTURE

Do NOT hard-code Brevo or a specific provider into the automation engine.

Create a provider abstraction.

Example:

```text
CommunicationService
│
├── EmailProvider
│   ├── Brevo
│   ├── Resend
│   └── SES
│
└── WhatsAppProvider
    ├── Meta Cloud API
    └── Other Provider
```

The automation engine should simply call:

```text
sendEmail()
sendWhatsApp()
```

The provider layer decides how to deliver it.

This is important because Swadyum may change providers later.

---

# 20. EVENT ENGINE

Create a centralized event system.

Example:

```text
trackEvent(
    eventName,
    customerId,
    data
)
```

Supported events:

```text
customer_registered
order_placed
payment_failed
cart_abandoned
order_shipped
out_for_delivery
order_delivered
order_cancelled
refund_initiated
refund_completed
```

Events must be generated from reliable backend sources wherever possible.

For example:

```text
Razorpay webhook
      ↓
Verify payment
      ↓
Update order
      ↓
Generate payment event
      ↓
Automation engine
```

Do NOT rely on frontend JavaScript to determine whether a payment succeeded.

Similarly:

```text
Shipping webhook/API
      ↓
Update order status
      ↓
Generate shipping event
      ↓
Automation engine
```

---

# 21. AUTOMATION RUN SYSTEM

Every customer entering an automation should create an automation run.

Example:

```text
automation_runs
```

Store:

```text
id
automation_id
customer_id
trigger_event
current_step
status
started_at
completed_at
next_execution_at
error_message
metadata
```

Statuses:

```text
running
waiting
completed
failed
cancelled
stopped_by_condition
```

---

# 22. AUTOMATION QUEUE

Do NOT execute delayed steps immediately.

Example:

```text
Order Delivered
      ↓
Automation Run
      ↓
Wait 3 Days
      ↓
Store:
next_execution_at = future timestamp
      ↓
Worker / Scheduled Function
      ↓
Execute when due
```

The system must survive:

* Server restarts
* Deployment
* API failures
* Temporary provider outages

A waiting automation must not disappear.

---

# 23. RETRY SYSTEM

Communication failures should automatically retry.

Example:

```text
Attempt 1 → Failed
     ↓
Wait
     ↓
Attempt 2
     ↓
Failed
     ↓
Attempt 3
     ↓
Failed
     ↓
Mark as failed
```

Use reasonable retry limits.

Do not create infinite retries.

Store the provider response/error for debugging.

---

# 24. COMMUNICATION LOGS

Add:

**Marketing → Communication Logs**

Each message should show:

```text
Customer
Channel
Email / WhatsApp
Automation
Template
Status
Sent At
Delivered At
Opened
Clicked
Provider Message ID
Error
```

Possible statuses:

```text
Queued
Sent
Delivered
Failed
Bounced
Read
Clicked
```

Only display statuses actually supported by the provider.

---

# 25. AUTOMATION RUN HISTORY

Inside each automation:

**View Runs**

Show:

```text
Customer
Started
Current Step
Status
Last Action
Next Action
Completed
```

Clicking a run should show a timeline:

```text
Order Delivered
      ↓
Trigger received
      ↓
Wait 3 days
      ↓
WhatsApp sent
      ↓
Wait 2 days
      ↓
Email sent
      ↓
Completed
```

This is important for debugging.

---

# 26. CUSTOMER PROFILE

If Swadyum already has a customer details page, add:

**Automation Activity**

Show:

```text
Active Automations
Completed Automations
Stopped Automations
Recent Messages
```

Example:

```text
Customer: Rahul

Automation Activity

Order Confirmation
✓ Completed

Abandoned Cart
✕ Stopped — Order Completed

Post Purchase Review
● Waiting — 2 days remaining
```

---

# 27. UNSUBSCRIBE / COMMUNICATION PREFERENCES

Add customer communication preferences.

At minimum:

```text
Email Marketing
Email Transactional
WhatsApp Marketing
WhatsApp Transactional
```

Transactional messages should be handled according to applicable laws and provider rules.

Marketing communications must respect opt-out/unsubscribe status.

Never send marketing communication to customers who have opted out.

---

# 28. AUTOMATION SAFETY RULES

Implement these protections.

### Duplicate event protection

If the same webhook/event is received multiple times, do not create duplicate automation runs.

Use an idempotency/event ID.

---

### Duplicate message protection

Prevent the same automation step from sending the same message multiple times due to retries or webhook duplication.

---

### Abandoned cart protection

Before sending an abandoned-cart message:

```text
Check:
Does an order exist for this cart/customer?
```

If yes:

```text
Stop automation.
```

---

### Cancelled order protection

If an automation is waiting and the order gets cancelled, the system should allow conditions to stop future actions where relevant.

---

# 29. ANALYTICS

Keep analytics simple in V1.

Automation dashboard:

```text
Total Runs
Completed
Failed
Currently Running
Messages Sent
```

For each automation:

```text
Enrolled
Completed
Stopped
Failed
Email Sent
WhatsApp Sent
```

Do not build advanced revenue attribution or AI analytics in V1.

---

# 30. DEFAULT SWADYUM AUTOMATIONS

After implementation, seed these as **Draft**, not automatically Active:

```text
Welcome Customer
Order Confirmation
Payment Failed
Abandoned Cart Recovery
Order Shipped
Out for Delivery
Order Delivered
Cancellation / Refund
```

The admin can review and activate each one.

---

# 31. UI/UX REQUIREMENTS

The interface should feel like the existing premium Swadyum admin panel.

Requirements:

* Clean
* Fast
* Minimal
* Responsive
* Desktop-first but mobile usable
* Clear hierarchy
* No unnecessary animations
* Clear status badges
* Clear error messages
* Confirmation before destructive actions
* Autosave draft where practical
* Prevent accidental loss of workflow changes

Do not create an overly complicated enterprise interface.

---

# 32. DATABASE DESIGN

Before creating new tables, inspect the existing schema.

Where necessary, create tables similar to:

```text
automations
automation_steps
automation_conditions
automation_runs
automation_events
automation_queue
email_templates
whatsapp_templates
message_logs
customer_tags
customer_tag_assignments
communication_preferences
```

Use foreign keys and indexes appropriately.

Important indexes should include fields such as:

```text
automation_id
customer_id
status
next_execution_at
event_id
created_at
```

Use JSON/JSONB only where flexible metadata is genuinely required.

Do not put the entire system into one JSON column.

---

# 33. SECURITY

Critical:

* Provider API keys must remain server-side.
* Supabase service-role key must never be exposed to the frontend.
* Automation creation/editing must require admin authorization.
* Customer data must not be publicly accessible.
* Email/WhatsApp templates must be sanitized appropriately.
* Validate all automation step data server-side.
* Validate webhook signatures where supported.
* Use idempotency for payment/shipping webhooks.
* Do not allow arbitrary server-side code execution through automation conditions/actions.

---

# 34. ERROR HANDLING

If an automation fails:

Show:

```text
Automation Failed

Customer:
Rahul

Step:
Send WhatsApp

Error:
Provider rejected template

[View Details]
[Retry]
```

The failure should not crash the entire automation engine.

If one communication action fails, define clearly whether the next step should:

```text
Continue
Retry
Stop
```

For V1, default to:

* Retry communication failures
* Stop only after retry limit
* Log the failure

---

# 35. IMPORTANT V1 LIMITATIONS

DO NOT build these now:

```text
Product viewed trigger
Category viewed trigger
Search trigger
Wishlist trigger
Page tracking
Video tracking
Lead scoring
Birthday automation
Advanced segmentation
A/B testing
Advanced OR/NOT condition builder
Nested logic groups
AI campaign generation
Revenue attribution
Complex visual canvas
SMS automation
Advanced analytics
Multi-tenant architecture
```

The architecture should allow these later, but they should NOT be part of V1.

---

# 36. V1 FINAL FEATURE LIST

The completed V1 should contain:

### Triggers

```text
✓ Customer Registered
✓ Order Placed
✓ Payment Failed
✓ Cart Abandoned
✓ Order Shipped
✓ Out for Delivery
✓ Order Delivered
✓ Order Cancelled / Refund
```

### Conditions

```text
✓ Customer Type
✓ Order Value
✓ Product
✓ Category
✓ Payment Method
✓ Order Completed
```

### Actions

```text
✓ Send Email
✓ Send WhatsApp
✓ Wait
✓ Add Customer Tag
✓ Generate Coupon
✓ Send Coupon
✓ End Automation
```

### Management

```text
✓ Create Automation
✓ Edit
✓ Duplicate
✓ Activate
✓ Pause
✓ Archive
✓ View Runs
✓ View Logs
✓ Templates
✓ Communication Logs
✓ Basic Analytics
```

---

# 37. ACCEPTANCE TESTS

Before considering the feature complete, test these scenarios.

### Test 1 — Order Confirmation

```text
Customer places successful order
→ event generated
→ automation triggered
→ email sent
→ WhatsApp sent
→ logs created
```

### Test 2 — Payment Failed

```text
Payment fails
→ payment_failed event
→ automation triggered
→ email sent
→ WhatsApp sent
```

### Test 3 — Abandoned Cart

```text
Customer adds item
→ leaves without purchase
→ cart becomes abandoned
→ automation starts
→ waits 1 hour
→ email sent
→ customer purchases
→ automation stops
→ WhatsApp must NOT be sent
```

### Test 4 — Shipping

```text
Shipping status changes to shipped
→ order_shipped event
→ email
→ WhatsApp
→ logs
```

### Test 5 — Delivery

```text
Order delivered
→ automation starts
→ waits 3 days
→ WhatsApp
→ waits 2 days
→ email
→ completed
```

### Test 6 — Duplicate webhook

```text
Same webhook received twice
→ only one automation run
→ only one message
```

### Test 7 — Provider failure

```text
Email provider fails
→ retry
→ retry limit reached
→ log failure
→ automation state remains consistent
```

### Test 8 — Admin pause

```text
Automation active
→ admin pauses it
→ new customers should not enter it
→ existing waiting runs should follow clearly defined pause behavior
```

---

# 38. DEVELOPMENT APPROACH

Do not just create the UI and fake the automation.

Implement the complete flow:

```text
Database
    ↓
Event generation
    ↓
Automation matching
    ↓
Automation run
    ↓
Step execution
    ↓
Queue / scheduling
    ↓
Email / WhatsApp provider
    ↓
Logs
    ↓
Admin dashboard
```

Every feature visible in the UI must have a functional backend implementation.

Do not use mock data in production paths.

---

# 39. FINAL GOAL

The final result should allow a Swadyum admin to open:

**Admin → Marketing → Automations**

and create something like:

```text
Abandoned Cart Recovery

TRIGGER
Cart Abandoned

↓
WAIT
1 Hour

↓
EMAIL
Abandoned Cart #1

↓
WAIT
12 Hours

↓
CONDITION
Order Completed?

YES → END

NO → WHATSAPP
Abandoned Cart #2

↓
END
```

And:

```text
Post Purchase

TRIGGER
Order Delivered

↓
WAIT
3 Days

↓
WHATSAPP
Review Request

↓
WAIT
2 Days

↓
EMAIL
Review Request

↓
END
```

The system should be **simple enough for a small Swadyum team to operate**, but the backend architecture should be clean enough to add more triggers, conditions, actions, channels and advanced automation capabilities later.

## DO NOT OVERBUILD V1.

Prioritize:

**Reliability > complexity**

**Working automation > fancy UI**

**Correct order/payment events > frontend tracking**

**Reusable architecture > provider lock-in**

**Simple admin experience > enterprise-level feature count**
