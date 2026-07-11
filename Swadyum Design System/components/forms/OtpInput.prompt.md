Six individual digit boxes with auto-advance focus — used on step 2 of the WhatsApp login modal.

```jsx
<OtpInput value={otp} onChange={setOtp} length={6} />
```

Auto-focuses the next box on entry and the previous box on Backspace, matching the source's auto-focus behavior.
