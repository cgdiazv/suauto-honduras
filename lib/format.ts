export const formatPrice = (price?: string | number): string => {
  if (!price) return 'L. 0';
  
  // Extract just the digits from the string
  const numericString = String(price).replace(/[^\d]/g, '');
  
  // If no digits were found (e.g., "Consultar"), return the original string
  if (!numericString) return String(price);

  const number = parseInt(numericString, 10);
  // Using en-US to get the thousands separator (comma)
  return `L. ${number.toLocaleString('en-US')}`;
};