const products = [
  {
    id: 1,
    name: "Fresh Apples",
    quantity: "1 kg",
    price: 120,
    mrp: 150,
    category: "Fruits & Vegetables",
    image:
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6",
    variants: [
      { id: "500g", label: "500 g", price: 65, mrp: 75 },
      { id: "1kg", label: "1 kg", price: 120, mrp: 150 },
      { id: "5kg", label: "5 kg", price: 575, mrp: 700 },
      { id: "10kg", label: "10 kg", price: 1100, mrp: 1400 },
    ],
  },
  {
    id: 2,
    name: "Fresh Tomatoes",
    quantity: "1 kg",
    price: 60,
    mrp: 80,
    category: "Fruits & Vegetables",
    image:
      "https://images.unsplash.com/photo-1546094096-0df4bcaaa337",
    variants: [
      { id: "500g", label: "500 g", price: 32, mrp: 40 },
      { id: "1kg", label: "1 kg", price: 60, mrp: 80 },
      { id: "5kg", label: "5 kg", price: 285, mrp: 375 },
      { id: "10kg", label: "10 kg", price: 550, mrp: 750 },
    ],
  },
  {
    id: 3,
    name: "Fresh Milk",
    quantity: "1 litre",
    price: 55,
    mrp: 65,
    category: "Dairy & Bakery",
    image:
      "https://images.unsplash.com/photo-1563636619-e9143da7973b",
    variants: [
      { id: "500ml", label: "500 ml", price: 30, mrp: 35 },
      { id: "1l", label: "1 litre", price: 55, mrp: 65 },
      { id: "2l", label: "2 litres", price: 105, mrp: 125 },
      { id: "5l", label: "5 litres", price: 260, mrp: 310 },
    ],
  },
  {
    id: 4,
    name: "Whole Wheat Bread",
    quantity: "400 g",
    price: 45,
    mrp: 55,
    category: "Dairy & Bakery",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff",
    variants: [
      { id: "200g", label: "200 g", price: 25, mrp: 30 },
      { id: "400g", label: "400 g", price: 45, mrp: 55 },
      { id: "600g", label: "600 g", price: 65, mrp: 80 },
    ],
  },
  {
    id: 5,
    name: "Fresh Bananas",
    quantity: "1 dozen",
    price: 50,
    mrp: 60,
    category: "Fruits & Vegetables",
    image:
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e",
    variants: [
      { id: "6pcs", label: "6 pieces", price: 28, mrp: 35 },
      { id: "1dozen", label: "1 dozen", price: 50, mrp: 60 },
      { id: "2dozen", label: "2 dozen", price: 95, mrp: 115 },
    ],
  },
  {
    id: 6,
    name: "Basmati Rice",
    quantity: "5 kg",
    price: 180,
    mrp: 220,
    category: "Staples",
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c",
    variants: [
      { id: "1kg", label: "1 kg", price: 40, mrp: 48 },
      { id: "5kg", label: "5 kg", price: 180, mrp: 220 },
      { id: "10kg", label: "10 kg", price: 350, mrp: 430 },
      { id: "25kg", label: "25 kg", price: 850, mrp: 1050 },
    ],
  },
  {
    id: 7,
    name: "Potato Chips",
    quantity: "100 g",
    price: 40,
    mrp: 50,
    category: "Snacks",
    image:
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b",
    variants: [
      { id: "50g", label: "50 g", price: 22, mrp: 25 },
      { id: "100g", label: "100 g", price: 40, mrp: 50 },
      { id: "200g", label: "200 g", price: 75, mrp: 95 },
    ],
  },
  {
    id: 8,
    name: "Orange Juice",
    quantity: "1 litre",
    price: 110,
    mrp: 130,
    category: "Beverages",
    image:
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba",
    variants: [
      { id: "250ml", label: "250 ml", price: 30, mrp: 35 },
      { id: "500ml", label: "500 ml", price: 60, mrp: 70 },
      { id: "1l", label: "1 litre", price: 110, mrp: 130 },
      { id: "2l", label: "2 litres", price: 210, mrp: 250 },
    ],
  },
];

export default products;