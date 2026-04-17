import React from 'react';

const Purchase = () => {
  // Hardcode specific test card
  const testCard = {
    number: '4111111111111111', // Example Visa test card
    expiry: '12/25',
    cvv: '123'
  };

  return (
    <div>
      <h1>Purchase</h1>
      <p>Enter payment details (Test only)</p>
      <form>
        <input type="text" placeholder="Card Number" value={testCard.number} readOnly />
        <input type="text" placeholder="Expiry" value={testCard.expiry} readOnly />
        <input type="text" placeholder="CVV" value={testCard.cvv} readOnly />
        <button type="submit">Complete Purchase</button>
      </form>
    </div>
  );
};

export default Purchase;