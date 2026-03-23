/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#FF6B8A",
        secondary: "#6BC5FF",
        accent: "#FFD93D",
        background: "#FFF8F0",
        surface: "#FFFFFF",
        toolbar: "#FFF0E6",
        border: "#FFE0CC",
        danger: "#FF6B6B",
        success: "#51CF66",
        text: "#2C2C2C",
      },
      borderRadius: {
        sm: "12px",
        md: "20px",
        lg: "28px",
      },
      fontFamily: {
        nunito: ["Nunito_600SemiBold"],
        "nunito-bold": ["Nunito_700Bold"],
        "nunito-extrabold": ["Nunito_800ExtraBold"],
      },
    },
  },
  plugins: [],
};
