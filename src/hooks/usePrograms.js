import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export function usePrograms() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('program_library') // Replace with your actual table name
          .select('*'); // Fetch all columns; adjust as needed

        console.log('Fetched Programs:', data); // Debug log
        if (error) throw error;
        setPrograms(data || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch programs');
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []); // Empty dependency array means this runs once on mount

  return { programs, loading, error };
}