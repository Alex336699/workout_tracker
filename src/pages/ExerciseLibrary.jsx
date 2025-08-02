import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Input,
  Button,
  Flex,
  Grid,
  Spinner,
  Alert,
  AlertIcon,
  Select,
  Link,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  FormControl,
  FormLabel,
  HStack,
  useDisclosure,
} from "@chakra-ui/react";
import { ArrowBackIcon, EditIcon, AddIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useExercises } from "../hooks/useExercises";
import { supabase } from "../services/supabaseClient";

function ExerciseLibrary() {
  const { exercises, loading, error } = useExercises();
  const [localExercises, setLocalExercises] = useState([]); // Add local state
  const [searchTerm, setSearchTerm] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [saving, setSaving] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Update local exercises when the hook data changes
  useEffect(() => {
    setLocalExercises(exercises);
  }, [exercises]);

  // Add Exercise Modal
  const {
    isOpen: isAddModalOpen,
    onOpen: onAddModalOpen,
    onClose: onAddModalClose,
  } = useDisclosure();
  const [newExercise, setNewExercise] = useState({
    Exercise: "",
    Target_Muscle_Group: "",
    Primary_Equipment: "",
    Video_Demonstration: "",
    "In-Depth_Explanation": "",
    Favorite: "",
    "1_RM_Alex": "",
    Difficulty_Level: "",
    Mechanics: "",
    Force_Type: "",
    Prime_Mover_Muscle: "",
    Secondary_Muscle: "",
    Tertiary_Muscle: "",
    Body_Region: "",
    Laterality: "",
    Posture: "",
    Single_or_Double_Arm: "",
    Continuous_or_Alternating_Arms: "",
    Grip: "",
    "Load_Position_(Ending)": "",
    Continuous_or_Alternating_Legs: "",
    Foot_Elevation: "",
    Combination_Exercises: "",
    "Movement_Pattern_#1": "",
    "Movement_Pattern_#2": "",
    "Movement_Pattern_#3": "",
    "Plane_Of_Motion_#1": "",
    "Plane_Of_Motion_#2": "",
    "Plane_Of_Motion_#3": "",
    Primary_Exercise_Classification: "",
  });
  const [addingExercise, setAddingExercise] = useState(false);
  const [addError, setAddError] = useState(null);
  const [addSuccessMessage, setAddSuccessMessage] = useState(null);

  const navigate = useNavigate();

  // Unique filter options dynamically populated from exercise data
  const muscleGroups = [
    ...new Set(localExercises.map((ex) => ex.Target_Muscle_Group || "N/A")),
  ].sort();
  const equipmentTypes = [
    ...new Set(localExercises.map((ex) => ex.Primary_Equipment || "N/A")),
  ].sort();
  const difficultyLevels = [
    ...new Set(localExercises.map((ex) => ex.Difficulty_Level || "N/A")),
  ].sort();

  // Filter exercises based on search and filter criteria
  const filteredExercises = localExercises.filter((ex) => {
    const matchesSearch = searchTerm
      ? ex.Exercise?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.Target_Muscle_Group?.toLowerCase().includes(
          searchTerm.toLowerCase()
        ) ||
        ex.Primary_Equipment?.toLowerCase().includes(
          searchTerm.toLowerCase()
        ) ||
        ex.Mechanics?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.Force_Type?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesMuscle = muscleFilter
      ? ex.Target_Muscle_Group === muscleFilter
      : true;
    const matchesEquipment = equipmentFilter
      ? ex.Primary_Equipment === equipmentFilter
      : true;
    const matchesDifficulty = difficultyFilter
      ? ex.Difficulty_Level === difficultyFilter
      : true;

    return (
      matchesSearch && matchesMuscle && matchesEquipment && matchesDifficulty
    );
  });

  // Handle new exercise field changes
  const handleNewExerciseChange = (field, value) => {
    console.log(`Changing new exercise ${field} to:`, value);
    setNewExercise((prev) => ({ ...prev, [field]: value }));
  };

  // Reset new exercise form
  // Reset new exercise form
  const resetNewExerciseForm = () => {
    setNewExercise({
      Exercise: "",
      Target_Muscle_Group: "",
      Primary_Equipment: "",
      Video_Demonstration: "",
      "In-Depth_Explanation": "",
      Favorite: "",
      "1_RM_Alex": "", // Changed from "N/A" to empty string
      Difficulty_Level: "",
      Mechanics: "",
      Force_Type: "",
      Prime_Mover_Muscle: "",
      Secondary_Muscle: "",
      Tertiary_Muscle: "",
      Body_Region: "",
      Laterality: "",
      Posture: "",
      Single_or_Double_Arm: "",
      Continuous_or_Alternating_Arms: "",
      Grip: "",
      "Load_Position_(Ending)": "",
      Continuous_or_Alternating_Legs: "",
      Foot_Elevation: "",
      Combination_Exercises: "",
      "Movement_Pattern_#1": "",
      "Movement_Pattern_#2": "",
      "Movement_Pattern_#3": "",
      "Plane_Of_Motion_#1": "",
      "Plane_Of_Motion_#2": "",
      "Plane_Of_Motion_#3": "",
      Primary_Exercise_Classification: "",
    });
    setAddError(null);
    setAddSuccessMessage(null);
  };

  // Add new exercise
  // Add new exercise
  const addNewExercise = async () => {
    try {
      setAddingExercise(true);
      setAddError(null);
      setAddSuccessMessage(null);

      // Validate required fields
      if (!newExercise.Exercise.trim()) {
        setAddError("Exercise name is required");
        return;
      }

      // Check if exercise already exists
      const existingExercise = exercises.find(
        (ex) => ex.Exercise.toLowerCase() === newExercise.Exercise.toLowerCase()
      );
      if (existingExercise) {
        setAddError("An exercise with this name already exists");
        return;
      }

      // Check authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setAddError("You must be logged in to add exercises");
        return;
      }

      console.log("=== ADDING NEW EXERCISE ===");
      console.log("New exercise data:", newExercise);

      // Prepare data for insertion - handle numeric fields properly
      const insertData = { ...newExercise };

      // Handle the 1_RM_Alex field - convert to null if it's "N/A" or empty
      if (
        insertData["1_RM_Alex"] === "N/A" ||
        insertData["1_RM_Alex"] === "" ||
        insertData["1_RM_Alex"] === null
      ) {
        insertData["1_RM_Alex"] = null;
      } else {
        // Try to convert to number if it's not "N/A"
        const numValue = parseFloat(insertData["1_RM_Alex"]);
        if (!isNaN(numValue)) {
          insertData["1_RM_Alex"] = numValue;
        } else {
          insertData["1_RM_Alex"] = null;
        }
      }

      // Handle any other potential numeric fields that might be empty strings
      // Convert empty strings to null for optional fields
      Object.keys(insertData).forEach((key) => {
        if (insertData[key] === "") {
          insertData[key] = null;
        }
      });

      console.log("Processed insert data:", insertData);

      // Insert the new exercise
      const { data: insertResult, error: insertError } = await supabase
        .from("Exercise Library")
        .insert([insertData])
        .select();

      console.log("Insert result:", insertResult);
      console.log("Insert error:", insertError);

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        throw insertError;
      }

      if (!insertResult || insertResult.length === 0) {
        throw new Error("Failed to add exercise - no data returned");
      }

      // Update local state to include the new exercise
      setLocalExercises((prevExercises) => [...prevExercises, insertResult[0]]);

      setAddSuccessMessage("Exercise added successfully!");

      // Close modal after success
      setTimeout(() => {
        setAddSuccessMessage(null);
        onAddModalClose();
        resetNewExerciseForm();
      }, 2000);
    } catch (err) {
      console.error("Error adding new exercise:", err);
      setAddError(err.message || "Failed to add exercise");
    } finally {
      setAddingExercise(false);
    }
  };

  // ----------------- next function --------------------------
  //Handle viewing detailed exercise info
  const viewExerciseDetails = (exercise) => {
    setSelectedExercise(exercise);
    setIsDetailsModalOpen(true);
    setIsEditMode(false);
  };

  // Handle editing exercise
  const editExercise = (exercise) => {
    setEditingExercise({
      ...exercise,
      targetMuscleGroup: exercise.Target_Muscle_Group || "",
      videoDemonstration: exercise.Video_Demonstration || "",
      inDepthExplanation: exercise["In-Depth_Explanation"] || "",
      favorite: exercise.Favorite || "",
      oneRmAlex: exercise["1_RM_Alex"] || "N/A",
    });
    setSelectedExercise(exercise);
    setIsDetailsModalOpen(true);
    setIsEditMode(true);
    setUpdateError(null);
    setSuccessMessage(null);
  };

  // Handle edit field changes
  const handleEditFieldChange = (field, value) => {
    console.log(`Changing ${field} to:`, value, typeof value);

    // Special handling for 1RM field
    if (field === "oneRmAlex") {
      console.log("1RM value being set:", value);
      if (
        value === "" ||
        value === "N/A" ||
        value.toLowerCase() === "n/a" ||
        !isNaN(parseFloat(value))
      ) {
        setEditingExercise((prev) => ({ ...prev, [field]: value }));
      }
      return;
    }

    setEditingExercise((prev) => ({ ...prev, [field]: value }));
  };

  // Save edited exercise details
  const saveEditedDetails = async () => {
    if (!editingExercise) return;

    try {
      setSaving(true);
      setUpdateError(null);
      setSuccessMessage(null);

      // Check authentication first
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setUpdateError("You must be logged in to update exercise details");
        return;
      }

      console.log("=== SAVING EXERCISE DETAILS ===");
      console.log("Exercise name:", editingExercise.Exercise);

      // Prepare the update data - only include changed fields
      const updateData = {};

      if (
        selectedExercise.Target_Muscle_Group !==
        editingExercise.targetMuscleGroup
      ) {
        updateData.Target_Muscle_Group = editingExercise.targetMuscleGroup;
      }
      if (
        selectedExercise.Video_Demonstration !==
        editingExercise.videoDemonstration
      ) {
        updateData.Video_Demonstration = editingExercise.videoDemonstration;
      }
      if (
        selectedExercise["In-Depth_Explanation"] !==
        editingExercise.inDepthExplanation
      ) {
        updateData["In-Depth_Explanation"] = editingExercise.inDepthExplanation;
      }
      if (selectedExercise.Favorite !== editingExercise.favorite) {
        updateData.Favorite = editingExercise.favorite;
      }
      if (selectedExercise["1_RM_Alex"] !== editingExercise.oneRmAlex) {
        updateData["1_RM_Alex"] = editingExercise.oneRmAlex;
      }

      console.log("Update data:", updateData);

      // If no fields have changed, don't perform update
      if (Object.keys(updateData).length === 0) {
        setSuccessMessage(
          "No changes detected - exercise details are already up to date!"
        );
        setTimeout(() => {
          setSuccessMessage(null);
          setIsDetailsModalOpen(false);
          setIsEditMode(false);
          setEditingExercise(null);
        }, 2000);
        return;
      }

      // Update the Exercise Library table
      const { data: updateResult, error: updateError } = await supabase
        .from("Exercise Library")
        .update(updateData)
        .eq("Exercise", editingExercise.Exercise)
        .select();

      console.log("Update result:", updateResult);
      console.log("Update error:", updateError);

      if (updateError) {
        console.error("Supabase update error:", updateError);
        throw updateError;
      }

      if (!updateResult || updateResult.length === 0) {
        throw new Error("Update was blocked - check your permissions.");
      }

      // Update local state to reflect changes
      setLocalExercises((prevExercises) =>
        prevExercises.map((ex) =>
          ex.Exercise === editingExercise.Exercise
            ? { ...ex, ...updateData }
            : ex
        )
      );

      // Update the selected exercise for the modal
      setSelectedExercise((prev) => ({ ...prev, ...updateData }));

      setSuccessMessage(
        `Exercise details updated successfully! Updated ${
          Object.keys(updateData).length
        } field(s).`
      );

      // Close modal after success
      setTimeout(() => {
        setSuccessMessage(null);
        setIsDetailsModalOpen(false);
        setIsEditMode(false);
        setEditingExercise(null);
      }, 2000);
    } catch (err) {
      console.error("Error updating exercise details:", err);
      setUpdateError(err.message || "Failed to update exercise details");
    } finally {
      setSaving(false);
    }
  };

  // Close detailed view
  const closeDetails = () => {
    setSelectedExercise(null);
    setIsDetailsModalOpen(false);
    setIsEditMode(false);
    setEditingExercise(null);
    setUpdateError(null);
    setSuccessMessage(null);
  };

  // Navigate back to Dashboard
  const goBackToDashboard = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <Spinner size="lg" color="teal.500" />
        <Text mt={2}>Loading exercises...</Text>
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

  return (
    <Box p={4} maxW="100%" bg="gray.50">
      <Flex align="center" justify="space-between" mb={6}>
        <Flex align="center">
          <IconButton
            icon={<ArrowBackIcon />}
            colorScheme="teal"
            size="md"
            onClick={goBackToDashboard}
            aria-label="Back to Dashboard"
            mr={2}
          />
          <Heading size="lg">Exercise Library</Heading>
        </Flex>

        {/* Add New Exercise Button */}
        <Button
          leftIcon={<AddIcon />}
          colorScheme="green"
          onClick={() => {
            resetNewExerciseForm();
            onAddModalOpen();
          }}
          size="md"
        >
          Add New Exercise
        </Button>
      </Flex>

      {/* Search and Filter Section */}
      <Box mb={6} p={4} bg="white" borderRadius="md" boxShadow="sm">
        <Heading size="md" mb={3}>
          Search & Filter Exercises
        </Heading>
        <Flex gap={3} wrap="wrap" align="center">
          <Input
            placeholder="Search by name, muscle group, equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="md"
            width={{ base: "full", md: "300px" }}
            aria-label="Search exercises"
          />
          <Select
            placeholder="Filter by Muscle Group"
            value={muscleFilter}
            onChange={(e) => setMuscleFilter(e.target.value)}
            size="md"
            width={{ base: "full", md: "200px" }}
            aria-label="Filter by Muscle Group"
          >
            {muscleGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </Select>
          <Select
            placeholder="Filter by Equipment"
            value={equipmentFilter}
            onChange={(e) => setEquipmentFilter(e.target.value)}
            size="md"
            width={{ base: "full", md: "200px" }}
            aria-label="Filter by Equipment"
          >
            {equipmentTypes.map((equip) => (
              <option key={equip} value={equip}>
                {equip}
              </option>
            ))}
          </Select>
          <Select
            placeholder="Filter by Difficulty"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            size="md"
            width={{ base: "full", md: "200px" }}
            aria-label="Filter by Difficulty"
          >
            {difficultyLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </Select>
          <Button
            size="md"
            onClick={() => {
              setSearchTerm("");
              setMuscleFilter("");
              setEquipmentFilter("");
              setDifficultyFilter("");
            }}
            aria-label="Clear all filters"
          >
            Clear Filters
          </Button>
        </Flex>
      </Box>

      {/* Exercises Grid */}
      <Box>
        {filteredExercises.length === 0 ? (
          <Text fontSize="md" color="gray.500" textAlign="center">
            No exercises found matching your criteria.
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
            {filteredExercises.map((ex) => (
              <Box
                key={ex.Exercise}
                p={4}
                bg="white"
                borderRadius="md"
                boxShadow="sm"
                _hover={{ boxShadow: "md" }}
                position="relative"
              >
                {/* Edit Button */}
                <IconButton
                  icon={<EditIcon />}
                  colorScheme="blue"
                  size="sm"
                  position="absolute"
                  top={2}
                  right={2}
                  onClick={() => editExercise(ex)}
                  aria-label={`Edit ${ex.Exercise}`}
                />

                <Box
                  cursor="pointer"
                  onClick={() => viewExerciseDetails(ex)}
                  pr={10} // Add padding to avoid overlap with edit button
                >
                  <Heading size="sm" mb={2}>
                    {ex.Exercise}
                  </Heading>
                  <Text fontSize="sm" mb={1}>
                    Target: {ex.Target_Muscle_Group || "N/A"}
                  </Text>
                  <Text fontSize="sm" mb={1}>
                    Equipment: {ex.Primary_Equipment || "N/A"}
                  </Text>
                  <Text fontSize="sm" mb={1}>
                    Difficulty: {ex.Difficulty_Level || "N/A"}
                  </Text>
                  <Button size="sm" colorScheme="teal" mt={2}>
                    View Details
                  </Button>
                </Box>
              </Box>
            ))}
          </Grid>
        )}
      </Box>

      {/* Add New Exercise Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          onAddModalClose();
          resetNewExerciseForm();
        }}
        size={{ base: "full", md: "xl" }}
      >
        <ModalOverlay />
        <ModalContent maxH="90vh" overflowY="auto">
          <ModalHeader>Add New Exercise</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Error and Success Messages */}
            {addError && (
              <Alert status="error" mb={4}>
                <AlertIcon />
                {addError}
              </Alert>
            )}
            {addSuccessMessage && (
              <Alert status="success" mb={4}>
                <AlertIcon />
                {addSuccessMessage}
              </Alert>
            )}

            <VStack spacing={4} align="stretch">
              {/* Required Fields */}
              <Box>
                <Text fontWeight="bold" mb={3} color="red.500">
                  Required Fields
                </Text>
                <FormControl isRequired>
                  <FormLabel>Exercise Name</FormLabel>
                  <Input
                    value={newExercise.Exercise}
                    onChange={(e) =>
                      handleNewExerciseChange("Exercise", e.target.value)
                    }
                    placeholder="Enter exercise name"
                  />
                </FormControl>
              </Box>

              {/* Basic Information */}
              <Box>
                <Text fontWeight="bold" mb={3}>
                  Basic Information
                </Text>
                <VStack spacing={3} align="stretch">
                  <FormControl>
                    <FormLabel>Target Muscle Group</FormLabel>
                    <Input
                      value={newExercise.Target_Muscle_Group}
                      onChange={(e) =>
                        handleNewExerciseChange(
                          "Target_Muscle_Group",
                          e.target.value
                        )
                      }
                      placeholder="e.g., Chest, Back, Legs"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Primary Equipment</FormLabel>
                    <Input
                      value={newExercise.Primary_Equipment}
                      onChange={(e) =>
                        handleNewExerciseChange(
                          "Primary_Equipment",
                          e.target.value
                        )
                      }
                      placeholder="e.g., Dumbbell, Barbell, Bodyweight"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select
                      value={newExercise.Difficulty_Level}
                      onChange={(e) =>
                        handleNewExerciseChange(
                          "Difficulty_Level",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Select difficulty</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Mechanics</FormLabel>
                    <Input
                      value={newExercise.Mechanics}
                      onChange={(e) =>
                        handleNewExerciseChange("Mechanics", e.target.value)
                      }
                      placeholder="e.g., Compound, Isolation"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Force Type</FormLabel>
                    <Input
                      value={newExercise.Force_Type}
                      onChange={(e) =>
                        handleNewExerciseChange("Force_Type", e.target.value)
                      }
                      placeholder="e.g., Push, Pull, Static"
                    />
                  </FormControl>
                </VStack>
              </Box>

              {/* Muscle Groups */}
              <Box>
                <Text fontWeight="bold" mb={3}>
                  Muscle Groups
                </Text>
                <VStack spacing={3} align="stretch">
                  <FormControl>
                    <FormLabel>Prime Mover Muscle</FormLabel>
                    <Input
                      value={newExercise.Prime_Mover_Muscle}
                      onChange={(e) =>
                        handleNewExerciseChange(
                          "Prime_Mover_Muscle",
                          e.target.value
                        )
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Secondary Muscle</FormLabel>
                    <Input
                      value={newExercise.Secondary_Muscle}
                      onChange={(e) =>
                        handleNewExerciseChange(
                          "Secondary_Muscle",
                          e.target.value
                        )
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Tertiary Muscle</FormLabel>
                    <Input
                      value={newExercise.Tertiary_Muscle}
                      onChange={(e) =>
                        handleNewExerciseChange(
                          "Tertiary_Muscle",
                          e.target.value
                        )
                      }
                    />
                  </FormControl>
                </VStack>
              </Box>

              {/* Personal Data */}
              <Box>
                <Text fontWeight="bold" mb={3}>
                  Personal Data
                </Text>
                <VStack spacing={3} align="stretch">
                  <FormControl>
                    <FormLabel>Favorite</FormLabel>
                    <Select
                      value={newExercise.Favorite}
                      onChange={(e) =>
                        handleNewExerciseChange("Favorite", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>1 RM Alex (kg)</FormLabel>
                    <Input
                      type="text"
                      value={newExercise["1_RM_Alex"]}
                      onChange={(e) =>
                        handleNewExerciseChange("1_RM_Alex", e.target.value)
                      }
                      placeholder="Enter weight in kg (leave empty for N/A)"
                    />
                  </FormControl>
                </VStack>
              </Box>

              {/* Links */}
              <Box>
                <Text fontWeight="bold" mb={3}>
                  Reference Links
                </Text>
                <VStack spacing={3} align="stretch">
                  <FormControl>
                    <FormLabel>Video Demonstration Link</FormLabel>
                    <Input
                      type="url"
                      value={newExercise.Video_Demonstration}
                      onChange={(e) =>
                        handleNewExerciseChange(
                          "Video_Demonstration",
                          e.target.value
                        )
                      }
                      placeholder="https://..."
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>In-Depth Explanation Link</FormLabel>
                    <Input
                      type="url"
                      value={newExercise["In-Depth_Explanation"]}
                      onChange={(e) =>
                        handleNewExerciseChange(
                          "In-Depth_Explanation",
                          e.target.value
                        )
                      }
                      placeholder="https://..."
                    />
                  </FormControl>
                </VStack>
              </Box>

              {/* Additional Details (Collapsible section could be added here) */}
              <Box>
                <Text fontWeight="bold" mb={3}>
                  Additional Details (Optional)
                </Text>
                <VStack spacing={3} align="stretch">
                  <FormControl>
                    <FormLabel>Body Region</FormLabel>
                    <Input
                      value={newExercise.Body_Region}
                      onChange={(e) =>
                        handleNewExerciseChange("Body_Region", e.target.value)
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Primary Exercise Classification</FormLabel>
                    <Input
                      value={newExercise.Primary_Exercise_Classification}
                      onChange={(e) =>
                        handleNewExerciseChange(
                          "Primary_Exercise_Classification",
                          e.target.value
                        )
                      }
                    />
                  </FormControl>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button
                colorScheme="green"
                onClick={addNewExercise}
                isLoading={addingExercise}
                loadingText="Adding..."
              >
                Add Exercise
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  onAddModalClose();
                  resetNewExerciseForm();
                }}
              >
                Cancel
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Detailed View Modal (existing code remains the same) */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={closeDetails}
        size={{ base: "full", md: "lg" }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedExercise?.Exercise || "Exercise Details"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Error and Success Messages */}
            {updateError && (
              <Alert status="error" mb={4}>
                <AlertIcon />
                {updateError}
              </Alert>
            )}
            {successMessage && (
              <Alert status="success" mb={4}>
                <AlertIcon />
                {successMessage}
              </Alert>
            )}

            {selectedExercise && (
              <VStack spacing={3} align="stretch">
                <Text fontWeight="bold">
                  Exercise: {selectedExercise.Exercise}
                </Text>

                {isEditMode && editingExercise ? (
                  <>
                    <FormControl>
                      <FormLabel>Target Muscle Group</FormLabel>
                      <Input
                        value={editingExercise.targetMuscleGroup}
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
                        value={editingExercise.videoDemonstration}
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
                        value={editingExercise.inDepthExplanation}
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
                        value={editingExercise.favorite || ""}
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
                        type="text"
                        value={
                          editingExercise.oneRmAlex === null ||
                          editingExercise.oneRmAlex === undefined
                            ? ""
                            : String(editingExercise.oneRmAlex)
                        }
                        onChange={(e) =>
                          handleEditFieldChange("oneRmAlex", e.target.value)
                        }
                        placeholder="Enter weight in kg or N/A"
                      />
                    </FormControl>
                  </>
                ) : (
                  <>
                    <Text>
                      <strong>Target Muscle:</strong>{" "}
                      {selectedExercise.Target_Muscle_Group || "N/A"}
                    </Text>
                    <Text>
                      <strong>Prime Mover Muscle:</strong>{" "}
                      {selectedExercise.Prime_Mover_Muscle || "N/A"}
                    </Text>
                    <Text>
                      <strong>Secondary Muscle:</strong>{" "}
                      {selectedExercise.Secondary_Muscle || "N/A"}
                    </Text>
                    <Text>
                      <strong>Tertiary Muscle:</strong>{" "}
                      {selectedExercise.Tertiary_Muscle || "N/A"}
                    </Text>
                    <Text>
                      <strong>Equipment:</strong>{" "}
                      {selectedExercise.Primary_Equipment || "N/A"}
                    </Text>
                    <Text>
                      <strong>Difficulty:</strong>{" "}
                      {selectedExercise.Difficulty_Level || "N/A"}
                    </Text>
                    <Text>
                      <strong>Mechanics:</strong>{" "}
                      {selectedExercise.Mechanics || "N/A"}
                    </Text>
                    <Text>
                      <strong>Force Type:</strong>{" "}
                      {selectedExercise.Force_Type || "N/A"}
                    </Text>
                    <Text>
                      <strong>Body Region:</strong>{" "}
                      {selectedExercise.Body_Region || "N/A"}
                    </Text>
                    <Text>
                      <strong>Laterality:</strong>{" "}
                      {selectedExercise.Laterality || "N/A"}
                    </Text>
                    <Text>
                      <strong>Posture:</strong>{" "}
                      {selectedExercise.Posture || "N/A"}
                    </Text>
                    <Text>
                      <strong>Single or Double Arm:</strong>{" "}
                      {selectedExercise.Single_or_Double_Arm || "N/A"}
                    </Text>
                    <Text>
                      <strong>Continuous or Alternating Arms:</strong>{" "}
                      {selectedExercise.Continuous_or_Alternating_Arms || "N/A"}
                    </Text>
                    <Text>
                      <strong>Grip:</strong> {selectedExercise.Grip || "N/A"}
                    </Text>
                    <Text>
                      <strong>Load Position (Ending):</strong>{" "}
                      {selectedExercise["Load_Position_(Ending)"] || "N/A"}
                    </Text>
                    <Text>
                      <strong>Continuous or Alternating Legs:</strong>{" "}
                      {selectedExercise.Continuous_or_Alternating_Legs || "N/A"}
                    </Text>
                    <Text>
                      <strong>Foot Elevation:</strong>{" "}
                      {selectedExercise.Foot_Elevation || "N/A"}
                    </Text>
                    <Text>
                      <strong>Combination Exercises:</strong>{" "}
                      {selectedExercise.Combination_Exercises || "N/A"}
                    </Text>
                    <Text>
                      <strong>Movement Pattern #1:</strong>{" "}
                      {selectedExercise["Movement_Pattern_#1"] || "N/A"}
                    </Text>
                    <Text>
                      <strong>Movement Pattern #2:</strong>{" "}
                      {selectedExercise["Movement_Pattern_#2"] || "N/A"}
                    </Text>
                    <Text>
                      <strong>Movement Pattern #3:</strong>{" "}
                      {selectedExercise["Movement_Pattern_#3"] || "N/A"}
                    </Text>
                    <Text>
                      <strong>Plane of Motion #1:</strong>{" "}
                      {selectedExercise["Plane_Of_Motion_#1"] || "N/A"}
                    </Text>
                    <Text>
                      <strong>Plane of Motion #2:</strong>{" "}
                      {selectedExercise["Plane_Of_Motion_#2"] || "N/A"}
                    </Text>
                    <Text>
                      <strong>Plane of Motion #3:</strong>{" "}
                      {selectedExercise["Plane_Of_Motion_#3"] || "N/A"}
                    </Text>
                    <Text>
                      <strong>Primary Exercise Classification:</strong>{" "}
                      {selectedExercise.Primary_Exercise_Classification ||
                        "N/A"}
                    </Text>
                    <Text>
                      <strong>Favorite:</strong>{" "}
                      {selectedExercise.Favorite || "N/A"}
                    </Text>
                    <Text>
                      <strong>1 RM (Alex):</strong>{" "}
                      {selectedExercise["1_RM_Alex"] || "N/A"}
                    </Text>
                    {selectedExercise.Video_Demonstration && (
                      <Text>
                        <strong>Video Demo:</strong>
                        <Link
                          href={selectedExercise.Video_Demonstration}
                          color="blue.500"
                          target="_blank"
                          rel="noopener noreferrer"
                          ml={1}
                        >
                          Watch Here
                        </Link>
                      </Text>
                    )}
                    {selectedExercise["In-Depth_Explanation"] && (
                      <Text>
                        <strong>Explanation:</strong>
                        <Link
                          href={selectedExercise["In-Depth_Explanation"]}
                          color="blue.500"
                          target="_blank"
                          rel="noopener noreferrer"
                          ml={1}
                        >
                          Read More
                        </Link>
                      </Text>
                    )}
                  </>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              {!isEditMode ? (
                <Button
                  colorScheme="blue"
                  onClick={() => {
                    setIsEditMode(true);
                    setEditingExercise({
                      ...selectedExercise,
                      targetMuscleGroup:
                        selectedExercise.Target_Muscle_Group || "",
                      videoDemonstration:
                        selectedExercise.Video_Demonstration || "",
                      inDepthExplanation:
                        selectedExercise["In-Depth_Explanation"] || "",
                      favorite: selectedExercise.Favorite || "",
                      oneRmAlex: selectedExercise["1_RM_Alex"] || "N/A",
                    });
                  }}
                >
                  Edit Details
                </Button>
              ) : (
                <>
                  <Button
                    colorScheme="teal"
                    onClick={saveEditedDetails}
                    isLoading={saving}
                    loadingText="Saving..."
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditMode(false);
                      setEditingExercise(null);
                      setUpdateError(null);
                    }}
                  >
                    Cancel
                  </Button>
                </>
              )}
              <Button variant="ghost" onClick={closeDetails}>
                Close
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default ExerciseLibrary;
