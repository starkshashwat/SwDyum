Circular 44×44 tap target for a single icon action — header (account/cart), footer socials.

```jsx
<IconButton label="Cart" onClick={openCart}><CartIcon /></IconButton>
<IconButton label="Instagram" filled><InstagramIcon /></IconButton>
```

`filled` gives the circular cream-background treatment used for footer social icons (fills solid green on hover). Without `filled`, it's the flat header-action treatment (soft green wash on hover). `active` tints the icon green to mark the current page/section.
