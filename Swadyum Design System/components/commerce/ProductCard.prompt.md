Product tile for the Home "bestsellers" bento grid and the Shop page grid.

```jsx
<ProductCard product={mangoPickle} onOpen={() => nav('product-mango')} onAddToCart={addToCart} />
<ProductCard product={comboBox} featured onOpen={openCombo} onAddToCart={addToCart} />
```

`featured` makes the image well taller (320px) for a hero-style first card spanning the grid. Lifts 6px + shows a green-tinted shadow on hover; image zooms slightly.
