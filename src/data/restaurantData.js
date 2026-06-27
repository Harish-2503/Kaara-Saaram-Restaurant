export const restaurantInfo = {
  name: 'Kaara Saaram',
  tamilName: 'கார சாரம்',
  tagline: 'The Bold Soul of Tamil Nadu',
  tamilTagline: 'தமிழ்நாட்டின் சுவை கலாசாரம்',
  established: '2019',
  description: 'Kaara Saaram is a celebration of Tamil Nadu\'s ancient culinary heritage — from the aromatic Chettinad kitchens of Karaikudi to the coastal flavours of Rameswaram and the temple food of Madurai. Every dish is a story, every spice a memory.',
  phone: '+91 98765 43210',
  email: 'reservations@kaarasaaram.com',
  address: {
    street: '14, Anna Salai',
    area: 'Near Central Station',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600002',
  },
  hours: [
    { days: 'Monday – Friday', lunch: '12:00 PM – 3:30 PM', dinner: '7:00 PM – 11:00 PM' },
    { days: 'Saturday – Sunday', lunch: '11:30 AM – 4:00 PM', dinner: '6:30 PM – 11:30 PM' },
  ],
  social: {
    instagram: 'https://instagram.com/kaarasaaram',
    facebook:  'https://facebook.com/kaarasaaram',
    youtube:   'https://youtube.com/@kaarasaaram',
  },
};

export const testimonials = [
  { id: 1, name: 'Priya Rajan', location: 'Chennai', rating: 5, text: 'The Chettinad Kuzhambu took me straight back to my grandmother\'s kitchen in Karaikudi. This is the real thing — no shortcuts, just soul.', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=80' },
  { id: 2, name: 'Arjun Krishnamurthy', location: 'Bengaluru', rating: 5, text: 'I have eaten in every South Indian restaurant in Bengaluru. Kaara Saaram is on another level. The Nandu Rasam alone is worth the trip to Chennai.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80' },
  { id: 3, name: 'Meera Sundaram', location: 'Singapore', rating: 5, text: 'Flew in specifically for the Meen Varuval. Absolutely no disappointment. The spice blend is unlike anything I have had outside Tamil Nadu.', image: 'https://images.unsplash.com/photo-1494790108755-2616b3e49672?w=120&q=80' },
  { id: 4, name: 'Vikram Nadar', location: 'Mumbai', rating: 5, text: 'The ambience matches the food — both are luxurious and deeply Tamil. A rare place where the heritage and the hospitality feel completely genuine.', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80' },
];

export const galleryImages = [
  { id: 1, src: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80', alt: 'Restaurant interior — warm lighting over carved wooden panels', category: 'ambience' },
  { id: 2, src: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80', alt: 'Chettinad Chicken Kuzhambu plated on banana leaf', category: 'food' },
  { id: 3, src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', alt: 'Private dining room with antique brass lamps', category: 'ambience' },
  { id: 4, src: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80', alt: 'Filter kaapi poured from a brass tumbler', category: 'food' },
  { id: 5, src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', alt: 'Chef plating a dish in the open kitchen', category: 'kitchen' },
  { id: 6, src: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80', alt: 'Kola Urundai served on a teak platter', category: 'food' },
];

export const chefs = [
  { id: 1, name: 'Chef Murugan Pillai', role: 'Executive Chef', tamilRole: 'தலைமை சமையல்காரர்', description: 'Trained in the royal kitchens of Chettinad for 22 years. His mastery of the 67 traditional Chettinad spices is unrivalled.', image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80', specialty: 'Chettinad Gravies' },
  { id: 2, name: 'Chef Kavitha Anand', role: 'Pastry & Sweets Chef', tamilRole: 'இனிப்பு சமையல்காரர்', description: 'A Chennai native who apprenticed at the Kapaleeshwarar temple kitchen, preserving ancient sweet-making traditions.', image: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=400&q=80', specialty: 'Temple Sweets' },
];
