// Import all category images
import fruitBasket from "./img/fruit_basket.png";
import organicVegetables from "./img/organic_vegetables.png";
import milkDairy from "./img/milk_dairy.png";
import grainCereal from "./img/grain_cereal.png";
import breadBakery from "./img/bread_bakery.png";
import coldDrinks from "./img/cold_drinks.png";
import instantFood from "./img/instant_food.png";
import apple from "./img/apple.png";
import potato from "./img/potato.png";
import bread from "./img/bread.png";
import yogurt from "./img/yogurt.png";
import pepsi from "./img/pepsi-cola.png";
import banana from "./img/bananax12.png";
import cheddar from "./img/cheddarcheese.png";
import onion from "./img/onion.png";
import croissant from "./img/croissant.png";
import milk from "./img/milk.png";
import tomato from "./img/tomato.png";
import sup from "./img/7up-cola.png";
import orange from "./img/orange.png";
import macAndCheese from "./img/mac&cheese.png";
import cornSoup from "./img/corn_soup.png";
import Noodles from "./img/maggi_noodles.png";


export const categories = [
  {
    text: "Fresh Fruits",
    path: "fruits",
    image: fruitBasket,
    bgColor: "bg-green-100",
  },
  {
    text: "Organic Vegetables",
    path: "vegetables",
    image: organicVegetables,
    bgColor: "bg-lime-100",
  },
  {
    text: "Milk & Dairy",
    path: "dairy",
    image: milkDairy,
    bgColor: "bg-blue-100",
  },
  {
    text: "Grain & Cereal",
    path: "grains",
    image: grainCereal,
    bgColor: "bg-yellow-100",
  },
  {
    text: "Bread & Bakery",
    path: "bakery",
    image: breadBakery,
    bgColor: "bg-orange-100",
  },
  {
    text: "Cold Drinks",
    path: "drinks",
    image: coldDrinks,
    bgColor: "bg-cyan-100",
  },
  {
    text: "Instant Food",
    path: "instant",
    image: instantFood,
    bgColor: "bg-red-100",
  },
];

