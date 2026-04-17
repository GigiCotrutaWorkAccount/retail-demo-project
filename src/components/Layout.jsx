import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/checkout">Checkout</Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <p>Retail Demo Footer</p>
      </footer>
    </div>
  );
};

export default Layout;