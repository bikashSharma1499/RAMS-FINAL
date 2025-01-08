export const numberToWordsWithCurrency = (num) => {
    // Handle negative numbers
    if (num < 0) return "Minus " + numberToWordsWithCurrency(Math.abs(num));
  
    // Separate the integer and decimal parts
    let [integer, decimal] = num.toString().split('.');
  
    const integerPart = numberToWords(integer);  // Convert integer part to words
    let result = `Rupees ${integerPart} only`;    // Add currency prefix and suffix
  
    if (decimal) {
      const decimalPart = numberToWords(decimal); // Convert decimal part to words
      result += ` and ${decimalPart} Paise`;      // Add "and Paise"
    }
  
    return result;
  };
  
  // Function to convert integer part to words (same as the previous function)
  const numberToWords = (num) => {
    if (num === "0") return "zero";
  
    const ones = [
      "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
      "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
      "seventeen", "eighteen", "nineteen"
    ];
    const tens = [
      "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"
    ];
    const thousands = ["", "thousand", "million", "billion", "trillion"];
  
    let words = '';
    let i = 0;
  
    while (parseInt(num) > 0) {
      if (parseInt(num) % 1000 !== 0) {
        words = convertHundreds(num % 1000) + thousands[i] + ' ' + words;
      }
      num = Math.floor(parseInt(num) / 1000);
      i++;
    }
  
    return words.trim();
  
    function convertHundreds(num) {
      let str = '';
      if (num > 99) {
        str += ones[Math.floor(num / 100)] + ' hundred ';
        num %= 100;
      }
      if (num > 19) {
        str += tens[Math.floor(num / 10)] + ' ';
        num %= 10;
      }
      if (num > 0) {
        str += ones[num] + ' ';
      }
      return str;
    }
  };