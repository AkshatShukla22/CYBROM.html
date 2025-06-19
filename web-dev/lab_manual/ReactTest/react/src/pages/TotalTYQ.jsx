import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TotalTYQ = () => {
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchAndCalculate = async () => {
      try {
        const res = await axios.get('http://localhost:3000/student');
        const data = res.data;

        let quantitySum = 0;
        let priceSum = 0;

        data.forEach(item => {
          quantitySum += Number(item.productQuantity);
          priceSum += Number(item.netPrice);
        });

        setTotalQuantity(quantitySum);
        setTotalPrice(priceSum);
      } catch (error) {
        console.error('Error fetching product data:', error);
        alert('Failed to load product data.');
      }
    };

    fetchAndCalculate();
  }, []);

  return (
    <>
      <h1>Total Summary</h1>
      <p><strong>Total Product Quantity:</strong> {totalQuantity}</p>
      <p><strong>Total Selling Price:</strong> ₹{totalPrice}</p>
    </>
  );
};

export default TotalTYQ;
