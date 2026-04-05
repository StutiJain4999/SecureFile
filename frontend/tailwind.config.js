export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          950: "#030712"
        },
        mint: "#7dd3fc",
        ember: "#fb7185"
      },
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        panel: "0 20px 80px rgba(15, 23, 42, 0.25)"
      }
    }
  },
  plugins: []
};
