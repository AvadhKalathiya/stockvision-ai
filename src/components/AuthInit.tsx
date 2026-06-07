import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

export function AuthInit() {
  const init = useAuthStore((s) => s.init);
  useEffect(() => {
    const cleanup = init();
    return cleanup;
  }, [init]);
  return null;
}
