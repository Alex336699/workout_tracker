import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  Grid,
  Spinner,
  Alert,
  AlertIcon,
  Link,
  IconButton,
  Input,
  Select,
  Textarea,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Table,
  Tbody,
  Tr,
  Td,
  Icon,
} from "@chakra-ui/react";
import {
  ArrowBackIcon,
  AddIcon,
  CopyIcon,
  DeleteIcon,
  EditIcon,
  CheckIcon,
} from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

function WorkoutPrograms() {
  const [programsOverview, setProgramsOverview] = useState([]);
  const [programsLibrary, setProgramsLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showAddProgramModal, setShowAddProgramModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [newProgram, setNewProgram] = useState({
    Program_Name: "",
    Program_Description: "",
    Level: "",
    Focus: "",
    Key_Training_Focus: "",
    Nutrition_Recovery: "",
    Training_Mix_Frequency: "",
    Key_Adaptations: "",
    Key_Assessments: "",
    Key_Assessment_Goals: "",
    Program_Macro_Cycle: "",
    Weeks: "",
    Prefered_Season: "",
    Program_Length_in_Weeks: "",
    Days_Per_Week: "",
    Time_Per_Workout: "",
    Equipment: "",
    MUSCLE_ENGAGEMENT: "",
    Deload_Week: "",
    Progression: "",
  });
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [newDay, setNewDay] = useState({
    week: 1,
    day: 1,
    focus: "",
    exercise: "",
    target_sets: "",
    target_reps: "",
    load_prescription_p1RM: "",
    target_rpe: "",
    target_rest: "",
    target_tempo: "",
    target_time_distance: "",
  });
  const [editingDayIndex, setEditingDayIndex] = useState(null);
  const [progressionLogic, setProgressionLogic] = useState({
    repsIncrease: 1, // Default increase per week
    weightIncrease: 2, // Default weight % increase per week
  });
  const [fitnessLevels, setFitnessLevels] = useState([]);
  const [keyAdaptations, setKeyAdaptations] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState("");
  const navigate = useNavigate(); // For navigation back to Dashboard

  // Fetch data from Supabase tables
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch program overview data
        const { data: overviewData, error: overviewError } = await supabase
          .from("program_overview")
          .select(
            "Program_ID, Program_Name, Created, Program_Description, Level, Focus, Key_Training_Focus, Nutrition_Recovery, Training_Mix_Frequency, Key_Adaptations, Key_Assessments, Key_Assessment_Goals, Program_Macro_Cycle, Weeks, Prefered_Season, Program_Length_in_Weeks, Days_Per_Week, Time_Per_Workout, Equipment, MUSCLE_ENGAGEMENT, Deload_Week, Progression"
          );

        if (overviewError) throw overviewError;

        // Fetch program library data
        const { data: libraryData, error: libraryError } = await supabase
          .from("program_library")
          .select(
            "program_id, program_name, program_macro_cycle, week, day, focus, target_sets, target_reps, load_prescription_p1RM, target_rpe, target_rest, target_tempo, target_time_distance, exercise"
          );

        if (libraryError) throw libraryError;

        // Fetch dropdown data for Level from fitness_level table
        const { data: fitnessLevelData, error: fitnessLevelError } =
          await supabase.from("fitness_level").select("level_name"); // Adjust column name as per your table schema

        if (fitnessLevelError) throw fitnessLevelError;

        // Fetch dropdown data for Key Adaptations from key_fitness_adaptions table
        const { data: adaptationsData, error: adaptationsError } =
          await supabase
            .from("key_fitness_adaptions")
            .select("adaptation_name"); // Adjust column name as per your table schema

        if (adaptationsError) throw adaptationsError;

        // Fetch dropdown data for Equipment from equipment table
        const { data: equipmentData, error: equipmentError } = await supabase
          .from("equipment")
          .select("equipment_name"); // Adjust column name as per your table schema

        if (equipmentError) throw equipmentError;

        // Fetch data for Exercise from "Exercise Library" table
        const { data: exerciseData, error: exerciseError } = await supabase
          .from("Exercise Library")
          .select("Exercise, Target_Muscle_Group, Primary_Equipment"); // Adjust table and column names as per your schema

        if (exerciseError) throw exerciseError;

        setProgramsOverview(overviewData || []);
        setProgramsLibrary(libraryData || []);
        setFitnessLevels(fitnessLevelData.map((item) => item.level_name) || []);
        setKeyAdaptations(
          adaptationsData.map((item) => item.adaptation_name) || []
        );
        setEquipmentList(
          equipmentData.map((item) => item.equipment_name) || []
        );
        setExercises(exerciseData || []);
      } catch (err) {
        setError(err.message || "Failed to fetch data");
        setProgramsOverview([]);
        setProgramsLibrary([]);
        setFitnessLevels([]);
        setKeyAdaptations([]);
        setEquipmentList([]);
        setExercises([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle viewing detailed program info
  const viewProgramDetails = (program) => {
    setSelectedProgram(program);
  };

  // Close detailed view
  const closeDetails = () => {
    setSelectedProgram(null);
  };

  // Navigate back to Dashboard
  const goBackToDashboard = () => {
    navigate("/");
  };

  // Handle enrollment or switching programs
  const enrollInProgram = async (programId) => {
    try {
      setLoading(true);
      setError(null);
      setEnrollmentStatus(null);

      // Check if there is an active session
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error fetching session data:", sessionError);
        throw new Error(
          `Failed to fetch session data: ${
            sessionError.message || "Unknown error"
          }`
        );
      }

      if (!sessionData?.session) {
        throw new Error(
          "User not authenticated. Please log in to enroll in a program."
        );
      }

      const userId = sessionData.session.user.id;
      if (!userId) {
        throw new Error("User ID not found in session. Please log in again.");
      }

      // Check if user already has an enrollment record in user_programs
      const { data: existingEnrollment, error: checkError } = await supabase
        .from("user_programs")
        .select("id, program_id")
        .eq("user_id", userId)
        .limit(1);

      if (checkError) {
        console.error("Error checking existing enrollment:", checkError);
        throw new Error(
          `Failed to check enrollment: ${checkError.message || "Unknown error"}`
        );
      }

      const selectedProgram = programsOverview.find(
        (p) => p.Program_ID === programId
      );
      const programName = selectedProgram
        ? selectedProgram.Program_Name
        : "Unknown Program";

      if (existingEnrollment && existingEnrollment.length > 0) {
        // Update existing enrollment record (switching programs)
        const { error: updateError } = await supabase
          .from("user_programs")
          .update({
            program_id: programId,
            enrolled_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (updateError) {
          console.error("Error updating enrollment:", updateError);
          throw new Error(
            `Failed to switch program: ${
              updateError.message || "Unknown error"
            }`
          );
        }

        setEnrollmentStatus(`Successfully switched to program: ${programName}`);
      } else {
        // Insert new enrollment record
        const { error: insertError } = await supabase
          .from("user_programs")
          .insert([
            {
              user_id: userId,
              program_id: programId,
              enrolled_at: new Date().toISOString(),
            },
          ]);

        if (insertError) {
          console.error("Error inserting enrollment:", insertError);
          throw new Error(
            `Failed to enroll in program: ${
              insertError.message || "Unknown error"
            }`
          );
        }

        setEnrollmentStatus(`Successfully enrolled in program: ${programName}`);
      }
    } catch (err) {
      console.error("Error in enrollInProgram:", err);
      setError(err.message || "Failed to enroll in program");
    } finally {
      setLoading(false);
    }
  };

  // Handle adding or updating a program
  const saveProgram = async () => {
    try {
      setLoading(true);
      setError(null);

      let programId;

      if (isEditing && selectedProgram) {
        // Update existing program in program_overview
        const { error: overviewError } = await supabase
          .from("program_overview")
          .update(newProgram)
          .eq("Program_ID", selectedProgram.Program_ID);

        if (overviewError) {
          console.error("Error updating program_overview:", overviewError);
          throw new Error(
            `Failed to update program: ${
              overviewError.message || "Unknown error"
            }`
          );
        }

        programId = selectedProgram.Program_ID;

        // Delete existing program_library entries for this program before adding updated ones
        const { error: deleteError } = await supabase
          .from("program_library")
          .delete()
          .eq("program_id", programId);

        if (deleteError) {
          console.error("Error deleting program_library entries:", deleteError);
          throw new Error(
            `Failed to delete old library entries: ${
              deleteError.message || "Unknown error"
            }`
          );
        }
      } else {
        // Insert new program into program_overview
        const { data: overviewData, error: overviewError } = await supabase
          .from("program_overview")
          .insert([newProgram])
          .select("Program_ID")
          .single();

        if (overviewError) {
          console.error(
            "Error inserting into program_overview:",
            overviewError
          );
          throw new Error(
            `Failed to insert new program: ${
              overviewError.message || "Unknown error"
            }`
          );
        }

        programId = overviewData.Program_ID;
      }

      // Insert or update weekly plan details into program_library
      if (weeklyPlan.length > 0) {
        const libraryInserts = weeklyPlan.map((plan) => ({
          program_id: programId,
          program_name: newProgram.Program_Name,
          program_macro_cycle: newProgram.Program_Macro_Cycle || "",
          week: plan.week,
          day: plan.day,
          focus: plan.focus,
          exercise: plan.exercise,
          target_sets: plan.target_sets || "",
          target_reps: plan.target_reps || "",
          load_prescription_p1RM: plan.load_prescription_p1RM || "",
          target_rpe: plan.target_rpe || "",
          target_rest: plan.target_rest || "",
          target_tempo: plan.target_tempo || "",
          target_time_distance: plan.target_time_distance || "",
        }));

        const { error: libraryError } = await supabase
          .from("program_library")
          .insert(libraryInserts);

        if (libraryError) {
          console.error("Error inserting into program_library:", libraryError);
          throw new Error(
            `Failed to insert library entries: ${
              libraryError.message || "Unknown error"
            }`
          );
        }
      }

      // Refresh data after insertion/update
      const { data: newOverviewData, error: newOverviewError } = await supabase
        .from("program_overview")
        .select(
          "Program_ID, Program_Name, Created, Program_Description, Level, Focus, Key_Training_Focus, Nutrition_Recovery, Training_Mix_Frequency, Key_Adaptations, Key_Assessments, Key_Assessment_Goals, Program_Macro_Cycle, Weeks, Prefered_Season, Program_Length_in_Weeks, Days_Per_Week, Time_Per_Workout, Equipment, MUSCLE_ENGAGEMENT, Deload_Week, Progression"
        );

      if (newOverviewError) {
        console.error("Error refreshing program_overview:", newOverviewError);
        throw new Error(
          `Failed to refresh overview data: ${
            newOverviewError.message || "Unknown error"
          }`
        );
      }

      const { data: newLibraryData, error: newLibraryError } = await supabase
        .from("program_library")
        .select(
          "program_id, program_name, program_macro_cycle, week, day, focus, target_sets, target_reps, load_prescription_p1RM, target_rpe, target_rest, target_tempo, target_time_distance, exercise"
        );

      if (newLibraryError) {
        console.error("Error refreshing program_library:", newLibraryError);
        throw new Error(
          `Failed to refresh library data: ${
            newLibraryError.message || "Unknown error"
          }`
        );
      }

      setProgramsOverview(newOverviewData || []);
      setProgramsLibrary(newLibraryData || []);
      setShowAddProgramModal(false);
      setIsEditing(false);
      setNewProgram({
        Program_Name: "",
        Program_Description: "",
        Level: "",
        Focus: "",
        Key_Training_Focus: "",
        Nutrition_Recovery: "",
        Training_Mix_Frequency: "",
        Key_Adaptations: "",
        Key_Assessments: "",
        Key_Assessment_Goals: "",
        Program_Macro_Cycle: "",
        Weeks: "",
        Prefered_Season: "",
        Program_Length_in_Weeks: "",
        Days_Per_Week: "",
        Time_Per_Workout: "",
        Equipment: "",
        MUSCLE_ENGAGEMENT: "",
        Deload_Week: "",
        Progression: "",
      });
      setWeeklyPlan([]);
    } catch (err) {
      console.error("Error in saveProgram:", err);
      setError(err.message || "Failed to save program");
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new day to the weekly plan
  const addDayToPlan = () => {
    if (editingDayIndex !== null) {
      // Update existing day entry
      const updatedPlan = [...weeklyPlan];
      updatedPlan[editingDayIndex] = { ...newDay };
      setWeeklyPlan(updatedPlan);
      setEditingDayIndex(null);
    } else {
      // Add new day entry
      setWeeklyPlan([...weeklyPlan, { ...newDay }]);
    }
    setNewDay({
      week: newDay.week,
      day: newDay.day + 1,
      focus: "",
      exercise: "",
      target_sets: "",
      target_reps: "",
      load_prescription_p1RM: "",
      target_rpe: "",
      target_rest: "",
      target_tempo: "",
      target_time_distance: "",
    });
  };

  // Handle editing an existing day in the weekly plan
  const editDayInPlan = (index) => {
    const dayToEdit = weeklyPlan[index];
    setNewDay({ ...dayToEdit });
    setEditingDayIndex(index);
  };

  // Handle deleting a day from the weekly plan
  const deleteDayFromPlan = (index) => {
    const updatedPlan = weeklyPlan.filter((_, i) => i !== index);
    setWeeklyPlan(updatedPlan);
  };

  // Handle duplicating weekly plan for multiple weeks with custom progression
  const duplicateWeeklyPlan = (totalWeeks) => {
    const week1Plan = weeklyPlan.filter((plan) => plan.week === 1);
    if (week1Plan.length === 0) {
      alert("Please define at least one day for Week 1 before duplicating.");
      return;
    }

    const newPlan = [...weeklyPlan];
    for (let week = 2; week <= totalWeeks; week++) {
      week1Plan.forEach((day) => {
        newPlan.push({
          ...day,
          week: week,
          // Apply custom progression logic
          target_reps: day.target_reps
            ? adjustReps(day.target_reps, week)
            : day.target_reps,
          load_prescription_p1RM: day.load_prescription_p1RM
            ? adjustWeight(day.load_prescription_p1RM, week)
            : day.load_prescription_p1RM,
        });
      });
    }
    setWeeklyPlan(newPlan);
  };

  // Helper function to adjust reps based on progression logic
  const adjustReps = (reps, week) => {
    const baseReps = parseInt(reps.split("–")[0]) || 0;
    const increase = progressionLogic.repsIncrease * (week - 1);
    return `${baseReps + increase}${
      reps.includes("–") ? `–${parseInt(reps.split("–")[1]) + increase}` : ""
    }`;
  };

  // Helper function to adjust weight based on progression logic
  const adjustWeight = (weight, week) => {
    const baseWeight = parseInt(weight) || 0;
    const increase = progressionLogic.weightIncrease * (week - 1);
    return `${baseWeight + increase}${weight.includes("%") ? "%" : ""}`;
  };

  // Handle editing an existing program
  const editProgram = (program) => {
    setNewProgram({
      Program_Name: program.Program_Name || "",
      Program_Description: program.Program_Description || "",
      Level: program.Level || "",
      Focus: program.Focus || "",
      Key_Training_Focus: program.Key_Training_Focus || "",
      Nutrition_Recovery: program.Nutrition_Recovery || "",
      Training_Mix_Frequency: program.Training_Mix_Frequency || "",
      Key_Adaptations: program.Key_Adaptations || "",
      Key_Assessments: program.Key_Assessments || "",
      Key_Assessment_Goals: program.Key_Assessment_Goals || "",
      Program_Macro_Cycle: program.Program_Macro_Cycle || "",
      Weeks: program.Weeks || "",
      Prefered_Season: program.Prefered_Season || "",
      Program_Length_in_Weeks: program.Program_Length_in_Weeks || "",
      Days_Per_Week: program.Days_Per_Week || "",
      Time_Per_Workout: program.Time_Per_Workout || "",
      Equipment: program.Equipment || "",
      MUSCLE_ENGAGEMENT: program.MUSCLE_ENGAGEMENT || "",
      Deload_Week: program.Deload_Week || "",
      Progression: program.Progression || "",
    });
    setWeeklyPlan(getProgramDetails(program.Program_ID));
    setIsEditing(true);
    setSelectedProgram(program);
    setShowAddProgramModal(true);
  };

  // Group library data by program_id for detailed view
  const getProgramDetails = (programId) => {
    return programsLibrary.filter((detail) => detail.program_id === programId);
  };

  // Filtered exercises based on search term with advanced matching
  const filteredExercises = exerciseSearchTerm
    ? exercises.filter((ex) => {
        const terms = exerciseSearchTerm.toLowerCase().split(" ");
        const searchableFields = [
          ex.Exercise?.toLowerCase() || "",
          ex.Target_Muscle_Group?.toLowerCase() || "",
          ex.Primary_Equipment?.toLowerCase() || "",
        ].join(" ");
        return terms.every((term) => searchableFields.includes(term));
      })
    : exercises;

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <Spinner size="lg" color="teal.500" />
        <Text mt={2}>Loading programs...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  if (enrollmentStatus) {
    return (
      <Box p={4}>
        <Alert status="success">
          <AlertIcon />
          {enrollmentStatus}
        </Alert>
        <Button
          mt={4}
          colorScheme="teal"
          onClick={() => setEnrollmentStatus(null)}
        >
          Back to Programs
        </Button>
      </Box>
    );
  }

  return (
    <Box p={4} maxW="100%" bg="gray.50">
      <Flex align="center" mb={6}>
        <IconButton
          icon={<ArrowBackIcon />}
          colorScheme="teal"
          size="md"
          onClick={goBackToDashboard}
          aria-label="Back to Dashboard"
          mr={2}
        />
        <Heading size="lg">Workout Programs</Heading>
        <Button
          colorScheme="teal"
          size="md"
          ml="auto"
          leftIcon={<AddIcon />}
          onClick={() => {
            setIsEditing(false);
            setSelectedProgram(null);
            setNewProgram({
              Program_Name: "",
              Program_Description: "",
              Level: "",
              Focus: "",
              Key_Training_Focus: "",
              Nutrition_Recovery: "",
              Training_Mix_Frequency: "",
              Key_Adaptations: "",
              Key_Assessments: "",
              Key_Assessment_Goals: "",
              Program_Macro_Cycle: "",
              Weeks: "",
              Prefered_Season: "",
              Program_Length_in_Weeks: "",
              Days_Per_Week: "",
              Time_Per_Workout: "",
              Equipment: "",
              MUSCLE_ENGAGEMENT: "",
              Deload_Week: "",
              Progression: "",
            });
            setWeeklyPlan([]);
            setShowAddProgramModal(true);
          }}
          aria-label="Add New Program"
        >
          Add Program
        </Button>
      </Flex>

      {/* Programs Grid */}
      <Box>
        {programsOverview.length === 0 ? (
          <Text fontSize="md" color="gray.500" textAlign="center">
            No workout programs found.
          </Text>
        ) : (
          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            gap={4}
          >
            {programsOverview.map((program) => (
              <Box
                key={program.Program_ID}
                p={4}
                bg="white"
                borderRadius="md"
                boxShadow="sm"
                _hover={{ boxShadow: "md", cursor: "pointer" }}
                onClick={() => viewProgramDetails(program)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    viewProgramDetails(program);
                  }
                }}
                aria-label={`View details for ${program.Program_Name}`}
              >
                <Heading size="sm" mb={2}>
                  {program.Program_Name}
                </Heading>
                <Text fontSize="sm" mb={1}>
                  Focus: {program.Focus || "N/A"}
                </Text>
                <Text fontSize="sm" mb={1}>
                  Duration: {program.Weeks ? `${program.Weeks} Weeks` : "N/A"}
                </Text>
                <Text fontSize="sm" mb={1}>
                  Level: {program.Level || "N/A"}
                </Text>
                <Flex gap={2} mt={2}>
                  <Button
                    size="sm"
                    colorScheme="teal"
                    onClick={(e) => {
                      e.stopPropagation();
                      viewProgramDetails(program);
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={(e) => {
                      e.stopPropagation();
                      editProgram(program);
                    }}
                  >
                    Edit
                  </Button>
                </Flex>
              </Box>
            ))}
          </Grid>
        )}
      </Box>

      {/* Detailed View Modal */}
      {selectedProgram && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0,0,0,0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="1000"
          role="dialog"
          aria-labelledby="program-details-title"
          onClick={closeDetails}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              closeDetails();
            }
          }}
        >
          <Box
            bg="white"
            p={6}
            borderRadius="md"
            maxW="800px"
            width="90%"
            maxH="80vh"
            overflowY="auto"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            onKeyDown={(e) => e.stopPropagation()} // Prevent closing when using keyboard inside modal
          >
            <Heading id="program-details-title" size="md" mb={4}>
              {selectedProgram.Program_Name}
            </Heading>
            <Text mb={2}>
              <strong>Focus:</strong> {selectedProgram.Focus || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Duration:</strong>{" "}
              {selectedProgram.Weeks ? `${selectedProgram.Weeks} Weeks` : "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Level:</strong> {selectedProgram.Level || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Created:</strong> {selectedProgram.Created || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Description:</strong>{" "}
              {selectedProgram.Program_Description || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Key Training Focus:</strong>{" "}
              {selectedProgram.Key_Training_Focus || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Nutrition & Recovery:</strong>{" "}
              {selectedProgram.Nutrition_Recovery || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Training Mix Frequency:</strong>{" "}
              {selectedProgram.Training_Mix_Frequency || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Key Adaptations:</strong>{" "}
              {selectedProgram.Key_Adaptations || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Key Assessments:</strong>{" "}
              {selectedProgram.Key_Assessments || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Key Assessment Goals:</strong>{" "}
              {selectedProgram.Key_Assessment_Goals || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Macro Cycle:</strong>{" "}
              {selectedProgram.Program_Macro_Cycle || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Preferred Season:</strong>{" "}
              {selectedProgram.Prefered_Season || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Program Length (Weeks):</strong>{" "}
              {selectedProgram.Program_Length_in_Weeks || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Days Per Week:</strong>{" "}
              {selectedProgram.Days_Per_Week || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Time Per Workout:</strong>{" "}
              {selectedProgram.Time_Per_Workout || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Equipment:</strong> {selectedProgram.Equipment || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Muscle Engagement:</strong>{" "}
              {selectedProgram.MUSCLE_ENGAGEMENT || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Deload Week:</strong>{" "}
              {selectedProgram.Deload_Week || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Progression:</strong>{" "}
              {selectedProgram.Progression || "N/A"}
            </Text>

            {/* Detailed Weekly/Daily Breakdown from program_library */}
            <Heading size="sm" mt={4} mb={2}>
              Program Details by Week/Day
            </Heading>
            {getProgramDetails(selectedProgram.Program_ID).length > 0 ? (
              <Box>
                {getProgramDetails(selectedProgram.Program_ID).map(
                  (detail, index) => (
                    <Box
                      key={index}
                      p={2}
                      borderBottom="1px solid"
                      borderColor="gray.200"
                    >
                      <Text fontSize="sm">
                        <strong>Week:</strong> {detail.week || "N/A"}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Day:</strong> {detail.day || "N/A"}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Exercise:</strong> {detail.exercise || "N/A"}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Macro Cycle:</strong>{" "}
                        {detail.program_macro_cycle || "N/A"}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Focus:</strong> {detail.focus || "N/A"}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Target Sets:</strong>{" "}
                        {detail.target_sets || "N/A"}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Target Reps:</strong>{" "}
                        {detail.target_reps || "N/A"}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Load Prescription (p1RM):</strong>{" "}
                        {detail.load_prescription_p1RM || "N/A"}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Target RPE:</strong>{" "}
                        {detail.target_rpe || "N/A"}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Target Rest:</strong>{" "}
                        {detail.target_rest || "N/A"}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Target Tempo:</strong>{" "}
                        {detail.target_tempo || "N/A"}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Target Time/Distance:</strong>{" "}
                        {detail.target_time_distance || "N/A"}
                      </Text>
                    </Box>
                  )
                )}
              </Box>
            ) : (
              <Text fontSize="sm" color="gray.500">
                No detailed weekly/day data available for this program.
              </Text>
            )}

            <Flex mt={4} gap={2}>
              <Button colorScheme="gray" size="md" onClick={closeDetails}>
                Close
              </Button>
              <Button
                colorScheme="green"
                size="md"
                onClick={() => enrollInProgram(selectedProgram.Program_ID)}
              >
                Enroll
              </Button>
              <Button
                colorScheme="blue"
                size="md"
                onClick={() => editProgram(selectedProgram)}
              >
                Edit Program
              </Button>
            </Flex>
          </Box>
        </Box>
      )}

      {/* Add/Edit Program Modal */}
      {showAddProgramModal && (
        <Modal
          isOpen={showAddProgramModal}
          onClose={() => setShowAddProgramModal(false)}
          size="xl"
          scrollBehavior="inside"
        >
          <ModalOverlay />
          <ModalContent maxH="80vh" overflowY="auto">
            <ModalHeader>
              {isEditing ? "Edit Program" : "Add New Program"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box mb={4}>
                <Heading size="md" mb={2}>
                  Program Overview (program_overview)
                </Heading>
                <FormControl mb={2}>
                  <FormLabel>Program Name</FormLabel>
                  <Input
                    value={newProgram.Program_Name}
                    onChange={(e) =>
                      setNewProgram({
                        ...newProgram,
                        Program_Name: e.target.value,
                      })
                    }
                    placeholder="Enter program name"
                  />
                </FormControl>
                <FormControl mb={2}>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={newProgram.Program_Description}
                    onChange={(e) =>
                      setNewProgram({
                        ...newProgram,
                        Program_Description: e.target.value,
                      })
                    }
                    placeholder="Enter program description"
                  />
                </FormControl>
                <FormControl mb={2}>
                  <FormLabel>Level</FormLabel>
                  <Select
                    value={newProgram.Level}
                    onChange={(e) =>
                      setNewProgram({ ...newProgram, Level: e.target.value })
                    }
                    placeholder="Select level"
                  >
                    {fitnessLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl mb={2}>
                  <FormLabel>Focus</FormLabel>
                  <Input
                    value={newProgram.Focus}
                    onChange={(e) =>
                      setNewProgram({ ...newProgram, Focus: e.target.value })
                    }
                    placeholder="Enter focus (e.g., Hypertrophy, Strength)"
                  />
                </FormControl>
                <FormControl mb={2}>
                  <FormLabel>Key Training Focus</FormLabel>
                  <Textarea
                    value={newProgram.Key_Training_Focus}
                    onChange={(e) =>
                      setNewProgram({
                        ...newProgram,
                        Key_Training_Focus: e.target.value,
                      })
                    }
                    placeholder="Enter key training focus"
                  />
                </FormControl>
                <FormControl mb={2}>
                  <FormLabel>Nutrition & Recovery</FormLabel>
                  <Textarea
                    value={newProgram.Nutrition_Recovery}
                    onChange={(e) =>
                      setNewProgram({
                        ...newProgram,
                        Nutrition_Recovery: e.target.value,
                      })
                    }
                    placeholder="Enter nutrition and recovery details"
                  />
                </FormControl>
                <FormControl mb={2}>
                  <FormLabel>Training Mix Frequency</FormLabel>
                  <Input
                    value={newProgram.Training_Mix_Frequency}
                    onChange={(e) =>
                      setNewProgram({
                        ...newProgram,
                        Training_Mix_Frequency: e.target.value,
                      })
                    }
                    placeholder="Enter training mix frequency"
                  />
                </FormControl>
                <FormControl mb={2}>
                  <FormLabel>Key Adaptations</FormLabel>
                  <Select
                    value={newProgram.Key_Adaptations}
                    onChange={(e) =>
                      setNewProgram({
                        ...newProgram,
                        Key_Adaptations: e.target.value,
                      })
                    }
                    placeholder="Select key adaptations"
                  >
                    {keyAdaptations.map((adaptation) => (
                      <option key={adaptation} value={adaptation}>
                        {adaptation}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl mb={2}>
                  <FormLabel>Key Assessments</FormLabel>
                  <Textarea
                    value={newProgram.Key_Assessments}
                    onChange={(e) =>
                      setNewProgram({
                        ...newProgram,
                        Key_Assessments: e.target.value,
                      })
                    }
                    placeholder="Enter key assessments"
                  />
                </FormControl>
                <FormControl mb={2}>
                  <FormLabel>Key Assessment Goals</FormLabel>
                  <Textarea
                    value={newProgram.Key_Assessment_Goals}
                    onChange={(e) =>
                      setNewProgram({
                        ...newProgram,
                        Key_Assessment_Goals: e.target.value,
                      })
                    }
                    placeholder="Enter key assessment goals"
                  />
                </FormControl>
                <FormControl mb={2}>
                  <FormLabel>Macro Cycle</FormLabel>
                  <Input
                    value={newProgram.Program_Macro_Cycle}
                    onChange={(e) =>
                      setNewProgram({
                        ...newProgram,
                        Program_Macro_Cycle: e.target.value,
                      })
                    }
                    placeholder="Enter macro cycle (e.g., Q1-Bulk)"
                  />
                </FormControl>
                <FormControl mb={2}>
                  <FormLabel>Total Weeks</FormLabel>
                  <Input
                    type="number"
                    value={newProgram.Weeks}
                    onChange={(e) =>
                      setNewProgram({ ...newProgram, Weeks: e.target.value })
                    }
                    placeholder="Enter total weeks"
                  />
                </FormControl>
                <FormControl mb={2}>
                  <FormLabel>Preferred Season</FormLabel>
                  <Input
                    value={newProgram.Prefered_Season}
                    onChange={(e) =>
                      setNewProgram({
                        ...newProgram,
                        Prefered_Season: e.target.value,
                      })
                    }
                    placeholder="Enter preferred season"
                  />
                </FormControl>
                <FormControl mb={2}>
                  <FormLabel>Program Length in Weeks</FormLabel>
                  <Input
                    type="number"
                    value={newProgram.Program_Length_in_Weeks}
                    onChange={(e) =>
                      setNewProgram({
                        ...newProgram,
                        Program_Length_in_Weeks: e.target.value,
                      })
                    }
                    placeholder="Enter program length in weeks"
                  />
                </FormControl>
                <FormControl mb={2}>
                  <FormLabel>Days Per Week</FormLabel>
                  <Input
                    type="number"
                    value={newProgram.Days_Per_Week}
                    onChange={(e) =>
                      setNewProgram({
                        ...newProgram,
                        Days_Per_Week: e.target.value,
                      })
                    }
                    placeholder="Enter days per week"
                  />
                </FormControl>
                <FormControl mb={2}>
                  <FormLabel>Time Per Workout</FormLabel>
                  <Input
                    value={newProgram.Time_Per_Workout}
                    onChange={(e) =>
                      setNewProgram({
                        ...newProgram,
                        Time_Per_Workout: e.target.value,
                      })
                    }
                    placeholder="Enter time per workout (e.g., 60 min)"
                  />
                </FormControl>
                <FormControl mb={2}>
                  <FormLabel>Equipment</FormLabel>
                  <Select
                    value={newProgram.Equipment}
                    onChange={(e) =>
                      setNewProgram({
                        ...newProgram,
                        Equipment: e.target.value,
                      })
                    }
                    placeholder="Select equipment"
                  >
                    {equipmentList.map((equip) => (
                      <option key={equip} value={equip}>
                        {equip}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl mb={2}>
                  <FormLabel>Muscle Engagement</FormLabel>
                  <Input
                    value={newProgram.MUSCLE_ENGAGEMENT}
                    onChange={(e) =>
                      setNewProgram({
                        ...newProgram,
                        MUSCLE_ENGAGEMENT: e.target.value,
                      })
                    }
                    placeholder="Enter muscle engagement details"
                  />
                </FormControl>
                <FormControl mb={2}>
                  <FormLabel>Deload Week</FormLabel>
                  <Input
                    value={newProgram.Deload_Week}
                    onChange={(e) =>
                      setNewProgram({
                        ...newProgram,
                        Deload_Week: e.target.value,
                      })
                    }
                    placeholder="Enter deload week details"
                  />
                </FormControl>
                <FormControl mb={2}>
                  <FormLabel>Progression</FormLabel>
                  <Textarea
                    value={newProgram.Progression}
                    onChange={(e) =>
                      setNewProgram({
                        ...newProgram,
                        Progression: e.target.value,
                      })
                    }
                    placeholder="Enter progression strategy"
                  />
                </FormControl>
              </Box>

              <Box mb={4}>
                <Heading size="md" mb={2}>
                  Weekly Plan for program_library
                </Heading>
                <Text fontSize="sm" mb={2} color="gray.500">
                  Define days for Week 1, then duplicate across weeks with
                  progression adjustments.
                </Text>
                <Flex gap={2} wrap="wrap" mb={2}>
                  <FormControl width={{ base: "full", md: "100px" }}>
                    <FormLabel>Week</FormLabel>
                    <Input
                      type="number"
                      value={newDay.week}
                      onChange={(e) =>
                        setNewDay({ ...newDay, week: parseInt(e.target.value) })
                      }
                      placeholder="Week"
                    />
                  </FormControl>
                  <FormControl width={{ base: "full", md: "100px" }}>
                    <FormLabel>Day</FormLabel>
                    <Input
                      type="number"
                      value={newDay.day}
                      onChange={(e) =>
                        setNewDay({ ...newDay, day: parseInt(e.target.value) })
                      }
                      placeholder="Day"
                    />
                  </FormControl>
                  <FormControl width={{ base: "full", md: "200px" }}>
                    <FormLabel>Focus</FormLabel>
                    <Input
                      value={newDay.focus}
                      onChange={(e) =>
                        setNewDay({ ...newDay, focus: e.target.value })
                      }
                      placeholder="Focus (e.g., Push, Pull, Legs)"
                    />
                  </FormControl>
                  <FormControl width={{ base: "full", md: "200px" }}>
                    <FormLabel>Exercise</FormLabel>
                    <Input
                      value={newDay.exercise}
                      onChange={(e) => {
                        setNewDay({ ...newDay, exercise: e.target.value });
                        setExerciseSearchTerm(e.target.value);
                      }}
                      placeholder="Search exercise (e.g., squat barbell)"
                      onFocus={() =>
                        setExerciseSearchTerm(newDay.exercise || "")
                      }
                    />
                    {exerciseSearchTerm && (
                      <Box
                        position="absolute"
                        bg="white"
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                        maxH="200px"
                        overflowY="auto"
                        zIndex="1000"
                        width="inherit"
                        mt={1}
                      >
                        {filteredExercises.length === 0 ? (
                          <Text p={2} fontSize="sm" color="gray.500">
                            No matching exercises found.
                          </Text>
                        ) : (
                          filteredExercises.slice(0, 10).map((ex) => (
                            <Text
                              key={ex.Exercise}
                              p={2}
                              fontSize="sm"
                              _hover={{ bg: "gray.100", cursor: "pointer" }}
                              onClick={() => {
                                setNewDay({ ...newDay, exercise: ex.Exercise });
                                setExerciseSearchTerm("");
                              }}
                            >
                              {ex.Exercise} ({ex.Target_Muscle_Group || "N/A"} -{" "}
                              {ex.Primary_Equipment || "N/A"})
                            </Text>
                          ))
                        )}
                      </Box>
                    )}
                  </FormControl>
                  <FormControl width={{ base: "full", md: "120px" }}>
                    <FormLabel>Target Sets</FormLabel>
                    <Input
                      type="number"
                      value={newDay.target_sets}
                      onChange={(e) =>
                        setNewDay({ ...newDay, target_sets: e.target.value })
                      }
                      placeholder="Sets"
                    />
                  </FormControl>
                  <FormControl width={{ base: "full", md: "120px" }}>
                    <FormLabel>Target Reps</FormLabel>
                    <Input
                      value={newDay.target_reps}
                      onChange={(e) =>
                        setNewDay({ ...newDay, target_reps: e.target.value })
                      }
                      placeholder="Reps (e.g., 8-12)"
                    />
                  </FormControl>
                  <FormControl width={{ base: "full", md: "150px" }}>
                    <FormLabel>Load (%1RM)</FormLabel>
                    <Input
                      value={newDay.load_prescription_p1RM}
                      onChange={(e) =>
                        setNewDay({
                          ...newDay,
                          load_prescription_p1RM: e.target.value,
                        })
                      }
                      placeholder="Load (e.g., 70%)"
                    />
                  </FormControl>
                  <FormControl width={{ base: "full", md: "120px" }}>
                    <FormLabel>Target RPE</FormLabel>
                    <Input
                      type="number"
                      value={newDay.target_rpe}
                      onChange={(e) =>
                        setNewDay({ ...newDay, target_rpe: e.target.value })
                      }
                      placeholder="RPE (1-10)"
                    />
                  </FormControl>
                  <FormControl width={{ base: "full", md: "120px" }}>
                    <FormLabel>Target Rest</FormLabel>
                    <Input
                      value={newDay.target_rest}
                      onChange={(e) =>
                        setNewDay({ ...newDay, target_rest: e.target.value })
                      }
                      placeholder="Rest (e.g., 90s)"
                    />
                  </FormControl>
                  <FormControl width={{ base: "full", md: "120px" }}>
                    <FormLabel>Target Tempo</FormLabel>
                    <Input
                      value={newDay.target_tempo}
                      onChange={(e) =>
                        setNewDay({ ...newDay, target_tempo: e.target.value })
                      }
                      placeholder="Tempo (e.g., 3-0-1)"
                    />
                  </FormControl>
                  <FormControl width={{ base: "full", md: "150px" }}>
                    <FormLabel>Target Time/Distance</FormLabel>
                    <Input
                      value={newDay.target_time_distance}
                      onChange={(e) =>
                        setNewDay({
                          ...newDay,
                          target_time_distance: e.target.value,
                        })
                      }
                      placeholder="Time/Distance"
                    />
                  </FormControl>
                  <Button
                    colorScheme="blue"
                    size="md"
                    onClick={addDayToPlan}
                    aria-label={
                      editingDayIndex !== null
                        ? "Update Day in Plan"
                        : "Add Day to Plan"
                    }
                    mt={{ base: 2, md: 8 }}
                  >
                    {editingDayIndex !== null
                      ? "Update Day"
                      : "Add Day to Plan"}
                  </Button>
                </Flex>

                {/* Display current weekly plan */}
                {weeklyPlan.length > 0 && (
                  <Box
                    mb={4}
                    p={2}
                    bg="gray.50"
                    borderRadius="md"
                    maxH="200px"
                    overflowY="auto"
                  >
                    <Heading size="sm" mb={2}>
                      Current Weekly Plan
                    </Heading>
                    <Table variant="simple" size="sm">
                      <Tbody>
                        {weeklyPlan.map((plan, index) => (
                          <Tr key={index}>
                            <Td>
                              Week {plan.week}, Day {plan.day}
                            </Td>
                            <Td>{plan.focus}</Td>
                            <Td>{plan.exercise || "N/A"}</Td>
                            <Td>Sets: {plan.target_sets || "N/A"}</Td>
                            <Td>Reps: {plan.target_reps || "N/A"}</Td>
                            <Td>
                              <IconButton
                                icon={<EditIcon />}
                                size="sm"
                                mr={1}
                                onClick={() => editDayInPlan(index)}
                                aria-label={`Edit Week ${plan.week}, Day ${plan.day}`}
                              />
                              <IconButton
                                icon={<DeleteIcon />}
                                size="sm"
                                colorScheme="red"
                                onClick={() => deleteDayFromPlan(index)}
                                aria-label={`Delete Week ${plan.week}, Day ${plan.day}`}
                              />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}

                {/* Progression Logic Customization */}
                <Box mb={4}>
                  <Heading size="sm" mb={2}>
                    Progression Logic for Duplication
                  </Heading>
                  <Flex gap={2} wrap="wrap">
                    <FormControl width={{ base: "full", md: "200px" }}>
                      <FormLabel>Reps Increase per Week</FormLabel>
                      <Input
                        type="number"
                        value={progressionLogic.repsIncrease}
                        onChange={(e) =>
                          setProgressionLogic({
                            ...progressionLogic,
                            repsIncrease: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="Reps increase per week"
                      />
                    </FormControl>
                    <FormControl width={{ base: "full", md: "200px" }}>
                      <FormLabel>Weight Increase per Week (%)</FormLabel>
                      <Input
                        type="number"
                        value={progressionLogic.weightIncrease}
                        onChange={(e) =>
                          setProgressionLogic({
                            ...progressionLogic,
                            weightIncrease: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="Weight increase per week (%)"
                      />
                    </FormControl>
                  </Flex>
                </Box>

                {/* Duplicate plan for multiple weeks */}
                <Flex gap={2} align="center">
                  <FormControl width={{ base: "full", md: "150px" }}>
                    <FormLabel>Duplicate for Weeks</FormLabel>
                    <Input
                      type="number"
                      placeholder="Total Weeks"
                      onChange={(e) =>
                        duplicateWeeklyPlan(parseInt(e.target.value) || 1)
                      }
                    />
                  </FormControl>
                  <Button
                    colorScheme="gray"
                    size="md"
                    leftIcon={<CopyIcon />}
                    mt={{ base: 2, md: 8 }}
                    onClick={() =>
                      duplicateWeeklyPlan(parseInt(newProgram.Weeks) || 1)
                    }
                    aria-label="Duplicate for All Weeks"
                  >
                    Duplicate for All Weeks
                  </Button>
                </Flex>
              </Box>
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="gray"
                mr={3}
                onClick={() => setShowAddProgramModal(false)}
              >
                Cancel
              </Button>
              <Button colorScheme="teal" onClick={saveProgram}>
                {isEditing ? "Update Program" : "Save Program"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
}

export default WorkoutPrograms;
