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
  const [showChangeSearchModal, setShowChangeSearchModal] = useState(false);
  const [selectedExerciseDetails, setSelectedExerciseDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isChangeMode, setIsChangeMode] = useState(false);
  const [editExerciseIndex, setEditExerciseIndex] = useState(null);
  const isInitialized = useRef(false); // Track if logs are already initialized
  const isDataFetched = useRef(false); // Track if data fetching is complete
  const isMobile = useBreakpointValue({ base: true, md: false }); // Determine if on mobile view

  // Fetch exercises from Supabase Exercise Library with pagination to get all records
  const fetchExerciseLibrary = async () => {
    try {
      let allExercises = [];
      let page = 0;
      const pageSize = 1000; // Supabase default limit per request
      let hasMore = true;

      while (hasMore) {
        const { data: exercises, error } = await supabase
          .from("Exercise Library")
          .select(
            "Exercise, Target_Muscle_Group, Video_Demonstration, In-Depth_Explanation, Favorite, 1_RM_Alex, Primary_Equipment, Mechanics, Force_Type"
          )
          .range(page * pageSize, (page + 1) * pageSize - 1); // Fetch in chunks

        if (error) throw error;
        if (exercises.length === 0) {
          hasMore = false;
        } else {
          allExercises = [...allExercises, ...exercises];
          page++;
        }
      }

      console.log(
        "Fetched Exercise Library: ",
        allExercises.length,
        " exercises"
      );
      setExerciseLibrary(allExercises);
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
      setShowChangeSearchModal(false);
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
      setShowChangeSearchModal(false);
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
      exerciseLibrary.find(
        (ex) =>
          ex.Exercise.trim().toLowerCase() ===
          exercise.exercise.trim().toLowerCase()
      ) || {};
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
    setShowChangeSearchModal(true);
    setShowSearch(false); // Ensure the bottom search is closed to avoid confusion
    setSearchTerm(""); // Reset search term for a fresh search
  };

  // Save edited exercise details to Supabase
  const saveEditedDetails = async () => {
    if (!selectedExerciseDetails) return;

    try {
      setSaving(true);
      setError(null);

      // Check authentication first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("You must be logged in to update exercise details");
        return;
      }

      console.log("=== DEBUGGING SUPABASE UPDATE ===");
      console.log("Exercise name:", selectedExerciseDetails.exercise);
      
      // First, let's try to find the exact record
      const { data: findData, error: findError } = await supabase
        .from("Exercise Library")
        .select("*")
        .eq("Exercise", selectedExerciseDetails.exercise);
      
      console.log("Found records:", findData);
      console.log("Find error:", findError);
      
      if (findError) throw findError;
      if (!findData || findData.length === 0) {
        throw new Error(`Exercise "${selectedExerciseDetails.exercise}" not found in database`);
      }

      // Prepare the update data
      const updateData = {
        Target_Muscle_Group: selectedExerciseDetails.targetMuscleGroup,
        Video_Demonstration: selectedExerciseDetails.videoDemonstration,
        "In-Depth_Explanation": selectedExerciseDetails.inDepthExplanation,
        Favorite: selectedExerciseDetails.favorite,
        "1_RM_Alex": selectedExerciseDetails.oneRmAlex
      };

      console.log("Update data:", updateData);

      // Update the Exercise Library table
      const { data: updateResult, error: updateError } = await supabase
        .from("Exercise Library")
        .update(updateData)
        .eq("Exercise", selectedExerciseDetails.exercise)
        .select();

      console.log("Update result:", updateResult);
      console.log("Update error:", updateError);

      if (updateError) throw updateError;

      // Check if any rows were actually updated
      if (!updateResult || updateResult.length === 0) {
        throw new Error(`No exercise found with name: "${selectedExerciseDetails.exercise}"`);
      }

      // Update local state to reflect changes
      setExerciseLibrary(prevLibrary => 
        prevLibrary.map(ex => 
          ex.Exercise === selectedExerciseDetails.exercise 
            ? { ...ex, ...updateData }
            : ex
        )
      );

      setSuccessMessage(`Exercise details updated successfully! Updated ${updateResult.length} record(s).`);
      setIsDetailsModalOpen(false);
      setSelectedExerciseDetails(null);
      setIsEditMode(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err) {
      console.error("Error updating exercise details:", err);
      setError(err.message || "Failed to update exercise details");
    } finally {
      setSaving(false);
    }
  };

  // Handle edit field changes in modal with enhanced validation
  const handleEditFieldChange = (field, value) => {
    console.log(`Changing ${field} to:`, value, typeof value);
    
    // Special handling for 1RM field to prevent number input issues
    if (field === "oneRmAlex") {
      console.log("1RM value being set:", value);
      // Allow empty, "N/A", or valid numbers
      if (value === "" || value === "N/A" || value.toLowerCase() === "n/a" || !isNaN(parseFloat(value))) {
        setSelectedExerciseDetails(prev => ({ ...prev, [field]: value }));
      }
      return;
    }
    
    // Handle all other fields normally
    setSelectedExerciseDetails(prev => ({ ...prev, [field]: value }));
  };

  // Smart search across multiple columns
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

// ADD DEBUGGING CODE HERE
  useEffect(() => {
    console.log("=== DEBUGGING VALUES ===");
    logs.forEach((log, logIndex) => {
      console.log(`Exercise ${logIndex}: ${log.exercise}`);
      log.sets.forEach((set, setIndex) => {
        console.log(`  Set ${setIndex}:`, {
          weight: set.weight,
          weightType: typeof set.weight,
          reps: set.reps,
          repsType: typeof set.reps,
          rpe: set.rpe,
          rpeType: typeof set.rpe
        });
      });
    });
    
    if (selectedExerciseDetails) {
      console.log("Selected exercise details:", {
        oneRmAlex: selectedExerciseDetails.oneRmAlex,
        oneRmAlexType: typeof selectedExerciseDetails.oneRmAlex
      });
    }
  }, [logs, selectedExerciseDetails]);


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
                          colorScheme

