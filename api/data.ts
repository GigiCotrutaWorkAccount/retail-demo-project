export default function handler(req: any, res: any) {
  const categories = [
    {
      id: 'men',
      name: 'Men',
      subcategories: [
        {
          id: 'men-shoes',
          name: 'Shoes',
          subcategories: [
            { id: 'men-shoes-sport', name: 'Sport' },
            { id: 'men-shoes-casual', name: 'Casual' }
          ]
        },
        {
          id: 'men-socks',
          name: 'Socks',
          subcategories: [
            { id: 'men-socks-sport', name: 'Sport' },
            { id: 'men-socks-casual', name: 'Casual' }
          ]
        }
      ]
    },
    {
      id: 'women',
      name: 'Women',
      subcategories: [
        {
          id: 'women-shoes',
          name: 'Shoes',
          subcategories: [
            { id: 'women-shoes-sport', name: 'Sport' },
            { id: 'women-shoes-casual', name: 'Casual' }
          ]
        },
        {
          id: 'women-socks',
          name: 'Socks',
          subcategories: [
            { id: 'women-socks-sport', name: 'Sport' },
            { id: 'women-socks-casual', name: 'Casual' }
          ]
        }
      ]
    }
  ];

  const products = [
    { id: 'men-storm-runner', name: 'Storm Runner', price: 145, category: 'Men / Shoes / Sport', image: '/product-storm-runner-brown-1.svg', badge: 'Best seller', href: '/product.html', taxonomy: { gender: 'men', type: 'shoes', style: 'sport' } },
    { id: 'men-drift-runner', name: 'Drift Runner', price: 135, category: 'Men / Shoes / Casual', image: '/product-storm-runner-brown-2.svg', badge: 'New color', href: '/product.html', taxonomy: { gender: 'men', type: 'shoes', style: 'casual' } },
    { id: 'men-summit-lounger', name: 'Summit Lounger', price: 118, category: 'Men / Shoes / Casual', image: '/product-storm-runner-brown-3.svg', badge: 'Softest feel', href: '/product.html', taxonomy: { gender: 'men', type: 'shoes', style: 'casual' } },
    { id: 'men-trail-dasher', name: 'Trail Dasher', price: 160, category: 'Men / Shoes / Sport', image: '/product-storm-runner-brown-4.svg', badge: 'Grip focus', href: '/product.html', taxonomy: { gender: 'men', type: 'shoes', style: 'sport' } },
    { id: 'men-coast-runner', name: 'Coast Runner', price: 128, category: 'Men / Shoes / Casual', image: '/product-storm-runner-brown-1.svg', badge: 'Travel pick', href: '/product.html', taxonomy: { gender: 'men', type: 'shoes', style: 'casual' } },
    { id: 'men-metro-knit', name: 'Metro Knit', price: 132, category: 'Men / Shoes / Casual', image: '/product-storm-runner-brown-2.svg', badge: 'City edit', href: '/product.html', taxonomy: { gender: 'men', type: 'shoes', style: 'casual' } },
    { id: 'men-pulse-runner', name: 'Pulse Runner', price: 152, category: 'Men / Shoes / Sport', image: '/product-storm-runner-brown-3.svg', badge: 'Responsive ride', href: '/product.html', taxonomy: { gender: 'men', type: 'shoes', style: 'sport' } },
    { id: 'men-weekend-knit', name: 'Weekend Knit', price: 124, category: 'Men / Shoes / Casual', image: '/product-storm-runner-brown-4.svg', badge: 'Everyday pick', href: '/product.html', taxonomy: { gender: 'men', type: 'shoes', style: 'casual' } },
    { id: 'men-pace-crew-sock', name: 'Pace Crew Sock', price: 22, category: 'Men / Socks / Sport', image: '/product-storm-runner-brown-1.svg', badge: 'Performance knit', href: '/product.html', taxonomy: { gender: 'men', type: 'socks', style: 'sport' } },
    { id: 'men-rest-ankle-sock', name: 'Rest Ankle Sock', price: 18, category: 'Men / Socks / Casual', image: '/product-storm-runner-brown-2.svg', badge: 'Daily comfort', href: '/product.html', taxonomy: { gender: 'men', type: 'socks', style: 'casual' } },
    { id: 'women-cloud-runner', name: 'Cloud Runner', price: 142, category: 'Women / Shoes / Sport', image: '/product-storm-runner-brown-3.svg', badge: 'Lightweight feel', href: '/product.html', taxonomy: { gender: 'women', type: 'shoes', style: 'sport' } },
    { id: 'women-harbor-runner', name: 'Harbor Runner', price: 138, category: 'Women / Shoes / Casual', image: '/product-storm-runner-brown-4.svg', badge: 'Coastal neutral', href: '/product.html', taxonomy: { gender: 'women', type: 'shoes', style: 'casual' } },
    { id: 'women-arc-lounger', name: 'Arc Lounger', price: 116, category: 'Women / Shoes / Casual', image: '/product-storm-runner-brown-1.svg', badge: 'Soft step', href: '/product.html', taxonomy: { gender: 'women', type: 'shoes', style: 'casual' } },
    { id: 'women-rally-dasher', name: 'Rally Dasher', price: 158, category: 'Women / Shoes / Sport', image: '/product-storm-runner-brown-2.svg', badge: 'Road ready', href: '/product.html', taxonomy: { gender: 'women', type: 'shoes', style: 'sport' } },
    { id: 'women-studio-knit', name: 'Studio Knit', price: 126, category: 'Women / Shoes / Casual', image: '/product-storm-runner-brown-3.svg', badge: 'Studio to street', href: '/product.html', taxonomy: { gender: 'women', type: 'shoes', style: 'casual' } },
    { id: 'women-peak-runner', name: 'Peak Runner', price: 149, category: 'Women / Shoes / Sport', image: '/product-storm-runner-brown-4.svg', badge: 'Most cushioned', href: '/product.html', taxonomy: { gender: 'women', type: 'shoes', style: 'sport' } },
    { id: 'women-slate-runner', name: 'Slate Runner', price: 134, category: 'Women / Shoes / Casual', image: '/product-storm-runner-brown-1.svg', badge: 'Minimal look', href: '/product.html', taxonomy: { gender: 'women', type: 'shoes', style: 'casual' } },
    { id: 'women-daily-drift', name: 'Daily Drift', price: 129, category: 'Women / Shoes / Casual', image: '/product-storm-runner-brown-2.svg', badge: 'Weekend favorite', href: '/product.html', taxonomy: { gender: 'women', type: 'shoes', style: 'casual' } },
    { id: 'women-motion-crew-sock', name: 'Motion Crew Sock', price: 21, category: 'Women / Socks / Sport', image: '/product-storm-runner-brown-3.svg', badge: 'Training staple', href: '/product.html', taxonomy: { gender: 'women', type: 'socks', style: 'sport' } },
    { id: 'women-softstep-ankle-sock', name: 'Softstep Ankle Sock', price: 19, category: 'Women / Socks / Casual', image: '/product-storm-runner-brown-4.svg', badge: 'Soft rib', href: '/product.html', taxonomy: { gender: 'women', type: 'socks', style: 'casual' } }
  ];

  res.status(200).json({ categories, products });
}
