import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

export function AuthInit() {
  const init = useAuthStore((s) => s.init);
  useEffect(() => {
    const cleanup = init();
    // Initialize theme
    const savedTheme = localStorage.getItem("theme") as "dark" | "light";
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(savedTheme || "dark");
    return cleanup;
  }, [init]);
  return null;
}
