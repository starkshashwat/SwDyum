Pill text field on a cream fill — newsletter email, coupon code, delivery pincode checker.

```jsx
<Input placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)}
  rightSlot={<IconButton label="Subscribe"><ArrowIcon /></IconButton>} />
<Input prefix="🇮🇳 +91" placeholder="Enter mobile number" />
```

Border turns primary-green on focus. Pair with a trailing `IconButton` for submit-style inputs.
