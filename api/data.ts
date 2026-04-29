export default function handler(req: any, res: any) {
  const categories = [
    {
      id: 'men',
      name: 'Men',
      subcategories: [
        { id: 'men-shirts', name: 'Shirts' },
        { id: 'men-pants', name: 'Pants' }
      ]
    },
    {
      id: 'women',
      name: 'Women',
      subcategories: [
        { id: 'women-handbags', name: 'Handbags' },
        { id: 'women-dresses', name: 'Dresses' }
      ]
    },
    {
      id: 'kids',
      name: 'Kids',
      subcategories: [
        { id: 'kids-toys', name: 'Toys' },
        { id: 'kids-clothes', name: 'Clothes' }
      ]
    }
  ];

  const products = [
    { id: 'p1', name: 'Classic White Shirt', price: 49.99, category: 'men-shirts', image: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e23?auto=format&fit=crop&w=800&q=80' },
    { id: 'p2', name: 'Slim Fit Jeans', price: 59.99, category: 'men-pants', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80' },
    { id: 'p3', name: 'Leather Handbag', price: 129.99, category: 'women-handbags', image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&w=800&q=80' },
    { id: 'p4', name: 'Summer Dress', price: 79.99, category: 'women-dresses', image: 'https://images.unsplash.com/photo-1572804013309-82a89b4f9403?auto=format&fit=crop&w=800&q=80' },
    { id: 'p5', name: 'Building Blocks', price: 29.99, category: 'kids-toys', image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80' },
    { id: 'p6', name: 'Kids T-Shirt', price: 19.99, category: 'kids-clothes', image: 'https://images.unsplash.com/photo-1519241047957-be31d7379a5d?auto=format&fit=crop&w=800&q=80' }
  ];

  res.status(200).json({ categories, products });
}
