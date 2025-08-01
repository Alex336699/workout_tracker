import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Button,
  Flex,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Progress,
  IconButton,
  VStack,
} from "@chakra-ui/react";
import { CalendarIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { Link, useNavigate } from "react-router-dom";
import RestTimer from "../components/RestTimer";
import DailyWorkoutLog from "../components/DailyWorkoutLog";
import { useExercises } from "../hooks/useExercises";
import { supabase } from "../services/supabaseClient";

function Dashboard() {
  const [started, setStarted] = useState(false);
  const {
    exercises,
    loading: exercisesLoading,
    error: exercisesError,
  } = useExercises();
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);
  const [currentProgram, setCurrentProgram] = useState(null);
  const [nextWorkout, setNextWorkout] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEnrolledProgramAndNextWorkout = async () => {
      try {
        setLoadingDashboard(true);
        setDashboardError(null);

        // Get current user session
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError) {
          console.error("Error fetching session:", sessionError);
          throw new Error("Unable to fetch user session. Please log in again.");
        }

        if (!sessionData?.session) {
          navigate("/login");
          return;
        }

        const userId = sessionData.session.user.id;

        // Fetch enrolled program from user_programs
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from("user_programs")
          .select("program_id, enrolled_at")
          .eq("user_id", userId)
          .limit(1)
          .single();

        if (enrollmentError) {
          if (enrollmentError.code === "PGRST116") {
            setCurrentProgram(null); // No enrollment found
            setNextWorkout(null);
          } else {
            console.error("Error fetching enrollment:", enrollmentError);
            throw new Error(
              `Failed to fetch enrolled program: ${
                enrollmentError.message || "Unknown error"
              }`
            );
          }
        } else if (enrollmentData) {
          // Fetch program details from program_overview
          const { data: programData, error: programError } = await supabase
            .from("program_overview")
            .select("Program_ID, Program_Name, Focus, Weeks, Level")
            .eq("Program_ID", enrollmentData.program_id)
            .limit(1)
            .single();

          if (programError) {
            console.error("Error fetching program details:", programError);
            throw new Error(
              `Failed to fetch program details: ${
                programError.message || "Unknown error"
              }`
            );
          }

          setCurrentProgram(programData);

          // Fetch the last workout log for this program from Workout_Daily_Log with simplified query
          console.log(
            `Fetching last log for program_id: ${enrollmentData.program_id}, user_id: ${userId}`
          );
          const { data: lastLogData, error: lastLogError } = await supabase
            .from("Workout_Daily_Log")
            .select("week, day")
            .eq("program_id", enrollmentData.program_id)
            .eq("user_id", userId)
            .limit(1);

          let nextWeek = 1;
          let nextDay = 1;

          if (lastLogError) {
            if (lastLogError.code !== "PGRST116") {
              console.error("Error fetching last workout log:", lastLogError);
              console.log("Full error details:", lastLogError); // Debug log for detailed error
              // Don't throw error, fallback to week 1, day 1
            }
            // If no log exists or error occurs, start at Week 1, Day 1
            console.log(
              "No last log found or error occurred, starting at Week 1, Day 1"
            );
          } else if (lastLogData && lastLogData.length > 0) {
            nextDay = lastLogData[0].day + 1;
            nextWeek = lastLogData[0].week;
            // If nextDay exceeds typical days per week (e.g., 7), increment week
            if (nextDay > 7) {
              nextDay = 1;
              nextWeek = Math.min(nextWeek + 1, programData.Weeks || 1);
            }
            console.log(
              `Last log found: Week ${lastLogData[0].week}, Day ${lastLogData[0].day}. Next: Week ${nextWeek}, Day ${nextDay}`
            );
          }

          // Fetch next workout from program_library for the calculated week and day
          const { data: workoutData, error: workoutError } = await supabase
            .from("program_library")
            .select(
              "week, day, focus, exercise, target_sets, target_reps, load_prescription_p1RM, target_rpe, target_rest, target_tempo, target_time_distance"
            )
            .eq("program_id", enrollmentData.program_id)
            .eq("week", nextWeek)
            .eq("day", nextDay);

          if (workoutError) {
            console.error("Error fetching next workout:", workoutError);
            console.log("Full error details for workout fetch:", workoutError); // Debug log for detailed error
            setNextWorkout(null); // No workout for the next day or error occurred
          } else {
            console.log(`Next workout data fetched:`, workoutData);
            setNextWorkout(
              workoutData.length > 0
                ? { week: nextWeek, day: nextDay, exercises: workoutData }
                : null
            );
          }
        }
      } catch (err) {
        console.error("Error in fetchEnrolledProgramAndNextWorkout:", err);
        setDashboardError(err.message || "Failed to load dashboard data");
        setCurrentProgram(null);
        setNextWorkout(null);
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchEnrolledProgramAndNextWorkout();
  }, [navigate]);

  // Callback to update selected exercises from DailyWorkoutLog
  const updateSelectedExercises = (updatedExercises) => {
    setSelectedExercises(updatedExercises);
  };

  const handleStartWorkout = () => {
    console.log(
      "Start Workout clicked. Current Program:",
      currentProgram,
      "Next Workout:",
      nextWorkout
    );
    console.log("Navigating to /daily-workout-log with state data.");
    if (currentProgram) {
      // Navigate to DailyWorkoutLog with pre-loaded data if available
      navigate("/daily-workout-log", {
        state: {
          programId: currentProgram.Program_ID,
          programName: currentProgram.Program_Name,
          week: nextWorkout?.week || 1,
          day: nextWorkout?.day || 1,
          exercises: nextWorkout?.exercises || [],
        },
      });
    } else {
      // Fallback to manual workout log if no program is enrolled
      console.log("No program enrolled, starting manual workout");
      setStarted(true);
    }
    console.log(
      "Navigation should have occurred. If not, check routing setup in App.jsx."
    );
  };

  const handleViewPrograms = () => {
    console.log("Navigating to /workout-programs");
    navigate("/workout-programs");
  };

  return (
    <Box p={4} maxW="100%" bg="gray.50">
      <Heading mb={6} size="lg">
        Dashboard
      </Heading>

      {/* Today's Workout Section */}
      <Box mb={6} p={4} bg="white" borderRadius="md" boxShadow="sm">
        <Heading size="md" mb={2}>
          Today's Workout
        </Heading>
        {loadingDashboard ? (
          <Spinner size="md" color="teal.500" mt={4} />
        ) : dashboardError ? (
          <Alert status="error" mt={4} mb={2}>
            <AlertIcon />
            {dashboardError}
          </Alert>
        ) : !started ? (
          <Box>
            {nextWorkout ? (
              <>
                <Text fontSize="md">
                  Scheduled: Day {nextWorkout.day} -{" "}
                  {nextWorkout.exercises[0]?.focus || "Workout"}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  From Program: {currentProgram?.Program_Name || "N/A"}
                </Text>
              </>
            ) : currentProgram ? (
              <Text fontSize="md" color="gray.500">
                No workout scheduled for today.
              </Text>
            ) : (
              <Text fontSize="md" color="gray.500">
                No program enrolled. Start a manual workout or enroll in a
                program.
              </Text>
            )}
            <Button
              colorScheme="teal"
              size="lg"
              mt={4}
              onClick={handleStartWorkout}
              aria-label="Start today's workout"
            >
              Start Workout
            </Button>
          </Box>
        ) : (
          <Box>
            <RestTimer />
            {exercisesLoading && <Spinner size="md" color="teal.500" mt={4} />}
            {exercisesError && (
              <Alert status="error" mt={4} mb={2}>
                <AlertIcon />
                {exercisesError}
              </Alert>
            )}
            {!exercisesLoading && !exercisesError && (
              <DailyWorkoutLog
                selectedExercises={selectedExercises}
                allExercises={exercises}
                onUpdateExercises={updateSelectedExercises}
              />
            )}
          </Box>
        )}
      </Box>

      {/* Exercise Library Access Area */}
      <Box mb={6} p={4} bg="white" borderRadius="md" boxShadow="sm">
        <Heading size="md" mb={2}>
          Exercise Library
        </Heading>
        <Text fontSize="sm" mb={3} color="gray.500">
          Browse exercises by muscle group or equipment.
        </Text>
        <Button
          as={Link}
          to="/exercise-library"
          colorScheme="blue"
          size="md"
          rightIcon={<ArrowForwardIcon />}
          aria-label="View Exercise Library"
        >
          View Library
        </Button>
      </Box>

      {/* Current Workout Program & Log Next Workout Day */}
      <Box mb={6} p={4} bg="white" borderRadius="md" boxShadow="sm">
        <Heading size="md" mb={2}>
          Current Program
        </Heading>
        {loadingDashboard ? (
          <Spinner size="sm" color="teal.500" />
        ) : currentProgram ? (
          <>
            <Text fontSize="md" mb={1}>
              {currentProgram.Program_Name}
            </Text>
            <Text fontSize="sm" color="gray.500" mb={2}>
              Progress:{" "}
              {nextWorkout
                ? ((nextWorkout.week - 1) / (currentProgram.Weeks || 1)) * 100
                : 0}
              % (Week {nextWorkout?.week || 1} of{" "}
              {currentProgram.Weeks || "N/A"})
            </Text>
            <Progress
              value={
                nextWorkout
                  ? ((nextWorkout.week - 1) / (currentProgram.Weeks || 1)) * 100
                  : 0
              }
              size="sm"
              colorScheme="teal"
              mb={3}
              aria-label="Program progress"
            />
            <Text fontSize="sm" mb={2}>
              Next:{" "}
              {nextWorkout
                ? `Week ${nextWorkout.week}, Day ${nextWorkout.day} - ${
                    nextWorkout.exercises[0]?.focus || "Workout"
                  }`
                : "No workout scheduled"}
            </Text>
            <Button
              colorScheme="green"
              size="md"
              onClick={handleStartWorkout}
              aria-label="Log next workout in current program"
            >
              Log Next Workout
            </Button>
          </>
        ) : (
          <>
            <Text fontSize="md" color="gray.500" mb={2}>
              No program enrolled.
            </Text>
            <Button
              colorScheme="green"
              size="md"
              onClick={handleViewPrograms}
              aria-label="Enroll in a program"
            >
              Enroll in a Program
            </Button>
          </>
        )}
      </Box>

      {/* Workout Programs Page Access */}
      <Box mb={6} p={4} bg="white" borderRadius="md" boxShadow="sm">
        <Heading size="md" mb={2}>
          Workout Programs
        </Heading>
        <Text fontSize="sm" mb={3} color="gray.500">
          Explore and select workout plans.
        </Text>
        <Button
          as={Link}
          to="/workout-programs"
          colorScheme="purple"
          size="md"
          rightIcon={<ArrowForwardIcon />}
          aria-label="Browse available workout programs"
        >
          Browse Programs
        </Button>
      </Box>

      {/* Workout History Calendar */}
      <Box mb={6} p={4} bg="white" borderRadius="md" boxShadow="sm">
        <Heading size="md" mb={2}>
          Workout History
        </Heading>
        <Text fontSize="sm" mb={3} color="gray.500">
          View your past workouts by date.
        </Text>
        <Box mb={3}>
          {/* Placeholder for Calendar Grid */}
          <Text fontSize="sm" color="gray.500">
            Calendar View (Placeholder)
          </Text>
          <Box
            display="grid"
            gridTemplateColumns="repeat(7, 1fr)"
            gap={1}
            mt={2}
          >
            {/* Mock calendar days */}
            {Array.from({ length: 28 }).map((_, i) => (
              <Box
                key={i}
                p={1}
                textAlign="center"
                bg={i % 3 === 0 ? "teal.100" : "gray.100"}
                borderRadius="sm"
                role="gridcell"
                aria-label={`Day ${i + 1}${
                  i % 3 === 0 ? ", workout completed" : ""
                }`}
              >
                <Text fontSize="xs">{i + 1}</Text>
              </Box>
            ))}
          </Box>
        </Box>
        <IconButton
          icon={<CalendarIcon />}
          colorScheme="orange"
          size="md"
          onClick={() =>
            alert("Navigate to Full Workout History (Placeholder)")
          }
          aria-label="View full workout history"
        />
      </Box>
    </Box>
  );
}

export default Dashboard;
