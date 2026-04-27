import { useState, useEffect } from "react";

const STORAGE_KEY = "feverplan_selected_child_id";

export function useSelectedChild() {
  const [selectedChildId, setSelectedChildIdState] = useState<number | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : null;
  });

  const setSelectedChildId = (id: number | null) => {
    setSelectedChildIdState(id);
    if (id === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, id.toString());
    }
  };

  return { selectedChildId, setSelectedChildId };
}
