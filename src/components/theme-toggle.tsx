"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-lg border border-border-light dark:border-border-dark opacity-50" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-foreground-light dark:text-foreground-dark hover:bg-surface-light dark:hover:bg-zinc-800 transition-colors"
      title={`Alternar para tema ${isDark ? "claro" : "escuro"}`}
      aria-label="Alternar tema"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-zinc-200 hover:text-white transition-colors" />
      ) : (
        <Moon className="w-4 h-4 text-zinc-700" />
      )}
    </button>
  );
}
