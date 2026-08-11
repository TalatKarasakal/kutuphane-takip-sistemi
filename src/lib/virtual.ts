import { useEffect, useState } from "react";

export function useResponsiveColumns() {
  const calculate = () =>
    window.innerWidth >= 1280 ? 3 : window.innerWidth >= 640 ? 2 : 1;
  const [columns, setColumns] = useState(calculate);
  useEffect(() => {
    const update = () => setColumns(calculate());
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return columns;
}
