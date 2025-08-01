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
} from "@chakra-ui/react";
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
  const isInitialized = useRef(false); // Track if logs are already initialized
  const isDataFetched = useRef(false); // Track if data fetching is complete

  // Initialize logs with pre-loaded data if available from navigation state
  useEffect(() => {
    if (isInitialized.current) {
      console.log("Logs already initialized, skipping re-initialization.");
      return; // Prevent re-initialization if already set
    }

    console.log("Initializing logs. Location State:", location.state);
    if (location.state?.exercises && location.state.exercises.length > 0) {
      const initialLogs = location.state.exercises.map((ex) => {
        const targetSets = parseInt(ex.target_sets) || 1; // Default to 1 set if not defined
        const targetWeight = ex.target_weight_kg || ""; // Use target_weight_kg if available
        console.log(`Exercise: ${ex.exercise}, Target Weight: ${targetWeight}`);
        return {
          exercise: ex.exercise,
          superset: ex.superset || "",
          load_prescription: ex.load_prescription_p1RM || "",
          calculated_target_load: "", // Adjust if calculated elsewhere
          target_reps: ex.target_reps || "",
          rest: ex.target_rest || "",
          tempo: ex.target_tempo || "",
          time_distance: ex.target_time_distance || "",
          sets: Array.from({ length: targetSets }, () => ({
            weight: targetWeight, // Pre-fill with target_weight_kg if available
            reps: ex.target_reps || "", // Pre-fill with target reps
            rpe: ex.target_rpe || "",
            completed: false,
            notes: "",
          })),
        };
      });
      setLogs(initialLogs);
      // Update selectedExercises if passed through props or state, but avoid triggering re-render loop
      if (!isInitialized.current) {
        onUpdateExercises(location.state.exercises);
      }
      isInitialized.current = true;
      console.log("Initialized logs from location.state:", initialLogs);
    } else if (selectedExercises.length > 0) {
      const initialLogs = selectedExercises.map((ex) => {
        const targetSets = parseInt(programData[ex.Exercise]?.target_sets) || 1; // Default to 1 set if not defined
        const targetWeight = programData[ex.Exercise]?.target_weight_kg || ""; // Use target_weight_kg if available
        console.log(
          `Exercise: ${ex.Exercise}, Target Weight from programData: ${targetWeight}`
        );
        return {
          exercise: ex.Exercise,
          superset: programData[ex.Exercise]?.superset || "",
          load_prescription:
            programData[ex.Exercise]?.["load_prescription_p1RM"] || "",
          calculated_target_load:
            programData[ex.Exercise]?.calculated_target_load || "",
          target_reps: programData[ex.Exercise]?.target_reps || "",
          rest: programData[ex.Exercise]?.target_rest || "",
          tempo: programData[ex.Exercise]?.target_tempo || "",
          time_distance: programData[ex.Exercise]?.target_time_distance || "",
          sets: Array.from({ length: targetSets }, () => ({
            weight: targetWeight, // Pre-fill with target_weight_kg if available
            reps: programData[ex.Exercise]?.target_reps || "", // Pre-fill with target reps
            rpe: programData[ex.Exercise]?.target_rpe || "",
            completed: false,
            notes: "",
          })),
        };
      });
      setLogs(initialLogs);
      isInitialized.current = true;
      console.log("Initialized logs from selectedExercises:", initialLogs);
    }
  }, [location.state, selectedExercises]); // Dependencies for initialization

  // Fetch previous workout data and program data
  useEffect(() => {
    if (isDataFetched.current) {
      console.log("Data already fetched, skipping re-fetch.");
      setLoading(false); // Ensure loading is false if data is already fetched
      return; // Prevent re-fetching if already done
    }

    const fetchData = async () => {
      if (
        selectedExercises.length === 0 &&
        (!location.state?.exercises || location.state.exercises.length === 0)
      ) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log(
          "Fetching data for exercises:",
          selectedExercises.length,
          "or location state:",
          location.state?.exercises?.length || 0
        );

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
          console.log("Previous Logs:", logData);

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
          console.log("Program Data:", progData);

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
        isDataFetched.current = true; // Mark data fetching as complete
        console.log("Data fetching completed. Loading set to false.");
      }
    };

    fetchData();
  }, [selectedExercises, selectedProgramId, location.state, allExercises]);

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

  // Add a new exercise to the log
  const addExerciseToLog = (exerciseName) => {
    if (!exerciseName) return;
    if (selectedExercises.some((ex) => ex.Exercise === exerciseName)) {
      alert("Exercise already added.");
      return;
    }
    const exercise = allExercises.find((ex) => ex.Exercise === exerciseName);
    if (exercise) {
      const targetSets =
        parseInt(programData[exercise.Exercise]?.target_sets) || 1;
      const targetWeight =
        programData[exercise.Exercise]?.target_weight_kg || "";
      console.log(
        `Adding Exercise: ${exercise.Exercise}, Target Weight: ${targetWeight}`
      );
      const newLog = {
        exercise: exercise.Exercise,
        superset: programData[exercise.Exercise]?.superset || "",
        load_prescription:
          programData[exercise.Exercise]?.["load_prescription_p1RM"] || "",
        calculated_target_load:
          programData[exercise.Exercise]?.calculated_target_load || "",
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
    }
  };

  // Advanced search across multiple columns
  const filteredExercises = searchTerm
    ? allExercises.filter((ex) => {
        const terms = searchTerm.toLowerCase().split(" "); // Split search term into words
        const searchableFields = [
          ex.Exercise?.toLowerCase() || "",
          ex.Target_Muscle_Group?.toLowerCase() || "",
          ex.Primary_Equipment?.toLowerCase() || "",
          ex.Mechanics?.toLowerCase() || "",
          ex.Force_Type?.toLowerCase() || "",
          ex.Favorite?.toString().toLowerCase() || "",
        ].join(" "); // Combine fields into a single searchable string

        // Check if all search terms match in any order across combined fields
        return terms.every((term) => searchableFields.includes(term));
      })
    : allExercises;

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
    <Box mt={6} p={4} bg="gray.50" borderRadius="md" maxW="100%">
      <Heading size="md" mb={4}>
        Daily Workout Log
      </Heading>
      <Box mb={4}>
        <Text mb={2}>Log Details:</Text>
        <Flex gap={2} wrap="wrap">
          <Input
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            width={{ base: "full", md: "200px" }}
            placeholder="Log Date"
          />
          <Input
            placeholder="Program Name"
            value={programDetails.program_name}
            onChange={(e) =>
              handleProgramDetailsChange("program_name", e.target.value)
            }
            width={{ base: "full", md: "200px" }}
          />
          <Input
            placeholder="Macro Cycle"
            value={programDetails.program_macro_cycle}
            onChange={(e) =>
              handleProgramDetailsChange("program_macro_cycle", e.target.value)
            }
            width={{ base: "full", md: "200px" }}
          />
          <Input
            placeholder="Week"
            value={programDetails.week}
            onChange={(e) => handleProgramDetailsChange("week", e.target.value)}
            width={{ base: "full", md: "100px" }}
          />
          <Input
            placeholder="Day"
            value={programDetails.day}
            onChange={(e) => handleProgramDetailsChange("day", e.target.value)}
            width={{ base: "full", md: "100px" }}
          />
          <Input
            placeholder="Focus"
            value={programDetails.focus}
            onChange={(e) =>
              handleProgramDetailsChange("focus", e.target.value)
            }
            width={{ base: "full", md: "150px" }}
          />
        </Flex>
      </Box>
      {logs.length > 0 ? (
        logs.map((log, exerciseIndex) => (
          <Box
            key={exerciseIndex}
            mb={6}
            p={3}
            bg="white"
            borderRadius="md"
            boxShadow="sm"
          >
            <Heading size="sm" mb={2}>
              {log.exercise}
            </Heading>
            {previousData[log.exercise] && (
              <Text fontSize="sm" color="gray.600" mb={2}>
                Last: {previousData[log.exercise]["weight_kg"]}kg x{" "}
                {previousData[log.exercise].reps}
                {previousData[log.exercise].rpe
                  ? ` (RPE: ${previousData[log.exercise].rpe})`
                  : ""}
              </Text>
            )}
            <Box mb={3}>
              <Text fontSize="sm" mb={1}>
                Exercise Details (Editable):
              </Text>
              <Flex gap={2} wrap="wrap">
                <Input
                  placeholder="Superset"
                  value={log.superset}
                  onChange={(e) =>
                    handleInputChange(
                      exerciseIndex,
                      -1,
                      "superset",
                      e.target.value
                    )
                  }
                  size="xs"
                  width={{ base: "full", md: "100px" }}
                />
                <Input
                  placeholder="Load Prescription (%1RM)"
                  value={log.load_prescription}
                  onChange={(e) =>
                    handleInputChange(
                      exerciseIndex,
                      -1,
                      "load_prescription",
                      e.target.value
                    )
                  }
                  size="xs"
                  width={{ base: "full", md: "150px" }}
                />
                <Input
                  placeholder="Calc. Target Load"
                  value={log.calculated_target_load}
                  onChange={(e) =>
                    handleInputChange(
                      exerciseIndex,
                      -1,
                      "calculated_target_load",
                      e.target.value
                    )
                  }
                  size="xs"
                  width={{ base: "full", md: "150px" }}
                />
                <Input
                  placeholder="Target Reps"
                  value={log.target_reps}
                  onChange={(e) =>
                    handleInputChange(
                      exerciseIndex,
                      -1,
                      "target_reps",
                      e.target.value
                    )
                  }
                  size="xs"
                  width={{ base: "full", md: "100px" }}
                />
                <Input
                  placeholder="Rest"
                  value={log.rest}
                  onChange={(e) =>
                    handleInputChange(exerciseIndex, -1, "rest", e.target.value)
                  }
                  size="xs"
                  width={{ base: "full", md: "80px" }}
                />
                <Input
                  placeholder="Tempo"
                  value={log.tempo}
                  onChange={(e) =>
                    handleInputChange(
                      exerciseIndex,
                      -1,
                      "tempo",
                      e.target.value
                    )
                  }
                  size="xs"
                  width={{ base: "full", md: "80px" }}
                />
                <Input
                  placeholder="Time/Distance"
                  value={log.time_distance}
                  onChange={(e) =>
                    handleInputChange(
                      exerciseIndex,
                      -1,
                      "time_distance",
                      e.target.value
                    )
                  }
                  size="xs"
                  width={{ base: "full", md: "120px" }}
                />
              </Flex>
            </Box>
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
                      <Td width="10%">Set {setIndex + 1}</Td>
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
          <Box mt={2} p={3} bg="white" borderRadius="md" boxShadow="md">
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
                      onClick={() => addExerciseToLog(ex.Exercise)}
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
                  addExerciseToLog(e.target.value);
                }
              }}
            >
              {allExercises.map((ex) => (
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
    </Box>
  );
}

export default DailyWorkoutLog;
