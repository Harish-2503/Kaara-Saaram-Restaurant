// src/admin/data/menuData.js — SEED DATA + STATIC CATEGORIES
// menuCategories is static (per spec) and never written to storage.
// initialMenuItems is seed data only — used once to initialize
// localStorage on first load. Do NOT import initialMenuItems
// directly in any panel or page; use adminStorageService.js instead.

export const menuCategories = [
  "Starters",
  "Soup",
  "Biryani",
  "South Indian",
  "Chinese",
  "Desserts",
  "Drinks",
];

export const initialMenuItems = [
  {
    id: "menu-1",
    name: "Chicken 65",
    tamilName: "சிக்கன் 65",
    category: "Starters",
    description: "Spicy deep-fried chicken bites tempered with curry leaves and red chillies.",
    ingredients: "Chicken, yogurt, ginger-garlic paste, red chilli powder, curry leaves, corn flour",
    price: 220,
    offerPrice: 0,
    image: "",
    isVeg: false,
    spiceLevel: "medium",
    preparationTime: 20,
    availability: true,
    bestSeller: true,
    chefRecommended: false,
  },
  {
    id: "menu-2",
    name: "Hyderabadi Chicken Biryani",
    tamilName: "ஹைதராபாதி சிக்கன் பிரியாணி",
    category: "Biryani",
    description: "Fragrant basmati rice layered with marinated chicken and saffron.",
    ingredients: "Basmati rice, chicken, saffron, fried onions, mint, yogurt",
    price: 280,
    offerPrice: 249,
    image: "",
    isVeg: false,
    spiceLevel: "medium",
    preparationTime: 35,
    availability: true,
    bestSeller: true,
    chefRecommended: true,
  },
  {
    id: "menu-3",
    name: "Masala Dosa",
    tamilName: "மசாலா தோசை",
    category: "South Indian",
    description: "Crisp golden dosa filled with a spiced potato masala.",
    ingredients: "Rice, urad dal, potato, mustard seeds, curry leaves, turmeric",
    price: 110,
    offerPrice: 0,
    image: "",
    isVeg: true,
    spiceLevel: "mild",
    preparationTime: 15,
    availability: true,
    bestSeller: true,
    chefRecommended: false,
  },
  {
    id: "menu-4",
    name: "Hot & Sour Soup",
    tamilName: "காரம் புளிப்பு சூப்",
    category: "Soup",
    description: "A tangy, peppery soup with vegetables and a hint of vinegar.",
    ingredients: "Mixed vegetables, vinegar, soy sauce, corn flour, pepper",
    price: 130,
    offerPrice: 0,
    image: "",
    isVeg: true,
    spiceLevel: "medium",
    preparationTime: 15,
    availability: true,
    bestSeller: false,
    chefRecommended: false,
  },
  {
    id: "menu-5",
    name: "Gobi Manchurian",
    tamilName: "கோபி மஞ்சூரியன்",
    category: "Chinese",
    description: "Crispy cauliflower tossed in a sweet, spicy and tangy sauce.",
    ingredients: "Cauliflower, corn flour, soy sauce, garlic, green chilli, spring onion",
    price: 160,
    offerPrice: 0,
    image: "",
    isVeg: true,
    spiceLevel: "medium",
    preparationTime: 20,
    availability: true,
    bestSeller: false,
    chefRecommended: false,
  },
  {
    id: "menu-6",
    name: "Gulab Jamun",
    tamilName: "குலாப் ஜாமுன்",
    category: "Desserts",
    description: "Soft milk dumplings soaked in rose-cardamom sugar syrup.",
    ingredients: "Milk powder, flour, sugar, cardamom, rose water",
    price: 90,
    offerPrice: 0,
    image: "",
    isVeg: true,
    spiceLevel: "none",
    preparationTime: 10,
    availability: true,
    bestSeller: false,
    chefRecommended: false,
  },
  {
    id: "menu-7",
    name: "Filter Coffee",
    tamilName: "ஃபில்டர் காபி",
    category: "Drinks",
    description: "Traditional South Indian decoction coffee with farm-fresh milk.",
    ingredients: "Coffee decoction, milk, sugar",
    price: 60,
    offerPrice: 0,
    image: "",
    isVeg: true,
    spiceLevel: "none",
    preparationTime: 5,
    availability: true,
    bestSeller: true,
    chefRecommended: false,
  },
];

// =============================================================
// COMPATIBILITY EXPORTS — restored after adminData.js was
// replaced by this file. restaurantStorageService.js (which
// still powers Settings, Gallery, Offers, and Reservations)
// imports these exact names. They were missing entirely, which
// caused the SyntaxError on module load. Edit the placeholder
// content below to match your real restaurant info / gallery
// photos / offers — these are minimal stand-ins, not finished data.
// =============================================================

// Re-export the menu seed under the name restaurantStorageService
// expects, so there's a single underlying menu dataset rather than
// two separate seed lists that could drift out of sync.
export const defaultMenuItems = initialMenuItems;

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

export const defaultReservations = [
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
];

export const defaultOffers = [
  {
    id: "offer-1",
    title: "Weekend Brunch Special",
    description: "Enjoy 20% off on all breakfast items",
    discountType: "percentage",
    discountValue: 20,
    isActive: true,
  },
];