import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Fetch products from Supabase or mock data
    const mockProducts = [
      { id: 1, name: 'Shoe 1', price: 100, image: 'shoe1.jpg' },
      { id: 2, name: 'Shoe 2', price: 120, image: 'shoe2.jpg' },
      // Add more
    ];
    setProducts(mockProducts);
  }, []);

  return (
    <div>
      <h1>Products</h1>
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
            <h2>{product.name}</h2>
            <p>${product.price}</p>
            <Link to={`/product/${product.id}`}>View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;