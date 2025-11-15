export const API_BASE_URL = 'http://localhost:3001/api';

export const DONATION_STATUS = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  PICKEDUP: 'pickedup',
  EXPIRED: 'expired'
};

export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
};

export const USER_TYPES = {
  DONOR: 'donor',
  RECIPIENT: 'recipient'
};

export const FOOD_CATEGORIES = [
  'Fruits',
  'Vegetables',
  'Grains',
  'Dairy',
  'Meat',
  'Cooked Meals',
  'Baked Goods',
  'Beverages',
  'Other'
];

export const ALLERGENS = [
  'Nuts',
  'Dairy',
  'Gluten',
  'Shellfish',
  'Eggs',
  'Soy',
  'None'
];
