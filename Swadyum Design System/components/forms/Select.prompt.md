Bordered dropdown for sort/filter — shop toolbar "Recommended / Price / Top Rated".

```jsx
<Select value={sortBy} onChange={e => setSortBy(e.target.value)}
  options={[{ key: 'default', label: 'Recommended' }, { key: 'price-low', label: 'Price: Low → High' }]} />
```