export const dummyProducts = [
  {
    _id: "F001",
    name: "Apple (1kg)",
    bgColor: "bg-green-100",
    category: "Fruits",
    price: 550,
    offerPrice: 500,
    rating: 5,
    image: [apple],
    description: ["Juicy red apples", "Rich in fiber", "Perfect for snacking"],
    createdAt: "2025-03-01",
    updatedAt: "2025-07-22",
    inStock: true,
  },
  {
    _id: "F002",
    name: "Banana (Dozen)",
    category: "Fruits",
    bgColor: "bg-green-100",

    price: 250,
    offerPrice: 230,
    rating: 4.2,
    image: [banana],
    description: [
      "Sweet ripe bananas",
      "Loaded with potassium",
      "Great for shakes",
    ],
    createdAt: "2025-03-02",
    updatedAt: "2025-07-22",
    inStock: true,
  },
  {
    _id: "F003",
    name: "Orange (1kg)",
    category: "Fruits",
    bgColor: "bg-green-100",

    price: 300,
    offerPrice: 270,
    rating: 4.5,
    image: [orange],
    description: ["Juicy and tangy", "High in Vitamin C", "Boosts immunity"],
    createdAt: "2025-03-03",
    updatedAt: "2025-07-22",
    inStock: true,
  },

  // Vegetables
  {
    _id: "V001",
    name: "Potato (500g)",
    category: "Vegetables",
    bgColor: "bg-lime-100",

    price: 60,
    offerPrice: 40,
    rating: 4,
    image: [potato],
    description: [
      "Organic potatoes",
      "Good for baking and frying",
      "Rich in starch",
    ],
    createdAt: "2025-03-04",
    updatedAt: "2025-07-22",
    inStock: true,
  },
  {
    _id: "V002",
    name: "Tomato (1kg)",
    category: "Vegetables",
    bgColor: "bg-lime-100",

    price: 250,
    offerPrice: 230,
    rating: 4.3,
    image: [tomato],
    description: ["Fresh tomatoes", "Perfect for curries", "Juicy and ripe"],
    createdAt: "2025-03-05",
    updatedAt: "2025-07-22",
    inStock: true,
  },
  {
    _id: "V003",
    name: "Onion (1kg)",
    category: "Vegetables",
    bgColor: "bg-lime-100",

    price: 220,
    offerPrice: 200,
    rating: 4,
    image: [onion],
    description: [
      "Sharp flavor",
      "Essential for every dish",
      "Long shelf life",
    ],
    createdAt: "2025-03-06",
    updatedAt: "2025-07-22",
    inStock: true,
  },

  // Dairy
  {
    _id: "D001",
    name: "Full Cream Milk (1L)",
    category: "Dairy",
    bgColor: "bg-blue-100",

    price: 15,
    offerPrice: 12,
    rating: 4.5,
    image: [milk],
    description: ["Pure whole milk", "Rich in protein", "Delivered cold"],
    createdAt: "2025-03-07",
    updatedAt: "2025-07-22",
    inStock: true,
  },
  {
    _id: "D002",
    name: "Cheddar Cheese (200g)",
    category: "Dairy",
    bgColor: "bg-blue-100",

    price: 30,
    offerPrice: 27,
    rating: 4.6,
    image: [cheddar],
    description: ["Sharp cheddar", "Melts well", "Perfect for sandwiches"],
    createdAt: "2025-03-08",
    updatedAt: "2025-07-22",
    inStock: true,
  },
  {
    _id: "D003",
    name: "Yogurt Cup (Plain)",
    category: "Dairy",
    bgColor: "bg-blue-100",

    price: 10,
    offerPrice: 8,
    rating: 4.1,
    image: [yogurt],
    description: [
      "Creamy plain yogurt",
      "Good for digestion",
      "Can be used in raita",
    ],
    createdAt: "2025-03-09",
    updatedAt: "2025-07-22",
    inStock: true,
  },

  // Bakery
  {
    _id: "B001",
    name: "Wheat Bread Loaf",
    category: "Bakery",
    bgColor: "bg-orange-100",

    price: 18,
    offerPrice: 14,
    rating: 4,
    image: [bread],
    description: [
      "Freshly baked",
      "No added sugar",
      "Good with butter or eggs",
    ],
    createdAt: "2025-03-10",
    updatedAt: "2025-07-22",
    inStock: true,
  },
  {
    _id: "B002",
    name: "Croissants (Pack of 4)",
    category: "Bakery",
    bgColor: "bg-orange-100",

    price: 35,
    offerPrice: 30,
    rating: 4.3,
    image: [croissant],
    description: [
      "Buttery & flaky",
      "Great for breakfast",
      "Freshly baked daily",
    ],
    createdAt: "2025-03-11",
    updatedAt: "2025-07-22",
    inStock: true,
  },

  // Cold Drinks
  {
    _id: "C001",
    name: "Pepsi 500ml",
    category: "Cold Drinks",
    bgColor: "bg-cyan-100",

    price: 12,
    offerPrice: 10,
    rating: 4.2,
    image: [pepsi],
    description: ["Refreshing cola", "Serve chilled", "Original taste"],
    createdAt: "2025-03-12",
    updatedAt: "2025-07-22",
    inStock: true,
  },
  {
    _id: "C002",
    name: "Sprite 1 Litre",
    category: "Cold Drinks",
    bgColor: "bg-cyan-100",

    price: 12,
    offerPrice: 10,
    rating: 4.1,
    image: [sup],
    description: [
      "Lemon-lime drink",
      "Refreshing and fizzy",
      "Great with spicy food",
    ],
    createdAt: "2025-03-13",
    updatedAt: "2025-07-22",
    inStock: true,
  },

  {
    _id: "I001",
    name: "Instant Noodles - Chicken",
    category: "Instant Food",
    bgColor: "bg-red-100",

    price: 20,
    offerPrice: 18,
    rating: 4,
    image: [Noodles],
    description: ["Ready in 3 mins", "Spicy chicken flavor", "Great snack"],
    createdAt: "2025-03-14",
    updatedAt: "2025-07-22",
    inStock: true,
  },
  {
    _id: "I002",
    name: "Mac & Cheese",
    category: "Instant Food",
    bgColor: "bg-red-100",

    price: 25,
    offerPrice: 22,
    rating: 4.3,
    image: [macAndCheese],
    description: ["Creamy and cheesy", "Quick comfort food", "Microwavable"],
    createdAt: "2025-03-15",
    updatedAt: "2025-07-22",
    inStock: true,
  },
  {
    _id: "I003",
    name: "Instant Soup - Corn",
    category: "Instant Food",
    bgColor: "bg-red-100",

    price: 15,
    offerPrice: 12,
    rating: 4.2,
    image: [cornSoup],
    description: ["Warm and hearty", "Made in 2 mins", "Good for cold days"],
    createdAt: "2025-03-16",
    updatedAt: "2025-07-22",
    inStock: true,
  },
];


const findProductByImage = (img) => dummyProducts.find(p => p.image[0] === img);

export const dummyOrders = [
  {
    id: 1,
    items: [
      {
        product: findProductByImage(tomato),
        quantity: 1,
      },
      {
        product: findProductByImage(apple),
        quantity: 2,
      },
    ],
    image: [tomato, apple],  // if you still need this

    address: {
      firstName: "Ali",
      lastName: "Khan",
      street: "123 Main Street",
      city: "Lahore",
      state: "Punjab",
      zipcode: "54000",
      country: "Pakistan",
    },
    amount: 3500,
    paymentType: "Online",
    orderDate: "2025-08-05",
    isPaid: true,
  },
  {
    id: 2,
    items: [
      {
        product: findProductByImage(banana),
        quantity: 1,
      },
    ],
    address: {
      firstName: "Sara",
      lastName: "Ahmed",
      street: "45 Mall Road",
      city: "Karachi",
      state: "Sindh",
      zipcode: "74000",
      country: "Pakistan",
    },
    amount: 1200,
    paymentType: "Cash on Delivery",
    orderDate: "2025-08-03",
    isPaid: false,
  },
  {
    id: 3,
    items: [
      {
        product: findProductByImage(croissant),
        quantity: 3,
      },
    ],
    address: {
      firstName: "Hassan",
      lastName: "Raza",
      street: "78 Canal Bank",
      city: "Islamabad",
      state: "Capital Territory",
      zipcode: "44000",
      country: "Pakistan",
    },
    amount: 4500,
    paymentType: "Online",
    orderDate: "2025-08-01",
    isPaid: true,
  },
];