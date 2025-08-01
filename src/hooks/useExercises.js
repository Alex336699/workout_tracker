import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";

export function useExercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("Exercise Library") // Replace with your actual table name
          .select("*"); // Fetch all columns; adjust as needed

        if (error) throw error;
        setExercises(data || []);
      } catch (err) {
        setError(err.message || "Failed to fetch exercises");
        setExercises([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []); // Empty dependency array means this runs once on mount

  return { exercises, loading, error };
}
