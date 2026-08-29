import { createContext, useContext, useState, useEffect } from "react";
import { flushSync } from "react-dom";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const flip = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    if (document.startViewTransition) {
      document.startViewTransition(() => flushSync(flip));
    } else {
      flip();
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
