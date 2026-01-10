// 📁 src/utils/formatBanglaNumber.js

export function formatBanglaNumber(number, options = {}) {
  try {
    return new Intl.NumberFormat("bn-BD", options).format(number);
  } catch (err) {
    console.error("Bangla number formatting failed:", err);
    return number;
  }
}
