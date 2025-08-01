import { useState, useEffect, useRef } from "react";
import {
  Box,
  Heading,
  Text,
  Input,
  Button,
  Flex,
  Table,
  Tbody,
  Tr,
  Td,
  Spinner,
  Alert,
  AlertIcon,
  Checkbox,
  Textarea,
  List,
  ListItem,
  Select,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  useBreakpointValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  IconButton,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

function DailyWorkoutLog({
  selectedExercises = [],
  allExercises = [],
  onUpdateExercises = () => {},
  selectedProgramId = null,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [previousData, setPreviousData] = useState({});
  const [programData, setProgramData] = useState({});
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().split("T")[0]
  ); // Default to today
  const [programDetails, setProgramDetails] = useState({
    program_name: location.state?.programName || "",
    program_macro_cycle: "",
    week: location.state?.week || "",
    day: location.state?.day || "",
    focus: location.state?.exercises?.[0]?.focus || "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedExerciseDetails, setSelectedExerciseDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isChangeMode, setIsChangeMode] = useState(false);
  const [editExerciseIndex, setEditExerciseIndex] = useState(null);
  const isInitialized = useRef(false); // Track if logs are already initialized
  const isDataFetched = useRef(false); // Track if data fetching is complete
  const isMobile = useBreakpointValue({ base: true, md: false }); // Determine if on mobile view

  // Fetch exercises from Supabase Exercise Library
  const fetchExerciseLibrary = async () => {
    try {
      const { data: exercises, error } = await supabase
        .from("Exercise Library")
        .select(
          "Exercise, Target_Muscle_Group, Video_Demonstration, In-Depth_Explanation, Favorite, 1_RM_Alex, Primary_Equipment, Mechanics, Force_Type"
        );
      if (error) throw error;
      console.log(
        "Fetched Exercise Library: ",
        exercises?.length || 0,
        " exercises"
      );
      setExerciseLibrary(exercises || []);
    } catch (err) {
      console.error("Error fetching Exercise Library:", err);
      setError(err.message || "Failed to fetch exercise library");
    }
  };

  // Initialize logs with pre-loaded data if available from navigation state
  useEffect(() => {
    if (isInitialized.current) {
      return; // Prevent re-initialization if already set
    }

    if (location.state?.exercises && location.state.exercises.length > 0) {
      const initialLogs = location.state.exercises.map((ex) => {
        const targetSets = parseInt(ex.target_sets) || 1;
        const targetWeight = ex.target_weight_kg || "";
        return {
          exercise: ex.exercise,
          superset: ex.superset || "",
          load_prescription: ex.load_prescription_p1RM || "",
          calculated_target_load: targetWeight,
          target_reps: ex.target_reps || "",
          rest: ex.target_rest || "",
          tempo: ex.target_tempo || "",
          time_distance: ex.target_time_distance || "",
          sets: Array.from({ length: targetSets }, () => ({
            weight: targetWeight,
            reps: ex.target_reps || "",
            rpe: ex.target_rpe || "",
            completed: false,
            notes: "",
          })),
        };
      });
      setLogs(initialLogs);
      onUpdateExercises(location.state.exercises);
      isInitialized.current = true;
      console.log(
        "Initialized logs from location.state:",
        initialLogs.length,
        "exercises"
      );
    } else if (selectedExercises.length > 0) {
      const initialLogs = selectedExercises.map((ex) => {
        const targetSets = parseInt(programData[ex.Exercise]?.target_sets) || 1;
        const targetWeight = programData[ex.Exercise]?.target_weight_kg || "";
        return {
          exercise: ex.Exercise,
          superset: programData[ex.Exercise]?.superset || "",
          load_prescription:
            programData[ex.Exercise]?.["load_prescription_p1RM"] || "",
          calculated_target_load: targetWeight,
          target_reps: programData[ex.Exercise]?.target_reps || "",
          rest: programData[ex.Exercise]?.target_rest || "",
          tempo: programData[ex.Exercise]?.target_tempo || "",
          time_distance: programData[ex.Exercise]?.target_time_distance || "",
          sets: Array.from({ length: targetSets }, () => ({
            weight: targetWeight,
            reps: programData[ex.Exercise]?.target_reps || "",
            rpe: programData[ex.Exercise]?.target_rpe || "",
            completed: false,
            notes: "",
          })),
        };
      });
      setLogs(initialLogs);
      isInitialized.current = true;
      console.log(
        "Initialized logs from selectedExercises:",
        initialLogs.length,
        "exercises"
      );
    }
  }, [location.state, selectedExercises, programData]); // Dependencies for initialization

  // Fetch previous workout data, program data, and exercise library
  useEffect(() => {
    if (isDataFetched.current) {
      return; // Prevent re-fetching if already done
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch exercise library for search and details
        await fetchExerciseLibrary();

        if (
          selectedExercises.length === 0 &&
          (!location.state?.exercises || location.state.exercises.length === 0)
        ) {
          setLoading(false);
          isDataFetched.current = true;
          return;
        }

        // Fetch previous workout logs for the exercises
        const exerciseNames =
          location.state?.exercises?.map((ex) => ex.exercise) ||
          selectedExercises.map((ex) => ex.Exercise);
        if (exerciseNames.length > 0) {
          const { data: logData, error: logError } = await supabase
            .from("Workout_Daily_Log")
            .select("exercise, weight_kg, reps, rpe")
            .in("exercise", exerciseNames)
            .order("date", { ascending: false })
            .limit(10); // Limit to recent logs for performance

          if (logError) throw logError;
          console.log(
            "Previous Logs fetched:",
            logData?.length || 0,
            "entries"
          );

          // Organize previous data by exercise for quick lookup (most recent first)
          const prevDataMap = {};
          logData.forEach((log) => {
            if (!prevDataMap[log.exercise]) {
              prevDataMap[log.exercise] = log;
            }
          });
          setPreviousData(prevDataMap);
        }

        // Fetch program data if a program is selected
        const programId = location.state?.programId || selectedProgramId;
        if (programId) {
          const { data: progData, error: progError } = await supabase
            .from("program_library")
            .select(
              "program_name, program_macro_cycle, week, day, focus, exercise, superset, target_sets, target_reps, load_prescription_p1RM, target_weight_kg, target_rpe, target_rest, target_tempo, target_time_distance"
            )
            .eq("program_id", programId); // Filter by selected program ID

          if (progError) throw progError;
          console.log(
            "Program Data fetched:",
            progData?.length || 0,
            "entries"
          );

          const progDataMap = {};
          progData.forEach((item) => {
            progDataMap[item.exercise] = item; // Map by exercise name for quick lookup
          });
          setProgramData(progDataMap);

          // Set program-wide details from the first record (assuming consistent across exercises)
          if (progData.length > 0 && !location.state?.programName) {
            setProgramDetails({
              program_name: progData[0].program_name || "",
              program_macro_cycle: progData[0].program_macro_cycle || "",
              week: progData[0].week || "",
              day: progData[0].day || "",
              focus: progData[0].focus || "",
            });
          }
        }
      } catch (err) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
        isDataFetched.current = true;
        console.log("Data fetching completed. Loading set to false.");
      }
    };

    fetchData();
  }, [selectedExercises, selectedProgramId, location.state]); // Dependencies minimized to prevent re-fetching

  // Handle input changes for various fields
  const handleInputChange = (exerciseIndex, setIndex, field, value) => {
    setLogs((prevLogs) => {
      const updatedLogs = [...prevLogs];
      if (setIndex >= 0) {
        updatedLogs[exerciseIndex].sets[setIndex][field] = value;
      } else {
        updatedLogs[exerciseIndex][field] = value;
      }
      return updatedLogs;
    });
  };

  // Handle program-wide details change
  const handleProgramDetailsChange = (field, value) => {
    setProgramDetails((prev) => ({ ...prev, [field]: value }));
  };

  // Handle superset input restriction to Y, N, or empty
  const handleSupersetChange = (exerciseIndex, value) => {
    if (value === "" || value === "Y" || value === "N") {
      setLogs((prevLogs) => {
        const updatedLogs = [...prevLogs];
        updatedLogs[exerciseIndex].superset = value;
        return updatedLogs;
      });
    }
  };

  // Add a new set for an exercise, prefilling with values from the last set
  const addSet = (exerciseIndex) => {
    setLogs((prevLogs) => {
      const updatedLogs = [...prevLogs];
      const lastSet =
        updatedLogs[exerciseIndex].sets[
          updatedLogs[exerciseIndex].sets.length - 1
        ];
      updatedLogs[exerciseIndex].sets.push({
        weight:
          lastSet.weight || updatedLogs[exerciseIndex].load_prescription || "",
        reps: lastSet.reps || updatedLogs[exerciseIndex].target_reps || "",
        rpe: lastSet.rpe || "",
        completed: false,
        notes: "",
      });
      return updatedLogs;
    });
  };

  // Delete a set from an exercise
  const deleteSet = (exerciseIndex, setIndex) => {
    setLogs((prevLogs) => {
      const updatedLogs = [...prevLogs];
      if (updatedLogs[exerciseIndex].sets.length > 1) {
        updatedLogs[exerciseIndex].sets.splice(setIndex, 1);
      }
      return updatedLogs;
    });
  };

  // Delete an exercise from the log
  const deleteExercise = (exerciseIndex) => {
    setLogs((prevLogs) => {
      const updatedLogs = [...prevLogs];
      updatedLogs.splice(exerciseIndex, 1);
      return updatedLogs;
    });
    // Update selectedExercises
    const updatedExercises = [...selectedExercises];
    updatedExercises.splice(exerciseIndex, 1);
    onUpdateExercises(updatedExercises);
  };

  // Add a new exercise to the log
  const addExerciseToLog = (exerciseName) => {
    if (!exerciseName) return;
    if (logs.some((log) => log.exercise === exerciseName)) {
      alert("Exercise already added.");
      return;
    }
    const exercise = exerciseLibrary.find((ex) => ex.Exercise === exerciseName);
    if (exercise) {
      const targetSets =
        parseInt(programData[exercise.Exercise]?.target_sets) || 1;
      const targetWeight =
        programData[exercise.Exercise]?.target_weight_kg || "";
      const newLog = {
        exercise: exercise.Exercise,
        superset: programData[exercise.Exercise]?.superset || "",
        load_prescription:
          programData[exercise.Exercise]?.["load_prescription_p1RM"] || "",
        calculated_target_load: targetWeight, // Pre-fill with target_weight_kg
        target_reps: programData[exercise.Exercise]?.target_reps || "",
        rest: programData[exercise.Exercise]?.target_rest || "",
        tempo: programData[exercise.Exercise]?.target_tempo || "",
        time_distance:
          programData[exercise.Exercise]?.target_time_distance || "",
        sets: Array.from({ length: targetSets }, () => ({
          weight: targetWeight, // Pre-fill with target_weight_kg if available
          reps: programData[exercise.Exercise]?.target_reps || "", // Pre-fill with target reps
          rpe: programData[exercise.Exercise]?.target_rpe || "",
          completed: false,
          notes: "",
        })),
      };
      setLogs((prev) => [...prev, newLog]);
      onUpdateExercises([...selectedExercises, exercise]);
      setSearchTerm("");
      setShowSearch(false);
      setIsDetailsModalOpen(false);
      setIsChangeMode(false);
    }
  };

  // Replace an existing exercise with a new one
  const replaceExercise = (exerciseIndex, newExerciseName) => {
    if (!newExerciseName) return;
    const newExercise = exerciseLibrary.find(
      (ex) => ex.Exercise === newExerciseName
    );
    if (newExercise) {
      const targetSets =
        parseInt(programData[newExercise.Exercise]?.target_sets) || 1;
      const targetWeight =
        programData[newExercise.Exercise]?.target_weight_kg || "";
      const newLog = {
        exercise: newExercise.Exercise,
        superset: programData[newExercise.Exercise]?.superset || "",
        load_prescription:
          programData[newExercise.Exercise]?.["load_prescription_p1RM"] || "",
        calculated_target_load: targetWeight, // Pre-fill with target_weight_kg
        target_reps: programData[newExercise.Exercise]?.target_reps || "",
        rest: programData[newExercise.Exercise]?.target_rest || "",
        tempo: programData[newExercise.Exercise]?.target_tempo || "",
        time_distance:
          programData[newExercise.Exercise]?.target_time_distance || "",
        sets: Array.from({ length: targetSets }, () => ({
          weight: targetWeight, // Pre-fill with target_weight_kg if available
          reps: programData[newExercise.Exercise]?.target_reps || "", // Pre-fill with target reps
          rpe: programData[newExercise.Exercise]?.target_rpe || "",
          completed: false,
          notes: "",
        })),
      };
      setLogs((prev) => {
        const updatedLogs = [...prev];
        updatedLogs[exerciseIndex] = newLog;
        return updatedLogs;
      });
      setSelectedExerciseDetails(null);
      setIsDetailsModalOpen(false);
      setIsChangeMode(false);
      setShowSearch(false);
      // Update selectedExercises
      const updatedExercises = [...selectedExercises];
      updatedExercises[exerciseIndex] = newExercise;
      onUpdateExercises(updatedExercises);
    }
  };

  // Open details modal for an exercise
  const openDetailsModal = (exerciseIndex) => {
    const exercise = logs[exerciseIndex];
    // Find additional details from exerciseLibrary if available
    const exerciseDetails =
      exerciseLibrary.find((ex) => ex.Exercise === exercise.exercise) || {};
    setSelectedExerciseDetails({
      ...exercise,
      index: exerciseIndex,
      targetMuscleGroup: exerciseDetails.Target_Muscle_Group || "N/A",
      videoDemonstration: exerciseDetails.Video_Demonstration || "",
      inDepthExplanation: exerciseDetails["In-Depth_Explanation"] || "",
      favorite: exerciseDetails.Favorite || "",
      oneRmAlex: exerciseDetails["1_RM_Alex"] || "N/A",
    });
    setIsDetailsModalOpen(true);
    setIsEditMode(false);
    setIsChangeMode(false);
    setEditExerciseIndex(exerciseIndex);
  };

  // Open change exercise mode
  const openChangeExercise = (exerciseIndex) => {
    setEditExerciseIndex(exerciseIndex);
    setIsChangeMode(true);
    setShowSearch(true);
    setSearchTerm(""); // Reset search term for a fresh search
  };

  // Save edited exercise details
  const saveEditedDetails = () => {
    if (selectedExerciseDetails) {
      // Since we're not updating program data, just log the edit (or update if needed)
      console.log(
        "Edited details saved for:",
        selectedExerciseDetails.exercise
      );
      setIsDetailsModalOpen(false);
      setSelectedExerciseDetails(null);
    }
  };

  // Handle edit field changes in modal
  const handleEditFieldChange = (field, value) => {
    setSelectedExerciseDetails((prev) => ({ ...prev, [field]: value }));
  };

  // Smart search across multiple columns with performance optimization
  const filteredExercises = searchTerm
    ? exerciseLibrary.filter((ex) => {
        const searchTerms = searchTerm.toLowerCase().split(" "); // Split search term into individual words
        const searchableFields = [
          ex.Exercise?.toLowerCase() || "",
          ex.Target_Muscle_Group?.toLowerCase() || "",
          ex.Primary_Equipment?.toLowerCase() || "",
          ex.Mechanics?.toLowerCase() || "",
          ex.Force_Type?.toLowerCase() || "",
          ex.Favorite?.toString().toLowerCase() || "",
        ].join(" "); // Combine fields into a single searchable string

        // Smart search: match all terms in any order within the combined fields
        return searchTerms.every((term) => searchableFields.includes(term));
      })
    : exerciseLibrary; // Show all exercises when no search term is entered

  // Determine if current input beats the last performance
  const getPerformanceStatus = (exercise, currentWeight, currentReps) => {
    const last = previousData[exercise];
    if (!last || !currentWeight || !currentReps)
      return { color: "gray.50", message: "" };

    const lastWeight = last["weight_kg"] || 0;
    const lastReps = last.reps || 0;
    const currentW = parseFloat(currentWeight) || 0;
    const currentR = parseInt(currentReps) || 0;

    if (
      currentW > lastWeight ||
      (currentW === lastWeight && currentR > lastReps)
    ) {
      return { color: "green.100", message: "Beating Last!" };
    } else if (
      currentW < lastWeight ||
      (currentW === lastWeight && currentR < lastReps)
    ) {
      return { color: "red.100", message: "Below Last" };
    }
    return { color: "yellow.100", message: "Matching Last" };
  };

  // Save logs to Supabase
  const saveLogs = async () => {
    setSaving(true);
    try {
      setError(null);
      setSuccessMessage(null);

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
      const logEntries = [];

      logs.forEach((log) => {
        log.sets.forEach((set, setIndex) => {
          if (set.weight && set.reps) {
            // Only save sets with data
            const last = previousData[log.exercise];
            const previousRepKg = last
              ? `${last.reps} x ${last["weight_kg"]}kg`
              : "N/A";
            logEntries.push({
              exercise: log.exercise,
              program_name: programDetails.program_name || "N/A",
              program_macro_cycle: programDetails.program_macro_cycle || "N/A",
              week: programDetails.week || "N/A",
              day: programDetails.day || "N/A",
              focus: programDetails.focus || "N/A",
              superset: log.superset || "N/A",
              set: setIndex + 1, // Set number
              weight_kg: parseFloat(set.weight) || 0,
              reps: parseInt(set.reps) || 0,
              rpe: set.rpe ? parseFloat(set.rpe) || 0 : null,
              load_prescription_p1rm: log.load_prescription || "N/A",
              calculated_target_load: log.calculated_target_load || "N/A",
              target_reps: log.target_reps || "N/A",
              previous_rep_x_kg: previousRepKg,
              rest: log.rest || "N/A",
              tempo: log.tempo || "N/A",
              time_distance: log.time_distance || "N/A",
              completed: set.completed || false,
              notes: set.notes || "",
              date: currentDate || new Date().toISOString().split("T")[0],
              user_id: userId,
              program_id:
                location.state?.programId || selectedProgramId || "N/A",
            });
          }
        });
      });

      if (logEntries.length === 0) {
        alert("No complete sets to save. Please enter weight and reps.");
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from("Workout_Daily_Log")
        .insert(logEntries);
      if (error) throw error;

      setSuccessMessage("Workout logs saved successfully!");
      setTimeout(() => {
        setLogs([]);
        onUpdateExercises([]);
        navigate("/"); // Redirect to dashboard after saving
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to save workout logs");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spinner size="md" color="teal.500" mt={4} />;
  }

  if (error) {
    return (
      <Alert status="error" mt={4}>
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  if (successMessage) {
    return (
      <Alert status="success" mt={4}>
        <AlertIcon />
        {successMessage}
      </Alert>
    );
  }

  return (
    <Box
      mt={6}
      p={{ base: 2, md: 4 }}
      bg="gray.50"
      borderRadius="md"
      maxW="100%"
    >
      <Heading size="md" mb={4}>
        Daily Workout Log
      </Heading>
      <Box mb={4}>
        <Text mb={2}>Log Details:</Text>
        <Flex gap={2} wrap="wrap" direction={{ base: "column", md: "row" }}>
          <FormControl width={{ base: "full", md: "200px" }}>
            <FormLabel fontSize={{ base: "sm", md: "md" }}>Date</FormLabel>
            <Input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              size={{ base: "md", md: "sm" }}
            />
          </FormControl>
          <FormControl width={{ base: "full", md: "200px" }}>
            <FormLabel fontSize={{ base: "sm", md: "md" }}>
              Program Name
            </FormLabel>
            <Input
              value={programDetails.program_name}
              onChange={(e) =>
                handleProgramDetailsChange("program_name", e.target.value)
              }
              size={{ base: "md", md: "sm" }}
            />
          </FormControl>
          <FormControl width={{ base: "full", md: "200px" }}>
            <FormLabel fontSize={{ base: "sm", md: "md" }}>
              Macro Cycle
            </FormLabel>
            <Input
              value={programDetails.program_macro_cycle}
              onChange={(e) =>
                handleProgramDetailsChange(
                  "program_macro_cycle",
                  e.target.value
                )
              }
              size={{ base: "md", md: "sm" }}
            />
          </FormControl>
          <FormControl width={{ base: "full", md: "100px" }}>
            <FormLabel fontSize={{ base: "sm", md: "md" }}>Week</FormLabel>
            <Input
              value={programDetails.week}
              onChange={(e) =>
                handleProgramDetailsChange("week", e.target.value)
              }
              size={{ base: "md", md: "sm" }}
            />
          </FormControl>
          <FormControl width={{ base: "full", md: "100px" }}>
            <FormLabel fontSize={{ base: "sm", md: "md" }}>Day</FormLabel>
            <Input
              value={programDetails.day}
              onChange={(e) =>
                handleProgramDetailsChange("day", e.target.value)
              }
              size={{ base: "md", md: "sm" }}
            />
          </FormControl>
          <FormControl width={{ base: "full", md: "150px" }}>
            <FormLabel fontSize={{ base: "sm", md: "md" }}>Focus</FormLabel>
            <Input
              value={programDetails.focus}
              onChange={(e) =>
                handleProgramDetailsChange("focus", e.target.value)
              }
              size={{ base: "md", md: "sm" }}
            />
          </FormControl>
        </Flex>
      </Box>
      {logs.length > 0 ? (
        logs.map((log, exerciseIndex) => (
          <Box
            key={exerciseIndex}
            mb={6}
            p={{ base: 2, md: 3 }}
            bg="white"
            borderRadius="md"
            boxShadow="sm"
          >
            <Flex justify="space-between" align="center" mb={2}>
              <Heading
                size="sm"
                onClick={() => openDetailsModal(exerciseIndex)}
                cursor="pointer"
                _hover={{ color: "teal.500" }}
              >
                {log.exercise}
              </Heading>
              <HStack spacing={2}>
                <IconButton
                  icon={<EditIcon />}
                  colorScheme="blue"
                  size="sm"
                  onClick={() => openChangeExercise(exerciseIndex)}
                  aria-label="Change Exercise"
                />
                <IconButton
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  size="sm"
                  onClick={() => deleteExercise(exerciseIndex)}
                  aria-label="Delete Exercise"
                />
              </HStack>
            </Flex>
            {previousData[log.exercise] && (
              <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" mb={2}>
                Last: {previousData[log.exercise]["weight_kg"]}kg x{" "}
                {previousData[log.exercise].reps}
                {previousData[log.exercise].rpe
                  ? ` (RPE: ${previousData[log.exercise].rpe})`
                  : ""}
              </Text>
            )}
            <Box mb={3}>
              <Text fontSize={{ base: "xs", md: "sm" }} mb={1}>
                Exercise Details (Editable):
              </Text>
              <Flex
                gap={2}
                wrap="wrap"
                direction={{ base: "column", md: "row" }}
              >
                <FormControl width={{ base: "full", md: "100px" }}>
                  <FormLabel fontSize={{ base: "xs", md: "sm" }}>
                    Superset
                  </FormLabel>
                  <Select
                    value={log.superset || ""}
                    onChange={(e) =>
                      handleSupersetChange(exerciseIndex, e.target.value)
                    }
                    size={{ base: "md", md: "xs" }}
                  >
                    <option value="">None</option>
                    <option value="Y">Y</option>
                    <option value="N">N</option>
                  </Select>
                </FormControl>
                <FormControl width={{ base: "full", md: "150px" }}>
                  <FormLabel fontSize={{ base: "xs", md: "sm" }}>
                    %1RM
                  </FormLabel>
                  <Input
                    value={log.load_prescription}
                    onChange={(e) =>
                      handleInputChange(
                        exerciseIndex,
                        -1,
                        "load_prescription",
                        e.target.value
                      )
                    }
                    size={{ base: "md", md: "xs" }}
                  />
                </FormControl>
                <FormControl width={{ base: "full", md: "150px" }}>
                  <FormLabel fontSize={{ base: "xs", md: "sm" }}>
                    Calc. Target Load
                  </FormLabel>
                  <Input
                    value={log.calculated_target_load}
                    onChange={(e) =>
                      handleInputChange(
                        exerciseIndex,
                        -1,
                        "calculated_target_load",
                        e.target.value
                      )
                    }
                    size={{ base: "md", md: "xs" }}
                  />
                </FormControl>
                <FormControl width={{ base: "full", md: "100px" }}>
                  <FormLabel fontSize={{ base: "xs", md: "sm" }}>
                    Target Reps
                  </FormLabel>
                  <Input
                    value={log.target_reps}
                    onChange={(e) =>
                      handleInputChange(
                        exerciseIndex,
                        -1,
                        "target_reps",
                        e.target.value
                      )
                    }
                    size={{ base: "md", md: "xs" }}
                  />
                </FormControl>
                <FormControl width={{ base: "full", md: "80px" }}>
                  <FormLabel fontSize={{ base: "xs", md: "sm" }}>
                    Rest
                  </FormLabel>
                  <Input
                    value={log.rest}
                    onChange={(e) =>
                      handleInputChange(
                        exerciseIndex,
                        -1,
                        "rest",
                        e.target.value
                      )
                    }
                    size={{ base: "md", md: "xs" }}
                  />
                </FormControl>
                <FormControl width={{ base: "full", md: "80px" }}>
                  <FormLabel fontSize={{ base: "xs", md: "sm" }}>
                    Tempo
                  </FormLabel>
                  <Input
                    value={log.tempo}
                    onChange={(e) =>
                      handleInputChange(
                        exerciseIndex,
                        -1,
                        "tempo",
                        e.target.value
                      )
                    }
                    size={{ base: "md", md: "xs" }}
                  />
                </FormControl>
                <FormControl width={{ base: "full", md: "120px" }}>
                  <FormLabel fontSize={{ base: "xs", md: "sm" }}>
                    Time/Distance
                  </FormLabel>
                  <Input
                    value={log.time_distance}
                    onChange={(e) =>
                      handleInputChange(
                        exerciseIndex,
                        -1,
                        "time_distance",
                        e.target.value
                      )
                    }
                    size={{ base: "md", md: "xs" }}
                  />
                </FormControl>
              </Flex>
            </Box>
            {isMobile ? (
              <VStack spacing={3} align="stretch" mb={2}>
                {log.sets.map((set, setIndex) => (
                  <Box
                    key={setIndex}
                    p={2}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                  >
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontWeight="bold">Set {setIndex + 1}</Text>
                      {log.sets.length > 1 && (
                        <IconButton
                          icon={<DeleteIcon />}
                          colorScheme="red"
                          size="xs"
                          onClick={() => deleteSet(exerciseIndex, setIndex)}
                          aria-label="Delete Set"
                        />
                      )}
                    </Flex>
                    <Flex direction="column" gap={2}>
                      <FormControl>
                        <FormLabel fontSize="xs">Weight (kg)</FormLabel>
                        <Input
                          type="number"
                          value={set.weight}
                          onChange={(e) =>
                            handleInputChange(
                              exerciseIndex,
                              setIndex,
                              "weight",
                              e.target.value
                            )
                          }
                          size="md"
                          bg={
                            getPerformanceStatus(
                              log.exercise,
                              set.weight,
                              set.reps
                            ).color
                          }
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="xs">Reps</FormLabel>
                        <Input
                          type="number"
                          value={set.reps}
                          onChange={(e) =>
                            handleInputChange(
                              exerciseIndex,
                              setIndex,
                              "reps",
                              e.target.value
                            )
                          }
                          size="md"
                          bg={
                            getPerformanceStatus(
                              log.exercise,
                              set.weight,
                              set.reps
                            ).color
                          }
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="xs">RPE (1-10)</FormLabel>
                        <Input
                          type="number"
                          value={set.rpe}
                          onChange={(e) =>
                            handleInputChange(
                              exerciseIndex,
                              setIndex,
                              "rpe",
                              e.target.value
                            )
                          }
                          size="md"
                          bg="gray.50"
                        />
                      </FormControl>
                      <FormControl>
                        <Flex align="center">
                          <Checkbox
                            isChecked={set.completed}
                            onChange={(e) =>
                              handleInputChange(
                                exerciseIndex,
                                setIndex,
                                "completed",
                                e.target.checked
                              )
                            }
                            size="md"
                            mr={2}
                          />
                          <FormLabel fontSize="xs" mb={0}>
                            Done
                          </FormLabel>
                        </Flex>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="xs">Notes</FormLabel>
                        <Textarea
                          value={set.notes}
                          onChange={(e) =>
                            handleInputChange(
                              exerciseIndex,
                              setIndex,
                              "notes",
                              e.target.value
                            )
                          }
                          size="md"
                          rows={2}
                        />
                      </FormControl>
                      <Text
                        fontSize="xs"
                        color={
                          getPerformanceStatus(
                            log.exercise,
                            set.weight,
                            set.reps
                          ).color !== "gray.50"
                            ? getPerformanceStatus(
                                log.exercise,
                                set.weight,
                                set.reps
                              ).color.replace(".100", ".700")
                            : "gray.500"
                        }
                      >
                        {
                          getPerformanceStatus(
                            log.exercise,
                            set.weight,
                            set.reps
                          ).message
                        }
                      </Text>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Table variant="simple" size="sm" mb={2}>
                <Tbody>
                  {log.sets.map((set, setIndex) => {
                    const status = getPerformanceStatus(
                      log.exercise,
                      set.weight,
                      set.reps
                    );
                    return (
                      <Tr key={setIndex}>
                        <Td width="10%">
                          <Flex align="center">
                            Set {setIndex + 1}
                            {log.sets.length > 1 && (
                              <IconButton
                                icon={<DeleteIcon />}
                                colorScheme="red"
                                size="xs"
                                ml={2}
                                onClick={() =>
                                  deleteSet(exerciseIndex, setIndex)
                                }
                                aria-label="Delete Set"
                              />
                            )}
                          </Flex>
                        </Td>
                        <Td width="20%">
                          <Input
                            placeholder="Weight (kg)"
                            type="number"
                            value={set.weight}
                            onChange={(e) =>
                              handleInputChange(
                                exerciseIndex,
                                setIndex,
                                "weight",
                                e.target.value
                              )
                            }
                            size="sm"
                            bg={status.color}
                          />
                        </Td>
                        <Td width="20%">
                          <Input
                            placeholder="Reps"
                            type="number"
                            value={set.reps}
                            onChange={(e) =>
                              handleInputChange(
                                exerciseIndex,
                                setIndex,
                                "reps",
                                e.target.value
                              )
                            }
                            size="sm"
                            bg={status.color}
                          />
                        </Td>
                        <Td width="15%">
                          <Input
                            placeholder="RPE (1-10)"
                            type="number"
                            value={set.rpe}
                            onChange={(e) =>
                              handleInputChange(
                                exerciseIndex,
                                setIndex,
                                "rpe",
                                e.target.value
                              )
                            }
                            size="sm"
                            bg="gray.50"
                          />
                        </Td>
                        <Td width="10%">
                          <Checkbox
                            isChecked={set.completed}
                            onChange={(e) =>
                              handleInputChange(
                                exerciseIndex,
                                setIndex,
                                "completed",
                                e.target.checked
                              )
                            }
                            size="md"
                          >
                            Done
                          </Checkbox>
                        </Td>
                        <Td width="25%">
                          <Textarea
                            placeholder="Notes"
                            value={set.notes}
                            onChange={(e) =>
                              handleInputChange(
                                exerciseIndex,
                                setIndex,
                                "notes",
                                e.target.value
                              )
                            }
                            size="sm"
                            rows={1}
                          />
                        </Td>
                        <Td width="10%">
                          <Text
                            fontSize="xs"
                            color={
                              status.color !== "gray.50"
                                ? status.color.replace(".100", ".700")
                                : "gray.500"
                            }
                          >
                            {status.message}
                          </Text>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            )}
            <Button
              colorScheme="gray"
              size="sm"
              onClick={() => addSet(exerciseIndex)}
              mb={2}
            >
              Add Set
            </Button>
          </Box>
        ))
      ) : (
        <Text mt={4} mb={4} color="gray.500">
          No exercises added yet. Add an exercise to start logging.
        </Text>
      )}
      <Box mt={4}>
        <Button
          colorScheme="blue"
          size="md"
          onClick={() => setShowSearch(!showSearch)}
          mb={2}
        >
          {showSearch ? "Cancel" : "Add New Exercise"}
        </Button>
        {showSearch && (
          <Box
            mt={2}
            p={{ base: 2, md: 3 }}
            bg="white"
            borderRadius="md"
            boxShadow="md"
          >
            <Heading size="sm" mb={2}>
              Add Exercise
            </Heading>
            <Input
              placeholder="Search exercises by name, muscle group, equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="md"
              mb={2}
              width={{ base: "full", md: "400px" }}
            />
            {searchTerm && (
              <Box
                maxH="300px"
                overflowY="auto"
                bg="white"
                borderRadius="md"
                boxShadow="md"
                p={2}
                mt={-2}
              >
                <List spacing={1}>
                  {filteredExercises.length === 0 && (
                    <ListItem>
                      <Text fontSize="sm" color="gray.500">
                        No matching exercises found.
                      </Text>
                    </ListItem>
                  )}
                  {filteredExercises.map((ex) => (
                    <ListItem
                      key={ex.Exercise}
                      p={2}
                      borderRadius="sm"
                      _hover={{ bg: "gray.100", cursor: "pointer" }}
                      onClick={() => {
                        if (isChangeMode) {
                          replaceExercise(editExerciseIndex, ex.Exercise);
                        } else {
                          addExerciseToLog(ex.Exercise);
                        }
                      }}
                      borderBottom="1px solid"
                      borderColor="gray.200"
                    >
                      <Text fontWeight="bold" fontSize="md">
                        {ex.Exercise}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        Target: {ex.Target_Muscle_Group || "N/A"} | Equipment:{" "}
                        {ex.Primary_Equipment || "N/A"} | Mechanics:{" "}
                        {ex.Mechanics || "N/A"}
                      </Text>
                      <Flex gap={2} mt={1}>
                        {ex.Video_Demonstration && (
                          <Text
                            fontSize="xs"
                            color="blue.500"
                            as="a"
                            href={ex.Video_Demonstration}
                            target="_blank"
                            rel="noopener noreferrer"
                            _hover={{ textDecoration: "underline" }}
                          >
                            Video Demo
                          </Text>
                        )}
                        {ex["In-Depth_Explanation"] && (
                          <Text
                            fontSize="xs"
                            color="blue.500"
                            as="a"
                            href={ex["In-Depth_Explanation"]}
                            target="_blank"
                            rel="noopener noreferrer"
                            _hover={{ textDecoration: "underline" }}
                          >
                            Explanation
                          </Text>
                        )}
                      </Flex>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            <Select
              placeholder="Or select from list"
              size="sm"
              mt={2}
              width={{ base: "full", md: "400px" }}
              onChange={(e) => {
                if (e.target.value) {
                  if (isChangeMode) {
                    replaceExercise(editExerciseIndex, e.target.value);
                  } else {
                    addExerciseToLog(e.target.value);
                  }
                }
              }}
            >
              {exerciseLibrary.map((ex) => (
                <option key={ex.Exercise} value={ex.Exercise}>
                  {ex.Exercise}
                </option>
              ))}
            </Select>
          </Box>
        )}
      </Box>
      <Flex justify="center" mt={4}>
        <Button
          colorScheme="teal"
          size="lg"
          onClick={saveLogs}
          isLoading={saving}
          w={{ base: "full", md: "auto" }}
          isDisabled={logs.length === 0}
        >
          Save Workout Log
        </Button>
      </Flex>

      {/* Details Modal for Exercise */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        size={{ base: "full", md: "lg" }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedExerciseDetails?.exercise || "Exercise Details"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedExerciseDetails && (
              <VStack spacing={3} align="stretch">
                <Text fontWeight="bold">
                  Exercise: {selectedExerciseDetails.exercise}
                </Text>
                {isEditMode ? (
                  <>
                    <FormControl>
                      <FormLabel>Target Muscle Group</FormLabel>
                      <Input
                        value={selectedExerciseDetails.targetMuscleGroup}
                        onChange={(e) =>
                          handleEditFieldChange(
                            "targetMuscleGroup",
                            e.target.value
                          )
                        }
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Video Demonstration Link</FormLabel>
                      <Input
                        value={selectedExerciseDetails.videoDemonstration}
                        onChange={(e) =>
                          handleEditFieldChange(
                            "videoDemonstration",
                            e.target.value
                          )
                        }
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>In-Depth Explanation Link</FormLabel>
                      <Input
                        value={selectedExerciseDetails.inDepthExplanation}
                        onChange={(e) =>
                          handleEditFieldChange(
                            "inDepthExplanation",
                            e.target.value
                          )
                        }
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Favorite</FormLabel>
                      <Select
                        value={selectedExerciseDetails.favorite || ""}
                        onChange={(e) =>
                          handleEditFieldChange("favorite", e.target.value)
                        }
                      >
                        <option value="">None</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel>1 RM Alex (kg)</FormLabel>
                      <Input
                        type="number"
                        value={selectedExerciseDetails.oneRmAlex}
                        onChange={(e) =>
                          handleEditFieldChange("oneRmAlex", e.target.value)
                        }
                      />
                    </FormControl>
                  </>
                ) : (
                  <>
                    <Text>
                      Target Muscle Group:{" "}
                      {selectedExerciseDetails.targetMuscleGroup}
                    </Text>
                    {selectedExerciseDetails.videoDemonstration ? (
                      <Text>
                        Video Demonstration:{" "}
                        <Text
                          as="a"
                          color="blue.500"
                          href={selectedExerciseDetails.videoDemonstration}
                          target="_blank"
                          rel="noopener noreferrer"
                          _hover={{ textDecoration: "underline" }}
                        >
                          Watch Video
                        </Text>
                      </Text>
                    ) : (
                      <Text>Video Demonstration: N/A</Text>
                    )}
                    {selectedExerciseDetails.inDepthExplanation ? (
                      <Text>
                        In-Depth Explanation:{" "}
                        <Text
                          as="a"
                          color="blue.500"
                          href={selectedExerciseDetails.inDepthExplanation}
                          target="_blank"
                          rel="noopener noreferrer"
                          _hover={{ textDecoration: "underline" }}
                        >
                          Read More
                        </Text>
                      </Text>
                    ) : (
                      <Text>In-Depth Explanation: N/A</Text>
                    )}
                    <Text>
                      Favorite: {selectedExerciseDetails.favorite || "N/A"}
                    </Text>
                    <Text>
                      1 RM Alex: {selectedExerciseDetails.oneRmAlex} kg
                    </Text>
                  </>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            {!isEditMode && !isChangeMode && (
              <>
                <Button
                  colorScheme="teal"
                  mr={3}
                  onClick={() => setIsEditMode(true)}
                >
                  Edit Details
                </Button>
              </>
            )}
            {isEditMode && (
              <Button colorScheme="teal" mr={3} onClick={saveEditedDetails}>
                Save Changes
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => setIsDetailsModalOpen(false)}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default DailyWorkoutLog;
