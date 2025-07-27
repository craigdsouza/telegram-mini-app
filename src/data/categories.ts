// categories.ts - Categories and emojis for expense tracking

export interface Category {
  value: string;
  label: string;
  emoji: string;
}

export const categoryData: Category[] = [
  { value: "Groceries", label: "Groceries", emoji: "🛒" },
  { value: "Ordering in", label: "Ordering in", emoji: "🍱" },
  { value: "Eating out", label: "Eating out", emoji: "🍴" },
  { value: "Transport", label: "Transport", emoji: "🚌" },
  { value: "Household items", label: "Household items", emoji: "🏠" },
  { value: "Utilities", label: "Utilities", emoji: "💡" },
  { value: "Health", label: "Health", emoji: "💊" },
  { value: "Capex", label: "Capex", emoji: "🏗️" },
  { value: "Gifts", label: "Gifts", emoji: "🎁" },
  { value: "Clothes", label: "Clothes", emoji: "👗" },
  { value: "Self care", label: "Self care", emoji: "🛁" },
  { value: "Entertainment", label: "Entertainment", emoji: "🎬" },
  { value: "Trips", label: "Trips", emoji: "✈️" },
  { value: "Wedding", label: "Wedding", emoji: "💍" },
  { value: "Learning", label: "Learning", emoji: "📚" },
  { value: "Other", label: "Other", emoji: "❓" },
  { value: "Memberships", label: "Memberships", emoji: "🏆" },
  { value: "Card fees", label: "Card fees", emoji: "💳" },
  { value: "Transfers", label: "Transfers", emoji: "🔄" },
  { value: "Test", label: "Test", emoji: "🧪" },
  { value: "Rent", label: "Rent", emoji: "🏠" },
  { value: "Work", label: "Work", emoji: "💼" },
  { value: "Investments", label: "Investments", emoji: "💰" }
];

export const getCategoryByValue = (value: string): Category | undefined => {
  return categoryData.find(category => category.value === value);
};

export const getCategoryEmoji = (value: string): string => {
  const category = getCategoryByValue(value);
  return category ? category.emoji : "❓";
}; 