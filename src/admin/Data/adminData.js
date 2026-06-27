// adminData.js — SEED DATA ONLY
// Used once to initialize localStorage on first load.
// Do NOT import this in components — use adminStorageService.js instead.

export const defaultRestaurantSettings = {
  name: "Kaara Saaram",
  tagline: "Authentic South Indian Cuisine",
  phone: "+91 98765 43210",
  email: "hello@kaarasaaram.com",
  address: "12, Anna Salai, Chennai, Tamil Nadu 600002",
  openingHours: {
    weekdays: "11:00 AM – 10:30 PM",
    weekends: "10:00 AM – 11:00 PM",
  },
  socialLinks: {
    instagram: "https://instagram.com/kaarasaaram",
    facebook: "https://facebook.com/kaarasaaram",
    twitter: "https://twitter.com/kaarasaaram",
  },
  currency: "₹",
  gstNumber: "33AABCU9603R1ZX",
};

export const initialMenuItems = [
  {
    id: "menu-1",
    name: "Chettinad Chicken Curry",
    category: "Main Course",
    price: 320,
    description: "Slow-cooked chicken in aromatic Chettinad spice blend with kalpasi and marathi mokku.",
    isVeg: false,
    isAvailable: true,
    isBestseller: true,
    image: "",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "menu-2",
    name: "Idiyappam with Coconut Milk",
    category: "Breakfast",
    price: 120,
    description: "Delicate string hoppers served with sweet coconut milk and cardamom.",
    isVeg: true,
    isAvailable: true,
    isBestseller: true,
    image: "",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "menu-3",
    name: "Mutton Kola Urundai",
    category: "Starters",
    price: 280,
    description: "Crispy minced mutton balls spiced with fennel, cinnamon and red chilli.",
    isVeg: false,
    isAvailable: true,
    isBestseller: false,
    image: "",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "menu-4",
    name: "Pongal",
    category: "Breakfast",
    price: 90,
    description: "Comforting rice and moong dal porridge tempered with ghee, pepper and cashews.",
    isVeg: true,
    isAvailable: true,
    isBestseller: false,
    image: "",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "menu-5",
    name: "Filter Coffee",
    category: "Beverages",
    price: 60,
    description: "Traditional South Indian decoction coffee with farm-fresh milk.",
    isVeg: true,
    isAvailable: true,
    isBestseller: true,
    image: "",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];

export const initialReservations = [
  {
    id: "res-1",
    guestName: "Priya Nair",
    phone: "+91 98001 12345",
    email: "priya.nair@email.com",
    date: "2025-07-10",
    time: "07:30 PM",
    guests: 4,
    specialRequests: "Window table preferred",
    status: "confirmed",
    createdAt: "2025-06-20T10:00:00.000Z",
  },
  {
    id: "res-2",
    guestName: "Arjun Sharma",
    phone: "+91 97002 67890",
    email: "arjun@email.com",
    date: "2025-07-11",
    time: "08:00 PM",
    guests: 2,
    specialRequests: "Anniversary dinner — candle setup if possible",
    status: "pending",
    createdAt: "2025-06-21T14:00:00.000Z",
  },
  {
    id: "res-3",
    guestName: "Meena Krishnan",
    phone: "+91 96003 11111",
    email: "meena.k@email.com",
    date: "2025-07-08",
    time: "12:30 PM",
    guests: 6,
    specialRequests: "",
    status: "completed",
    createdAt: "2025-06-19T09:00:00.000Z",
  },
];
export const initialGallery = [
  {
    id: 1,
    title: "Chicken Biryani",
    category: "Food",
    image:
      "https://images.unsplash.com/photo-1563379091339-03246963d51a",
    status: "Active",
  },
  {
    id: 2,
    title: "Restaurant Interior",
    category: "Interior",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
    status: "Active",
  },
  {
    id: 3,
    title: "Kitchen",
    category: "Kitchen",
    image:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba",
    status: "Active",
  },
];
export const defaultGalleryImages = [
  {
    id: "gal-1",
    url: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800",
    caption: "Chettinad Feast",
    category: "Food",
    uploadedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "gal-2",
    url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800",
    caption: "Restaurant Ambience",
    category: "Ambience",
    uploadedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "gal-3",
    url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800",
    caption: "South Indian Thali",
    category: "Food",
    uploadedAt: "2024-01-01T00:00:00.000Z",
  },
];

export const initialOffers = [
  {
    id: "offer-1",
    title: "Weekend Brunch Special",
    description:
      "Enjoy 20% off on all breakfast items",
    isActive:true,
  }
];
// Compatibility exports for adminStorageService.js

export const defaultMenuItems = initialMenuItems;

export const defaultReservations = initialReservations;

export const defaultOffers = initialOffers;

export const defaultGallery = initialGallery;

