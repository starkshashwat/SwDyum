Bottom-centered confirmation toast — "Added to cart", "Coupon applied".

```jsx
<Toast visible={showToast} message="Added to cart!" icon={<CheckIcon />} />
```

Caller controls the show/hide timer (e.g. `setTimeout(() => setVisible(false), 2000)`).
