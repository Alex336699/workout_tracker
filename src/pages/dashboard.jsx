import { WORKOUT_FOCUS_OPTIONS, getFocusType } from "../constants/workoutFocus";
import { useState, useEffect, useMemo } from "react";
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
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  GridItem,
  Select,
  Textarea,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  Tooltip,
  Divider,
} from "@chakra-ui/react";
import {
  CalendarIcon,
  ArrowForwardIcon,
  DownloadIcon,
  InfoIcon,
} from "@chakra-ui/icons";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import RestTimer from "../components/RestTimer";
import DailyWorkoutLog from "../components/DailyWorkoutLog";
import { useExercises } from "../hooks/useExercises";
import { supabase } from "../services/supabaseClient";

const localizer = momentLocalizer(moment);

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

  // Calendar state
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [workoutFilter, setWorkoutFilter] = useState("all");
  const [monthlyStats, setMonthlyStats] = useState({});
  const [personalNotes, setPersonalNotes] = useState({});
  const [newNote, setNewNote] = useState("");
  const [energyLevel, setEnergyLevel] = useState(5);
  const [soreness, setSoreness] = useState(3);

  // Modal controls
  const {
    isOpen: isWorkoutModalOpen,
    onOpen: onWorkoutModalOpen,
    onClose: onWorkoutModalClose,
  } = useDisclosure();
  const {
    isOpen: isNotesModalOpen,
    onOpen: onNotesModalOpen,
    onClose: onNotesModalClose,
  } = useDisclosure();
  const {
    isOpen: isStatsModalOpen,
    onOpen: onStatsModalOpen,
    onClose: onStatsModalClose,
  } = useDisclosure();

  const navigate = useNavigate();

  // Fetch workout history from Supabase
  const fetchWorkoutHistory = async () => {
    try {
      setLoadingHistory(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const userId = session.user.id;

      // Fetch all workout logs for the user
      const { data: workoutLogs, error } = await supabase
        .from("Workout_Daily_Log")
        .select(
          `
          *,
          date,
          exercise,
          program_name,
          focus,
          weight_kg,
          reps,
          set,
          rpe,
          notes,
          rest,
          completed
        `
        )
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (error) throw error;

      console.log("Fetched workout history:", workoutLogs);
      setWorkoutHistory(workoutLogs);

      // Process data for calendar events
      const events = processWorkoutDataForCalendar(workoutLogs);
      setCalendarEvents(events);

      // Calculate monthly stats
      const stats = calculateMonthlyStats(workoutLogs);
      setMonthlyStats(stats);
    } catch (err) {
      console.error("Error fetching workout history:", err);
      setDashboardError(err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Process workout data into calendar events
  const processWorkoutDataForCalendar = (workoutLogs) => {
    const workoutsByDate = {};

    workoutLogs.forEach((log) => {
      const date = log.date;
      if (!workoutsByDate[date]) {
        workoutsByDate[date] = {
          date,
          exercises: [],
          totalVolume: 0,
          avgRPE: [],
          focus: log.focus || "General",
          programName: log.program_name || "Custom",
          completed: true,
        };
      }

      // Add exercise if not already added
      const existingExercise = workoutsByDate[date].exercises.find(
        (ex) => ex.exercise === log.exercise
      );
      if (!existingExercise) {
        workoutsByDate[date].exercises.push({
          exercise: log.exercise,
          sets: [],
        });
      }

      // Add set data
      const exerciseIndex = workoutsByDate[date].exercises.findIndex(
        (ex) => ex.exercise === log.exercise
      );
      workoutsByDate[date].exercises[exerciseIndex].sets.push({
        set: log.set,
        weight: log.weight_kg,
        reps: log.reps,
        rpe: log.rpe,
        rest: log.rest,
        notes: log.notes,
        completed: log.completed,
      });

      // Calculate volume and RPE
      if (log.weight_kg && log.reps) {
        workoutsByDate[date].totalVolume += log.weight_kg * log.reps;
      }
      if (log.rpe) {
        workoutsByDate[date].avgRPE.push(log.rpe);
      }
    });

    // Convert to calendar events
    return Object.values(workoutsByDate).map((workout) => {
      const avgRPE =
        workout.avgRPE.length > 0
          ? (
              workout.avgRPE.reduce((a, b) => a + b, 0) / workout.avgRPE.length
            ).toFixed(1)
          : null;

      return {
        id: workout.date,
        title: `${workout.focus} (${workout.exercises.length} exercises)`,
        start: new Date(workout.date + "T00:00:00"),
        end: new Date(workout.date + "T23:59:59"),
        allDay: true,
        resource: {
          ...workout,
          avgRPE,
          type: determineWorkoutType(workout.focus),
          intensity: calculateIntensity(avgRPE, workout.totalVolume),
        },
      };
    });
  };

  // Determine workout type based on focus
  // Determine workout type based on focus
  const determineWorkoutType = (focus) => {
    if (!focus) return "general";
    const focusLower = focus.toLowerCase();
    if (focusLower.includes("power") || focusLower.includes("speed"))
      return "power";
    if (focusLower.includes("strength")) return "strength";
    if (
      focusLower.includes("hypertrophy") ||
      focusLower.includes("muscle growth")
    )
      return "hypertrophy";
    if (
      focusLower.includes("muscular endurance") ||
      focusLower.includes("endurance")
    )
      return "endurance";
    if (
      focusLower.includes("vo2") ||
      focusLower.includes("aerobic") ||
      focusLower.includes("maximal aerobic")
    )
      return "aerobic";
    if (
      focusLower.includes("steady state") ||
      focusLower.includes("long duration")
    )
      return "cardio";
    if (
      focusLower.includes("mobility") ||
      focusLower.includes("stability") ||
      focusLower.includes("yoga")
    )
      return "mobility";
    if (focusLower.includes("other")) return "other";
    return "general";
  };

  // Calculate workout intensity
  const calculateIntensity = (avgRPE, totalVolume) => {
    if (!avgRPE) return "moderate";
    const rpe = parseFloat(avgRPE);
    if (rpe >= 8.5) return "high";
    if (rpe >= 7) return "moderate";
    return "low";
  };

  // Calculate monthly statistics
  const calculateMonthlyStats = (workoutLogs) => {
    const currentMonth = moment().format("YYYY-MM");
    const currentMonthLogs = workoutLogs.filter(
      (log) => moment(log.date).format("YYYY-MM") === currentMonth
    );

    const uniqueDates = [...new Set(currentMonthLogs.map((log) => log.date))];
    const totalVolume = currentMonthLogs.reduce(
      (sum, log) => sum + (log.weight_kg * log.reps || 0),
      0
    );
    const avgRPE =
      currentMonthLogs.filter((log) => log.rpe).length > 0
        ? currentMonthLogs
            .filter((log) => log.rpe)
            .reduce((sum, log) => sum + log.rpe, 0) /
          currentMonthLogs.filter((log) => log.rpe).length
        : 0;

    return {
      workoutDays: uniqueDates.length,
      totalVolume: Math.round(totalVolume),
      avgRPE: avgRPE.toFixed(1),
      consistency: (
        (uniqueDates.length / moment().daysInMonth()) *
        100
      ).toFixed(1),
    };
  };

  // Filter events based on workout type
  const filteredEvents = useMemo(() => {
    if (workoutFilter === "all") return calendarEvents;
    return calendarEvents.filter(
      (event) => event.resource.type === workoutFilter
    );
  }, [calendarEvents, workoutFilter]);

  // Handle event click
  const handleEventClick = (event) => {
    setSelectedWorkout(event.resource);
    setSelectedDate(event.start);
    onWorkoutModalOpen();
  };

  // Handle date click for adding notes
  const handleDateClick = (date) => {
    setSelectedDate(date);
    const dateStr = moment(date).format("YYYY-MM-DD");
    setNewNote(personalNotes[dateStr] || "");
    onNotesModalOpen();
  };

  // Save personal notes
  const savePersonalNote = async () => {
    const dateStr = moment(selectedDate).format("YYYY-MM-DD");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      // Save to a personal notes table (you might need to create this)
      const { error } = await supabase.from("user_workout_notes").upsert({
        user_id: session.user.id,
        date: dateStr,
        notes: newNote,
        energy_level: energyLevel,
        soreness: soreness,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setPersonalNotes((prev) => ({
        ...prev,
        [dateStr]: newNote,
      }));

      onNotesModalClose();
    } catch (err) {
      console.error("Error saving note:", err);
    }
  };

  // Export workout data
  const exportWorkoutData = () => {
    const csvData = workoutHistory.map((log) => ({
      Date: log.date,
      Exercise: log.exercise,
      Program: log.program_name,
      Focus: log.focus,
      Set: log.set,
      Weight: log.weight_kg,
      Reps: log.reps,
      RPE: log.rpe,
      Rest: log.rest,
      Notes: log.notes,
    }));

    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Date,Exercise,Program,Focus,Set,Weight,Reps,RPE,Rest,Notes\n" +
      csvData.map((row) => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `workout-history-${moment().format("YYYY-MM-DD")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Custom event style
  const eventStyleGetter = (event) => {
    const { type, intensity } = event.resource;

    let backgroundColor = "#3174ad";

    switch (type) {
      case "strength":
        backgroundColor = "#d53f8c";
        break;
      case "hypertrophy":
        backgroundColor = "#38a169";
        break;
      case "cardio":
        backgroundColor = "#dd6b20";
        break;
      case "mobility":
        backgroundColor = "#805ad5";
        break;
      default:
        backgroundColor = "#3182ce";
    }

    // Adjust opacity based on intensity
    const opacity =
      intensity === "high" ? 1 : intensity === "moderate" ? 0.8 : 0.6;

    return {
      style: {
        backgroundColor,
        opacity,
        border: "none",
        borderRadius: "4px",
        color: "white",
        fontSize: "12px",
        padding: "2px 4px",
      },
    };
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchEnrolledProgramAndNextWorkout = async () => {
      try {
        setLoadingDashboard(true);
        setDashboardError(null);

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

        // Fetch enrolled program
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from("user_programs")
          .select("program_id, enrolled_at")
          .eq("user_id", userId)
          .limit(1)
          .single();

        if (enrollmentError) {
          if (enrollmentError.code === "PGRST116") {
            setCurrentProgram(null);
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
            }
          } else if (lastLogData && lastLogData.length > 0) {
            nextDay = lastLogData[0].day + 1;
            nextWeek = lastLogData[0].week;
            if (nextDay > 7) {
              nextDay = 1;
              nextWeek = Math.min(nextWeek + 1, programData.Weeks || 1);
            }
          }

          const { data: workoutData, error: workoutError } = await supabase
            .from("program_library")
            .select(
              "week, day, focus, exercise, target_sets, target_reps, load_prescription_p1rm, target_weight_kg, target_rpe, target_rest, target_tempo, target_time_distance"
            )
            .eq("program_id", enrollmentData.program_id)
            .eq("week", nextWeek)
            .eq("day", nextDay);

          if (workoutError) {
            console.error("Error fetching next workout:", workoutError);
            setNextWorkout(null);
          } else {
            setNextWorkout(
              workoutData.length > 0
                ? { week: nextWeek, day: nextDay, exercises: workoutData }
                : null
            );
          }
        }

        // Fetch workout history
        await fetchWorkoutHistory();
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

  // Callback to update selected exercises
  const updateSelectedExercises = (updatedExercises) => {
    setSelectedExercises(updatedExercises);
  };

  const handleStartWorkout = () => {
    if (currentProgram) {
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
      setStarted(true);
    }
  };

  const handleViewPrograms = () => {
    navigate("/workout-programs");
  };

  if (loadingDashboard) {
    return (
      <Box p={4} textAlign="center">
        <Spinner size="lg" color="teal.500" />
        <Text mt={2}>Loading dashboard...</Text>
      </Box>
    );
  }

  return (
    <Box p={4} maxW="100%" bg="gray.50" minH="100vh">
      <Heading mb={6} size="lg">
        Dashboard
      </Heading>

      {/* Today's Workout Section */}
      <Box mb={6} p={4} bg="white" borderRadius="md" boxShadow="sm">
        <Heading size="md" mb={2}>
          Today's Workout
        </Heading>
        {dashboardError ? (
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

      {/* Monthly Stats */}
      <Grid
        templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
        gap={4}
        mb={6}
      >
        <GridItem>
          <Stat bg="white" p={4} borderRadius="md" boxShadow="sm">
            <StatLabel>Workouts This Month</StatLabel>
            <StatNumber color="teal.500">
              {monthlyStats.workoutDays || 0}
            </StatNumber>
            <StatHelpText>
              {monthlyStats.consistency || 0}% consistency
            </StatHelpText>
          </Stat>
        </GridItem>
        <GridItem>
          <Stat bg="white" p={4} borderRadius="md" boxShadow="sm">
            <StatLabel>Total Volume</StatLabel>
            <StatNumber color="blue.500">
              {monthlyStats.totalVolume || 0} kg
            </StatNumber>
            <StatHelpText>This month</StatHelpText>
          </Stat>
        </GridItem>
        <GridItem>
          <Stat bg="white" p={4} borderRadius="md" boxShadow="sm">
            <StatLabel>Avg RPE</StatLabel>
            <StatNumber color="purple.500">
              {monthlyStats.avgRPE || 0}
            </StatNumber>
            <StatHelpText>Intensity level</StatHelpText>
          </Stat>
        </GridItem>
        <GridItem>
          <Stat
            bg="white"
            p={4}
            borderRadius="md"
            boxShadow="sm"
            cursor="pointer"
            onClick={onStatsModalOpen}
          >
            <StatLabel>Detailed Stats</StatLabel>
            <StatNumber color="orange.500">
              <InfoIcon />
            </StatNumber>
            <StatHelpText>Click for more</StatHelpText>
          </Stat>
        </GridItem>
      </Grid>

      {/* Workout History Calendar */}
      <Box mb={6} p={4} bg="white" borderRadius="md" boxShadow="sm">
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">Workout History Calendar</Heading>
          <HStack spacing={2}>
            <Select
              value={workoutFilter}
              onChange={(e) => setWorkoutFilter(e.target.value)}
              size="sm"
              w="200px"
            >
              <option value="all">All Workouts</option>
              <option value="power">Power</option>
              <option value="strength">Strength</option>
              <option value="hypertrophy">Hypertrophy</option>
              <option value="endurance">Muscular Endurance</option>
              <option value="aerobic">Maximal Aerobic</option>
              <option value="cardio">Steady State</option>
              <option value="mobility">Mobility/Yoga</option>
              <option value="other">Other</option>
            </Select>
            <Button
              leftIcon={<DownloadIcon />}
              size="sm"
              colorScheme="blue"
              onClick={exportWorkoutData}
            >
              Export
            </Button>
          </HStack>
        </Flex>

        {/* Legend */}

        <Flex wrap="wrap" gap={3} mb={4} fontSize="sm">
          <Flex align="center">
            <Box w={4} h={4} bg="red.300" borderRadius="sm" mr={2} />
            <Text>Power</Text>
          </Flex>
          <Flex align="center">
            <Box w={4} h={4} bg="pink.300" borderRadius="sm" mr={2} />
            <Text>Strength</Text>
          </Flex>
          <Flex align="center">
            <Box w={4} h={4} bg="green.300" borderRadius="sm" mr={2} />
            <Text>Hypertrophy</Text>
          </Flex>
          <Flex align="center">
            <Box w={4} h={4} bg="yellow.300" borderRadius="sm" mr={2} />
            <Text>Endurance</Text>
          </Flex>
          <Flex align="center">
            <Box w={4} h={4} bg="cyan.300" borderRadius="sm" mr={2} />
            <Text>Aerobic</Text>
          </Flex>
          <Flex align="center">
            <Box w={4} h={4} bg="orange.300" borderRadius="sm" mr={2} />
            <Text>Steady State</Text>
          </Flex>
          <Flex align="center">
            <Box w={4} h={4} bg="purple.300" borderRadius="sm" mr={2} />
            <Text>Mobility/Yoga</Text>
          </Flex>
          <Flex align="center">
            <Box w={4} h={4} bg="gray.300" borderRadius="sm" mr={2} />
            <Text>Other</Text>
          </Flex>
        </Flex>

        {loadingHistory ? (
          <Flex justify="center" align="center" h="400px">
            <Spinner size="lg" color="teal.500" />
            <Text ml={3}>Loading workout history...</Text>
          </Flex>
        ) : (
          <Box h="500px">
            <Calendar
              localizer={localizer}
              events={filteredEvents}
              startAccessor="start"
              endAccessor="end"
              onSelectEvent={handleEventClick}
              onSelectSlot={({ start }) => handleDateClick(start)}
              selectable
              eventPropGetter={eventStyleGetter}
              views={["month", "week"]}
              defaultView="month"
              popup
              style={{ height: "100%" }}
            />
          </Box>
        )}
      </Box>

      {/* Quick Access Sections */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
        {/* Exercise Library Access */}
        <GridItem>
          <Box p={4} bg="white" borderRadius="md" boxShadow="sm">
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
              w="full"
            >
              View Library
            </Button>
          </Box>
        </GridItem>

        {/* Current Program */}
        <GridItem>
          <Box p={4} bg="white" borderRadius="md" boxShadow="sm">
            <Heading size="md" mb={2}>
              Current Program
            </Heading>
            {currentProgram ? (
              <>
                <Text fontSize="md" mb={1}>
                  {currentProgram.Program_Name}
                </Text>
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Progress:{" "}
                  {nextWorkout
                    ? ((nextWorkout.week - 1) / (currentProgram.Weeks || 1)) *
                      100
                    : 0}
                  % (Week {nextWorkout?.week || 1} of{" "}
                  {currentProgram.Weeks || "N/A"})
                </Text>
                <Progress
                  value={
                    nextWorkout
                      ? ((nextWorkout.week - 1) / (currentProgram.Weeks || 1)) *
                        100
                      : 0
                  }
                  size="sm"
                  colorScheme="teal"
                  mb={3}
                />
                <Button
                  colorScheme="green"
                  size="md"
                  onClick={handleStartWorkout}
                  w="full"
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
                  w="full"
                >
                  Enroll in a Program
                </Button>
              </>
            )}
          </Box>
        </GridItem>

        {/* Workout Programs */}
        <GridItem>
          <Box p={4} bg="white" borderRadius="md" boxShadow="sm">
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
              w="full"
            >
              Browse Programs
            </Button>
          </Box>
        </GridItem>
      </Grid>

      {/* Workout Detail Modal */}
      <Modal
        isOpen={isWorkoutModalOpen}
        onClose={onWorkoutModalClose}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent maxH="90vh" overflowY="auto">
          <ModalHeader>
            Workout Details -{" "}
            {selectedDate && moment(selectedDate).format("MMMM Do, YYYY")}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedWorkout && (
              <VStack spacing={4} align="stretch">
                {/* Workout Summary */}
                <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                  <Stat textAlign="center">
                    <StatLabel>Focus</StatLabel>
                    <StatNumber fontSize="lg">
                      <Badge colorScheme="teal">{selectedWorkout.focus}</Badge>
                    </StatNumber>
                  </Stat>
                  <Stat textAlign="center">
                    <StatLabel>Total Volume</StatLabel>
                    <StatNumber fontSize="lg">
                      {selectedWorkout.totalVolume} kg
                    </StatNumber>
                  </Stat>
                  <Stat textAlign="center">
                    <StatLabel>Avg RPE</StatLabel>
                    <StatNumber fontSize="lg">
                      {selectedWorkout.avgRPE || "N/A"}
                    </StatNumber>
                  </Stat>
                </Grid>

                <Divider />

                {/* Exercise Details */}
                <Box>
                  <Heading size="sm" mb={3}>
                    Exercises Performed
                  </Heading>
                  {selectedWorkout.exercises.map((exercise, idx) => (
                    <Box key={idx} p={3} bg="gray.50" borderRadius="md" mb={3}>
                      <Text fontWeight="bold" mb={2}>
                        {exercise.exercise}
                      </Text>
                      <Grid
                        templateColumns="repeat(4, 1fr)"
                        gap={2}
                        fontSize="sm"
                      >
                        <Text fontWeight="semibold">Set</Text>
                        <Text fontWeight="semibold">Weight</Text>
                        <Text fontWeight="semibold">Reps</Text>
                        <Text fontWeight="semibold">RPE</Text>
                        {exercise.sets.map((set, setIdx) => (
                          <>
                            <Text>{set.set}</Text>
                            <Text>{set.weight} kg</Text>
                            <Text>{set.reps}</Text>
                            <Text>{set.rpe || "-"}</Text>
                          </>
                        ))}
                      </Grid>
                    </Box>
                  ))}
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onWorkoutModalClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Personal Notes Modal */}
      <Modal isOpen={isNotesModalOpen} onClose={onNotesModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Add Notes -{" "}
            {selectedDate && moment(selectedDate).format("MMMM Do, YYYY")}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Personal Notes</FormLabel>
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="How did you feel today? Any observations?"
                  rows={4}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Energy Level (1-10)</FormLabel>
                <Input
                  type="range"
                  min="1"
                  max="10"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(e.target.value)}
                />
                <Text textAlign="center">{energyLevel}/10</Text>
              </FormControl>
              <FormControl>
                <FormLabel>Soreness Level (1-10)</FormLabel>
                <Input
                  type="range"
                  min="1"
                  max="10"
                  value={soreness}
                  onChange={(e) => setSoreness(e.target.value)}
                />
                <Text textAlign="center">{soreness}/10</Text>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={savePersonalNote}>
              Save Note
            </Button>
            <Button onClick={onNotesModalClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Detailed Stats Modal */}
      <Modal isOpen={isStatsModalOpen} onClose={onStatsModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Detailed Training Statistics</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>Detailed analytics coming soon...</Text>
              <Text fontSize="sm" color="gray.500">
                This will include volume trends, strength progression charts,
                recovery metrics, and personalized training recommendations.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onStatsModalClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Dashboard;
