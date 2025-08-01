import { useState } from "react";
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
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useExercises } from "../hooks/useExercises";

function ExerciseLibrary() {
  const { exercises, loading, error } = useExercises();
  const [searchTerm, setSearchTerm] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [selectedExercise, setSelectedExercise] = useState(null);
  const navigate = useNavigate(); // For navigation back to Dashboard

  // Unique filter options dynamically populated from exercise data
  const muscleGroups = [
    ...new Set(exercises.map((ex) => ex.Target_Muscle_Group || "N/A")),
  ].sort();
  const equipmentTypes = [
    ...new Set(exercises.map((ex) => ex.Primary_Equipment || "N/A")),
  ].sort();
  const difficultyLevels = [
    ...new Set(exercises.map((ex) => ex.Difficulty_Level || "N/A")),
  ].sort();

  // Filter exercises based on search and filter criteria
  const filteredExercises = exercises.filter((ex) => {
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

  // Handle viewing detailed exercise info
  const viewExerciseDetails = (exercise) => {
    setSelectedExercise(exercise);
  };

  // Close detailed view
  const closeDetails = () => {
    setSelectedExercise(null);
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
      <Flex align="center" mb={6}>
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
                _hover={{ boxShadow: "md", cursor: "pointer" }}
                onClick={() => viewExerciseDetails(ex)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    viewExerciseDetails(ex);
                  }
                }}
                aria-label={`View details for ${ex.Exercise}`}
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
            ))}
          </Grid>
        )}
      </Box>

      {/* Detailed View Modal (Placeholder) */}
      {selectedExercise && (
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
          aria-labelledby="exercise-details-title"
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
            maxW="600px"
            width="90%"
            maxH="80vh"
            overflowY="auto"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            onKeyDown={(e) => e.stopPropagation()} // Prevent closing when using keyboard inside modal
          >
            <Heading id="exercise-details-title" size="md" mb={4}>
              {selectedExercise.Exercise}
            </Heading>
            <Text mb={2}>
              <strong>Target Muscle:</strong>{" "}
              {selectedExercise.Target_Muscle_Group || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Prime Mover Muscle:</strong>{" "}
              {selectedExercise.Prime_Mover_Muscle || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Secondary Muscle:</strong>{" "}
              {selectedExercise.Secondary_Muscle || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Tertiary Muscle:</strong>{" "}
              {selectedExercise.Tertiary_Muscle || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Equipment:</strong>{" "}
              {selectedExercise.Primary_Equipment || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Difficulty:</strong>{" "}
              {selectedExercise.Difficulty_Level || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Mechanics:</strong> {selectedExercise.Mechanics || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Force Type:</strong>{" "}
              {selectedExercise.Force_Type || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Body Region:</strong>{" "}
              {selectedExercise.Body_Region || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Laterality:</strong>{" "}
              {selectedExercise.Laterality || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Posture:</strong> {selectedExercise.Posture || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Single or Double Arm:</strong>{" "}
              {selectedExercise.Single_or_Double_Arm || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Continuous or Alternating Arms:</strong>{" "}
              {selectedExercise.Continuous_or_Alternating_Arms || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Grip:</strong> {selectedExercise.Grip || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Load Position (Ending):</strong>{" "}
              {selectedExercise["Load_Position_(Ending)"] || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Continuous or Alternating Legs:</strong>{" "}
              {selectedExercise.Continuous_or_Alternating_Legs || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Foot Elevation:</strong>{" "}
              {selectedExercise.Foot_Elevation || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Combination Exercises:</strong>{" "}
              {selectedExercise.Combination_Exercises || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Movement Pattern #1:</strong>{" "}
              {selectedExercise["Movement_Pattern_#1"] || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Movement Pattern #2:</strong>{" "}
              {selectedExercise["Movement_Pattern_#2"] || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Movement Pattern #3:</strong>{" "}
              {selectedExercise["Movement_Pattern_#3"] || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Plane of Motion #1:</strong>{" "}
              {selectedExercise["Plane_Of_Motion_#1"] || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Plane of Motion #2:</strong>{" "}
              {selectedExercise["Plane_Of_Motion_#2"] || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Plane of Motion #3:</strong>{" "}
              {selectedExercise["Plane_Of_Motion_#3"] || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Primary Exercise Classification:</strong>{" "}
              {selectedExercise.Primary_Exercise_Classification || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>Favorite:</strong> {selectedExercise.Favorite || "N/A"}
            </Text>
            <Text mb={2}>
              <strong>1 RM (Alex):</strong>{" "}
              {selectedExercise["1_RM_Alex"] || "N/A"}
            </Text>
            {selectedExercise.Video_Demonstration && (
              <Text mb={2}>
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
              <Text mb={2}>
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
            <Button colorScheme="gray" size="md" mt={4} onClick={closeDetails}>
              Close
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default ExerciseLibrary;
