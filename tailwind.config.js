export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        night: "#17110A",
        gold: "#9D7422",
        champagne: "#D8D5CA",
        cream: "#F7F4EA",
        beige: "#D8D5CA",
        henna: "#6E5B3E",
        clay: "#AC9D80"
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        body: ["Inter", "Arial", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 42px rgba(157,116,34,.28)",
        soft: "0 25px 80px rgba(23,17,10,.18)"
      },
      backgroundImage: {
        luxury: "radial-gradient(circle at top left, rgba(157,116,34,.18), transparent 34%), linear-gradient(135deg, #D8D5CA 0%, #F7F4EA 48%, #AC9D80 100%)",
        silk: "linear-gradient(135deg, rgba(247,244,234,.98), rgba(216,213,202,.74))"
      }
    }
  },
  plugins: []
};
