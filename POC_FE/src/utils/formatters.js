/**
 * Format a number in Indian numbering system
 * Examples: 187406 -> 1,87,406 | 1234567 -> 12,34,567 | 12345678 -> 1,23,45,678
 * @param {number|string} num - The number to format
 * @returns {string} - Formatted number string
 */
export function formatIndianNumber(num) {
  if (num === null || num === undefined || num === '') {
    return '0'
  }

  const numStr = num.toString()
  
  // Handle decimal numbers - format the integer part only
  const parts = numStr.split('.')
  const integerPart = parts[0]
  
  // Reverse the string to process from right to left
  let reversed = integerPart.split('').reverse()
  
  // Add commas: first 3 digits, then groups of 2
  let formatted = []
  for (let i = 0; i < reversed.length; i++) {
    // Add comma after position 2 (first 3 digits), then every 2 positions
    if (i === 3 || (i > 3 && (i - 3) % 2 === 0)) {
      formatted.push(',')
    }
    formatted.push(reversed[i])
  }
  
  // Reverse back to original order
  formatted = formatted.reverse().join('')
  
  // Add decimal part if exists
  if (parts.length > 1) {
    formatted += '.' + parts[1]
  }
  
  return formatted
}

