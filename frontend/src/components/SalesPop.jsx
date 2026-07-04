import React, { useState, useEffect } from 'react';
import './SalesPop.css';
import { fetchProducts } from './data/products';

const names = ["Siddharth", "Priya", "Rahul", "Aarohi", "Vikram", "Sneha", "Karan", "Anjali"];
const locations = ["Patna", "Delhi", "Mumbai", "Bangalore", "Gaya", "Pune", "Lucknow", "Jaipur"];

function SalesPop() {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState(null);
  const [productsData, setProductsData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchProducts();
      setProductsData(data);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (productsData.length === 0) return;

    const showPopup = () => {
      const name = names[Math.floor(Math.random() * names.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const product = productsData[Math.floor(Math.random() * productsData.length)];
      const timeAgo = Math.floor(Math.random() * 59) + 1; // 1 to 59 minutes

      setData({ name, location, product, timeAgo });
      setVisible(true);

      setTimeout(() => {
        setVisible(false);
      }, 5000); // hide after 5 seconds
    };

    // Initial delay before showing the first popup
    const initialTimer = setTimeout(showPopup, 3000);

    // Then show a popup every 15 to 25 seconds
    const interval = setInterval(() => {
      showPopup();
    }, Math.floor(Math.random() * 10000) + 15000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [productsData]);

  if (!visible || !data) return null;

  return (
    <div className="sales-pop-container">
      <div className="sales-pop-img">
        <img src={data.product.image} alt={data.product.name} />
      </div>
      <div className="sales-pop-content">
        <p className="sales-pop-buyer"><strong>{data.name}</strong> from {data.location}</p>
        <p className="sales-pop-action">Purchased <strong>{data.product.name}</strong></p>
        <p className="sales-pop-time">{data.timeAgo} minutes ago</p>
      </div>
      <button className="sales-pop-close" onClick={() => setVisible(false)}>&times;</button>
    </div>
  );
}

export default SalesPop;
