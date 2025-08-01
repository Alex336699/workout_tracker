import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Box, Button, Flex, Text, ChakraProvider } from "@chakra-ui/react";
import { supabase } from "./services/supabaseClient";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/dashboard";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import WorkoutPrograms from "./pages/WorkoutPrograms";
import DailyWorkoutLog from "./components/DailyWorkoutLog";
import BottomNavigation from "./components/BottomNavigation";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set initial session
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("Error fetching session:", error);
      setSession(data.session);
      setLoading(false);
    };

    fetchSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <ChakraProvider>
      <BrowserRouter>
        <Box minH="100vh" pb={{ base: "60px", md: "0" }}>
          {" "}
          {/* Padding for bottom nav on mobile */}
          {session && (
            <Flex p={2} bg="gray.100" justify="flex-end">
              <Button size="sm" colorScheme="red" onClick={handleLogout}>
                Logout
              </Button>
            </Flex>
          )}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                session ? <Dashboard /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/exercise-library"
              element={
                session ? <ExerciseLibrary /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/workout-programs"
              element={
                session ? <WorkoutPrograms /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/daily-workout-log"
              element={
                session ? (
                  <DailyWorkoutLog
                    allExercises={[]}
                    onUpdateExercises={() => {}}
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="*"
              element={<Navigate to={session ? "/" : "/login"} replace />}
            />
          </Routes>
          {session && <BottomNavigation />}
        </Box>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;
