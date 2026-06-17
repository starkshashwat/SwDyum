import React from 'react';
import './ProductsSection.css';

function ProductsSection() {
  const products = [
    {
      id: 1,
      name: 'Signature Mango Pickle',
      price: '₹250.00',
      oldPrice: '₹300.00',
      rating: 5,
      image: '/prod_mango.png'
    },
    {
      id: 2,
      name: 'Stuffed Red Chili',
      price: '₹350.00',
      rating: 5,
      image: '/prod_chili.png'
    },
    {
      id: 3,
      name: 'Authentic Garlic Pickle',
      price: '₹280.00',
      rating: 4,
      image: '/prod_garlic.png'
    },
    {
      id: 4,
      name: 'Sweet & Sour Lemon',
      price: '₹220.00',
      rating: 5,
      image: '/prod_lemon.png'
    }
  ];

  return (
    <section className="products-section">
      <div className="products-header">
        <span className="section-subtitle">~ Our Best Sellers ~</span>
        <h2 className="section-headline">Authentic, sun-dried, and<br/>packed with flavor.</h2>
      </div>

      <div className="carousel-container">
        <button className="carousel-btn prev-btn">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>

        <div className="products-grid">
          {products.map((product) => (
            <div className="product-card" key={product.id}>
              <div className="product-image-container">
                <img src={product.image} alt={product.name} className="product-img" />
              </div>
              <h3 className="product-title">{product.name}</h3>
              <div className="product-price">
                <span className="current-price">{product.price}</span>
                {product.oldPrice && <span className="old-price">{product.oldPrice}</span>}
              </div>
              <div className="product-rating">
                {[...Array(5)].map((_, index) => (
                  <span key={index} className={`star ${index < product.rating ? 'filled' : 'empty'}`}>
                    ★
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button className="carousel-btn next-btn">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
    </section>
  );
}

export default ProductsSection;
