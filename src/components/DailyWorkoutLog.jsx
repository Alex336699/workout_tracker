import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Heading,
  Text,
  Input,
  Button,
  Flex,
  VStack,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  Checkbox,
  IconButton,
  Grid,
  Badge,
  Collapse,
  useDisclosure,
  Card,
  CardBody,
  Progress,
  Divider,
  Select,
  FormControl,
  FormLabel,
  useToast,
  Container,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useBreakpointValue,
  Link,
  List,
  ListItem,
  Switch,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  CircularProgress,
  CircularProgressLabel,
} from "@chakra-ui/react";
import {
  ArrowBackIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  AddIcon,
  DeleteIcon,
  EditIcon,
  CheckIcon,
  TimeIcon,
  InfoIcon,
  SettingsIcon,
  SearchIcon,
  StarIcon,
  CloseIcon,
} from "@chakra-ui/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
} from "recharts";

// Custom Input Component for Quick Set Entry
const QuickSetInput = ({ 
  value, 
  onChange, 
  placeholder, 
  type = "text", 
  isCompleted = false,
  bg = null 
}) => (
  <Input
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    type={type}
    inputMode={type === "number" ? "decimal" : "text"}
    size={{ base: "md", md: "lg" }}
    textAlign="center"
    fontWeight="bold"
    fontSize={{ base: "md", md: "lg" }}
    bg={bg || (isCompleted ? "green.50" : "white")}
    borderColor={isCompleted ? "green.300" : "gray.200"}
    borderWidth="2px"
    _focus={{
      borderColor: "teal.400",
      boxShadow: "0 0 0 3px rgba(56, 178, 172, 0.1)",
    }}
    _hover={{
      borderColor: "teal.300",
    }}
  />
);

// Set Completion Button Component
const SetCompletionButton = ({ isCompleted, onClick, setNumber }) => (
  <IconButton
    icon={isCompleted ? <CheckIcon /> : <Box w="4" h="4" />}
    colorScheme={isCompleted ? "green" : "gray"}
    variant={isCompleted ? "solid" : "outline"}
    size={{ base: "md", md: "lg" }}
    borderRadius="full"
    onClick={onClick}
    aria-label={`Mark set ${setNumber} as ${isCompleted ? 'incomplete' : 'complete'}`}
    _hover={{
      transform: "scale(1.05)",
    }}
    transition="all 0.2s"
  />
);

// Timer Display Component
const TimerDisplay = ({ seconds, isActive, onStart, onStop }) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return (
    <HStack spacing={2}>
      <Box
        bg={isActive ? "orange.100" : "gray.100"}
        px={3}
        py={1}
        borderRadius="md"
        minW="60px"
        textAlign="center"
      >
        <Text fontSize="sm" fontWeight="bold" color={isActive ? "orange.600" : "gray.600"}>
          {minutes}:{remainingSeconds.toString().padStart(2, "0")}
        </Text>
      </Box>
      <IconButton
        icon={<TimeIcon />}
        size="sm"
        colorScheme={isActive ? "orange" : "gray"}
        variant={isActive ? "solid" : "outline"}
        onClick={isActive ? onStop : onStart}
        aria-label={isActive ? "Stop timer" : "Start timer"}
      />
    </HStack>
  );
};

// Exercise Search Modal Component
const ExerciseSearchModal = ({ 
  isOpen, 
  onClose, 
  exerciseLibrary, 
  onSelectExercise, 
  searchTerm, 
  setSearchTerm,
  title = "Select Exercise"
}) => {
  const filteredExercises = searchTerm
    ? exerciseLibrary
        .filter((ex) => {
          const searchTerms = searchTerm.toLowerCase().split(" ");
          const searchableFields = [
            ex.Exercise?.toLowerCase() || "",
            ex.Target_Muscle_Group?.toLowerCase() || "",
            ex.Primary_Equipment?.toLowerCase() || "",
            ex.Mechanics?.toLowerCase() || "",
            ex.Force_Type?.toLowerCase() || "",
            ex.Favorite?.toString().toLowerCase() || "",
          ].join(" ");

          return searchTerms.every((term) => searchableFields.includes(term));
        })
        .sort((a, b) => {
          const isFavorite = (exercise) => {
            const favoriteValue = exercise.Favorite?.toString().toLowerCase();
            return favoriteValue === "yes" || favoriteValue === "y";
          };

          const aIsFavorite = isFavorite(a);
          const bIsFavorite = isFavorite(b);

          if (aIsFavorite === bIsFavorite) {
            return (a.Exercise || "").localeCompare(b.Exercise || "");
          }
          return aIsFavorite ? -1 : 1;
        })
    : exerciseLibrary.sort((a, b) => {
        const isFavorite = (exercise) => {
          const favoriteValue = exercise.Favorite?.toString().toLowerCase();
          return favoriteValue === "yes" || favoriteValue === "y";
        };

        const aIsFavorite = isFavorite(a);
        const bIsFavorite = isFavorite(b);

        if (aIsFavorite === bIsFavorite) {
          return (a.Exercise || "").localeCompare(b.Exercise || "");
        }
        return aIsFavorite ? -1 : 1;
      });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="80vh">
        <ModalHeader>
          <HStack>
            <SearchIcon />
            <Text>{title}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Input
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="lg"
              leftIcon={<SearchIcon />}
            />
            
            <Box maxH="400px" overflowY="auto">
              <List spacing={2}>
                {filteredExercises.slice(0, 50).map((exercise, index) => {
                  const isFavorite = exercise.Favorite?.toString().toLowerCase() === "yes" || 
                                   exercise.Favorite?.toString().toLowerCase() === "y";
                  
                  return (
                    <ListItem key={index}>
                      <Box
                        p={3}
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                        cursor="pointer"
                        _hover={{ bg: "teal.50", borderColor: "teal.300" }}
                        onClick={() => {
                          onSelectExercise(exercise.Exercise);
                          onClose();
                        }}
                      >
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <HStack>
                              <Text fontWeight="bold">{exercise.Exercise}</Text>
                              {isFavorite && <StarIcon color="yellow.400" boxSize={4} />}
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                              {exercise.Target_Muscle_Group}
                            </Text>
                            {exercise.Primary_Equipment && (
                              <Badge size="sm" colorScheme="blue">
                                {exercise.Primary_Equipment}
                              </Badge>
                            )}
                          </VStack>
                        </HStack>
                      </Box>
                    </ListItem>
                  );
                })}
              </List>
              
              {filteredExercises.length === 0 && searchTerm && (
                <Text textAlign="center" color="gray.500" py={8}>
                  No exercises found matching "{searchTerm}"
                </Text>
              )}
              
              {filteredExercises.length > 50 && (
                <Text textAlign="center" color="gray.500" py={4} fontSize="sm">
                  Showing first 50 results. Use search to narrow down.
                </Text>
              )}
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// Exercise Statistics Component
const ExerciseStats = ({ prData, exerciseDetails }) => {
  if (!prData || prData.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">No workout history available</Text>
      </Box>
    );
  }

  const latestData = prData[prData.length - 1];
  const maxWeight = Math.max(...prData.map(d => d.maxWeight));
  const maxVolume = Math.max(...prData.map(d => d.totalVolume));
  const bestVolumeDay = prData.find(d => d.totalVolume === maxVolume);

  return (
    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
      <Stat bg="teal.50" p={4} borderRadius="lg" textAlign="center">
        <StatLabel fontSize="xs" color="teal.600">Current 1RM Est.</StatLabel>
        <StatNumber fontSize="xl" color="teal.700">
          {latestData.estimated1RM}kg
        </StatNumber>
      </Stat>
      
      <Stat bg="blue.50" p={4} borderRadius="lg" textAlign="center">
        <StatLabel fontSize="xs" color="blue.600">Max Weight</StatLabel>
        <StatNumber fontSize="xl" color="blue.700">
          {maxWeight}kg
        </StatNumber>
      </Stat>
      
      <Stat bg="purple.50" p={4} borderRadius="lg" textAlign="center">
        <StatLabel fontSize="xs" color="purple.600">Best Volume</StatLabel>
        <StatNumber fontSize="xl" color="purple.700">
          {Math.round(maxVolume)}
        </StatNumber>
        {bestVolumeDay && (
          <StatHelpText fontSize="xs">
            {new Date(bestVolumeDay.date).toLocaleDateString()}
          </StatHelpText>
        )}
      </Stat>
      
      <Stat bg="orange.50" p={4} borderRadius="lg" textAlign="center">
        <StatLabel fontSize="xs" color="orange.600">Alex's 1RM</StatLabel>
        <StatNumber fontSize="xl" color="orange.700">
          {exerciseDetails?.oneRmAlex || "N/A"}
        </StatNumber>
      </Stat>
    </SimpleGrid>
  );
};

// Exercise Card Component with full functionality
const ExerciseCard = ({ 
  exercise, 
  exerciseIndex, 
  previousData, 
  onInputChange, 
  onSetCompletion, 
  onAddSet, 
  onDeleteSet, 
  onDeleteExercise,
  onOpenDetails,
  onChangeExercise,
  activeTimer,
  timerSeconds,
  onStartTimer,
  onStopTimer,
  onSupersetChange
}) => {
  const { isOpen: isDetailsOpen, onToggle: toggleDetails } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  const completedSets = exercise.sets.filter(set => set.completed).length;
  const totalSets = exercise.sets.length;
  const progressPercentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  const getPerformanceStatus = (weight, reps) => {
    const last = previousData[exercise.exercise];
    if (!last || !weight || !reps) return { color: "gray.100", message: "" };

    const lastWeight = parseFloat(last.weight_kg) || 0;
    const lastReps = parseInt(last.reps) || 0;
    const currentW = parseFloat(weight) || 0;
    const currentR = parseInt(reps) || 0;

    if (currentW > lastWeight || (currentW === lastWeight && currentR > lastReps)) {
      return { color: "green.100", message: "PR!" };
    } else if (currentW < lastWeight || (currentW === lastWeight && currentR < lastReps)) {
      return { color: "red.100", message: "Below" };
    }
    return { color: "yellow.100", message: "Match" };
  };

  return (
    <Card mb={4} shadow="md" borderRadius="xl" overflow="hidden">
      <CardBody p={0}>
        {/* Exercise Header */}
        <Box bg="gray.50" px={4} py={3}>
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={1} flex={1}>
              <HStack>
                <Heading 
                  size={{ base: "sm", md: "md" }}
                  color="gray.800"
                  cursor="pointer"
                  onClick={() => onOpenDetails && onOpenDetails(exerciseIndex)}
                  _hover={{ color: "teal.600" }}
                >
                  {exercise.exercise}
                </Heading>
                <Badge colorScheme="teal" fontSize="xs">
                  {completedSets}/{totalSets}
                </Badge>
              </HStack>
              
              {previousData[exercise.exercise] && (
                <Text fontSize="xs" color="gray.600">
                  Last: {previousData[exercise.exercise].weight_kg}kg × {previousData[exercise.exercise].reps}
                  {previousData[exercise.exercise].rpe && ` @ RPE ${previousData[exercise.exercise].rpe}`}
                </Text>
              )}
              
              <Progress 
                value={progressPercentage} 
                colorScheme="teal" 
                size="sm" 
                borderRadius="full"
                bg="gray.200"
                w="full"
              />
            </VStack>

            <VStack spacing={1}>
              <HStack spacing={1}>
                <IconButton
                  icon={<EditIcon />}
                  size="sm"
                  variant="ghost"
                  colorScheme="blue"
                  onClick={() => onChangeExercise && onChangeExercise(exerciseIndex)}
                  aria-label="Change exercise"
                  title="Change Exercise"
                />
                <IconButton
                  icon={isDetailsOpen ? <ChevronUpIcon /> : <SettingsIcon />}
                  size="sm"
                  variant="ghost"
                  onClick={toggleDetails}
                  aria-label="Toggle exercise details"
                  title="Exercise Settings"
                />
                <IconButton
                  icon={<DeleteIcon />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => onDeleteExercise(exerciseIndex)}
                  aria-label="Delete exercise"
                  title="Delete Exercise"
                />
              </HStack>
            </VStack>
          </Flex>
        </Box>

        {/* Exercise Details - Collapsible */}
        <Collapse in={isDetailsOpen}>
          <Box px={4} py={3} bg="blue.50" borderTop="1px" borderColor="blue.100">
            <Text fontSize="sm" fontWeight="semibold" mb={2} color="blue.800">
              Exercise Details
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
              <FormControl size="sm">
                <FormLabel fontSize="xs" color="gray.600">Superset</FormLabel>
                <Select
                  value={exercise.superset || ""}
                  onChange={(e) => onSupersetChange ? onSupersetChange(exerciseIndex, e.target.value) : onInputChange(exerciseIndex, -1, "superset", e.target.value)}
                  size="sm"
                  bg="white"
                >
                  <option value="">None</option>
                  <option value="Y">Y</option>
                  <option value="N">N</option>
                </Select>
              </FormControl>
              
              <FormControl size="sm">
                <FormLabel fontSize="xs" color="gray.600">%1RM</FormLabel>
                <Input
                  value={exercise.load_prescription || ""}
                  onChange={(e) => onInputChange(exerciseIndex, -1, "load_prescription", e.target.value)}
                  size="sm"
                  bg="white"
                />
              </FormControl>
              
              <FormControl size="sm">
                <FormLabel fontSize="xs" color="gray.600">Target Load</FormLabel>
                <Input
                  value={exercise.calculated_target_load || ""}
                  onChange={(e) => onInputChange(exerciseIndex, -1, "calculated_target_load", e.target.value)}
                  size="sm"
                  bg="white"
                />
              </FormControl>
              
              <FormControl size="sm">
                <FormLabel fontSize="xs" color="gray.600">Target Reps</FormLabel>
                <Input
                  value={exercise.target_reps || ""}
                  onChange={(e) => onInputChange(exerciseIndex, -1, "target_reps", e.target.value)}
                  size="sm"
                  bg="white"
                />
              </FormControl>
              
              <FormControl size="sm">
                <FormLabel fontSize="xs" color="gray.600">Rest (sec)</FormLabel>
                <Input
                  value={exercise.rest || ""}
                  onChange={(e) => onInputChange(exerciseIndex, -1, "rest", e.target.value)}
                  size="sm"
                  bg="white"
                />
              </FormControl>
              
              <FormControl size="sm">
                <FormLabel fontSize="xs" color="gray.600">Tempo</FormLabel>
                <Input
                  value={exercise.tempo || ""}
                  onChange={(e) => onInputChange(exerciseIndex, -1, "tempo", e.target.value)}
                  size="sm"
                  bg="white"
                />
              </FormControl>
              
              <FormControl size="sm" gridColumn={{ base: "span 1", md: "span 2" }}>
                <FormLabel fontSize="xs" color="gray.600">Time/Distance</FormLabel>
                <Input
                  value={exercise.time_distance || ""}
                  onChange={(e) => onInputChange(exerciseIndex, -1, "time_distance", e.target.value)}
                  size="sm"
                  bg="white"
                />
              </FormControl>
            </SimpleGrid>
          </Box>
        </Collapse>

        {/* Sets */}
        <Box px={4} py={3}>
          <VStack spacing={3}>
            {exercise.sets.map((set, setIndex) => {
              const performance = getPerformanceStatus(set.weight, set.reps);
              const isTimerActive = activeTimer?.exerciseIndex === exerciseIndex && 
                                   activeTimer?.setIndex === setIndex;
              
              return (
                <Box 
                  key={setIndex} 
                  w="full" 
                  p={3} 
                  bg={performance.color}
                  borderRadius="lg"
                  border="2px"
                  borderColor={set.completed ? "green.300" : "gray.200"}
                  position="relative"
                >
                  {/* Mobile Layout */}
                  {isMobile ? (
                    <VStack spacing={3}>
                      {/* Set Header */}
                      <Flex justify="space-between" align="center" w="full">
                        <HStack>
                          <Text fontWeight="bold" fontSize="lg" color="gray.700">
                            Set {setIndex + 1}
                          </Text>
                          {performance.message && (
                            <Badge 
                              colorScheme={performance.message === "PR!" ? "green" : 
                                         performance.message === "Below" ? "red" : "yellow"}
                              fontSize="xs"
                            >
                              {performance.message}
                            </Badge>
                          )}
                        </HStack>
                        
                        <HStack spacing={2}>
                          {isTimerActive && (
                            <TimerDisplay
                              seconds={timerSeconds}
                              isActive={isTimerActive}
                              onStart={() => onStartTimer(exerciseIndex, setIndex)}
                              onStop={onStopTimer}
                            />
                          )}
                          
                          {exercise.sets.length > 1 && (
                            <IconButton
                              icon={<DeleteIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => onDeleteSet(exerciseIndex, setIndex)}
                              aria-label="Delete set"
                            />
                          )}
                        </HStack>
                      </Flex>

                      {/* Set Inputs - Mobile Grid */}
                      <SimpleGrid columns={2} spacing={3} w="full">
                        <VStack spacing={1}>
                          <Text fontSize="xs" color="gray.600" fontWeight="semibold">
                            Weight (kg)
                          </Text>
                          <QuickSetInput
                            value={set.weight || ""}
                            onChange={(e) => onInputChange(exerciseIndex, setIndex, "weight", e.target.value)}
                            placeholder="0"
                            type="text"
                            isCompleted={set.completed}
                            bg={performance.color}
                          />
                        </VStack>

                        <VStack spacing={1}>
                          <Text fontSize="xs" color="gray.600" fontWeight="semibold">
                            Reps
                          </Text>
                          <QuickSetInput
                            value={set.reps || ""}
                            onChange={(e) => onInputChange(exerciseIndex, setIndex, "reps", e.target.value)}
                            placeholder="0"
                            type="text"
                            isCompleted={set.completed}
                            bg={performance.color}
                          />
                        </VStack>

                        <VStack spacing={1}>
                          <Text fontSize="xs" color="gray.600" fontWeight="semibold">
                            RPE
                          </Text>
                          <QuickSetInput
                            value={set.rpe || ""}
                            onChange={(e) => onInputChange(exerciseIndex, setIndex, "rpe", e.target.value)}
                            placeholder="7"
                            type="text"
                            isCompleted={set.completed}
                            bg={performance.color}
                          />
                        </VStack>

                        <VStack spacing={1}>
                          <Text fontSize="xs" color="gray.600" fontWeight="semibold">
                            Done
                          </Text>
                          <SetCompletionButton
                            isCompleted={set.completed}
                            onClick={() => onSetCompletion(exerciseIndex, setIndex, !set.completed)}
                            setNumber={setIndex + 1}
                          />
                        </VStack>
                      </SimpleGrid>

                      {/* Notes - Mobile */}
                      <Box w="full">
                        <Input
                          value={set.notes || ""}
                          onChange={(e) => onInputChange(exerciseIndex, setIndex, "notes", e.target.value)}
                          placeholder="Notes (optional)"
                          size="sm"
                          bg="white"
                          fontSize="sm"
                        />
                      </Box>
                    </VStack>
                  ) : (
                    /* Desktop Layout */
                    <VStack spacing={3}>
                      {/* Set Header */}
                      <Flex justify="space-between" align="center" w="full">
                        <HStack>
                          <Text fontWeight="bold" fontSize="lg" color="gray.700">
                            Set {setIndex + 1}
                          </Text>
                          {performance.message && (
                            <Badge 
                              colorScheme={performance.message === "PR!" ? "green" : 
                                         performance.message === "Below" ? "red" : "yellow"}
                              fontSize="xs"
                            >
                              {performance.message}
                            </Badge>
                          )}
                        </HStack>
                        
                        <HStack spacing={2}>
                          {isTimerActive && (
                            <TimerDisplay
                              seconds={timerSeconds}
                              isActive={isTimerActive}
                              onStart={() => onStartTimer(exerciseIndex, setIndex)}
                              onStop={onStopTimer}
                            />
                          )}
                          
                          {exercise.sets.length > 1 && (
                            <IconButton
                              icon={<DeleteIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => onDeleteSet(exerciseIndex, setIndex)}
                              aria-label="Delete set"
                            />
                          )}
                        </HStack>
                      </Flex>

                      {/* Set Inputs - Desktop Grid */}
                      <Grid templateColumns="1fr 1fr 1fr auto" gap={4} alignItems="center" w="full">
                        <VStack spacing={1}>
                          <Text fontSize="xs" color="gray.600" fontWeight="semibold">
                            Weight (kg)
                          </Text>
                          <QuickSetInput
                            value={set.weight || ""}
                            onChange={(e) => onInputChange(exerciseIndex, setIndex, "weight", e.target.value)}
                            placeholder="0"
                            type="text"
                            isCompleted={set.completed}
                            bg={performance.color}
                          />
                        </VStack>

                        <VStack spacing={1}>
                          <Text fontSize="xs" color="gray.600" fontWeight="semibold">
                            Reps
                          </Text>
                          <QuickSetInput
                            value={set.reps || ""}
                            onChange={(e) => onInputChange(exerciseIndex, setIndex, "reps", e.target.value)}
                            placeholder="0"
                            type="text"
                            isCompleted={set.completed}
                            bg={performance.color}
                          />
                        </VStack>

                        <VStack spacing={1}>
                          <Text fontSize="xs" color="gray.600" fontWeight="semibold">
                            RPE
                          </Text>
                          <QuickSetInput
                            value={set.rpe || ""}
                            onChange={(e) => onInputChange(exerciseIndex, setIndex, "rpe", e.target.value)}
                            placeholder="7"
                            type="text"
                            isCompleted={set.completed}
                            bg={performance.color}
                          />
                        </VStack>

                        <VStack spacing={1}>
                          <Text fontSize="xs" color="gray.600" fontWeight="semibold">
                            Done
                          </Text>
                          <SetCompletionButton
                            isCompleted={set.completed}
                            onClick={() => onSetCompletion(exerciseIndex, setIndex, !set.completed)}
                            setNumber={setIndex + 1}
                          />
                        </VStack>
                      </Grid>

                      {/* Notes - Desktop */}
                      <Box w="full">
                        <Input
                          value={set.notes || ""}
                          onChange={(e) => onInputChange(exerciseIndex, setIndex, "notes", e.target.value)}
                          placeholder="Notes (optional)"
                          size="sm"
                          bg="white"
                          fontSize="sm"
                        />
                      </Box>
                    </VStack>
                  )}
                </Box>
              );
            })}

            {/* Add Set Button */}
            <Button
              leftIcon={<AddIcon />}
              variant="outline"
              colorScheme="teal"
              size="sm"
              onClick={() => onAddSet(exerciseIndex)}
              w="full"
              borderRadius="lg"
              borderStyle="dashed"
              borderWidth="2px"
              py={6}
              _hover={{
                bg: "teal.50",
                borderColor: "teal.400",
              }}
            >
              Add Set
            </Button>
          </VStack>
        </Box>
      </CardBody>
    </Card>
  );
};

// Main DailyWorkoutLog Component
function DailyWorkoutLog({
  selectedExercises = [],
  allExercises = [],
  onUpdateExercises = () => {},
  selectedProgramId = null,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  // All original state variables
  const [logs, setLogs] = useState([]);
  const [previousData, setPreviousData] = useState({});
  const [programData, setProgramData] = useState({});
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingExercise, setEditingExercise] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  
  const [programDetails, setProgramDetails] = useState({
    program_name: location.state?.programName || "",
    program_macro_cycle: "",
    week: location.state?.week || "",
    day: location.state?.day || "",
    focus: location.state?.exercises?.[0]?.focus || "",
  });

  // Search and modal states
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showChangeSearchModal, setShowChangeSearchModal] = useState(false);
  const [selectedExerciseDetails, setSelectedExerciseDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isChangeMode, setIsChangeMode] = useState(false);
  const [editExerciseIndex, setEditExerciseIndex] = useState(null);
  
  // Timer state
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  
  // PR tracking state
  const [prData, setPrData] = useState([]);
  const [loadingPrData, setLoadingPrData] = useState(false);
  const [prError, setPrError] = useState(null);

  // Refs for initialization tracking
  const isInitialized = useRef(false);
  const isDataFetched = useRef(false);

  // Modal disclosure hooks
  const { 
    isOpen: isSearchModalOpen, 
    onOpen: onSearchModalOpen, 
    onClose: onSearchModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isChangeModalOpen, 
    onOpen: onChangeModalOpen, 
    onClose: onChangeModalClose 
  } = useDisclosure();

  // Fetch exercises from Supabase Exercise Library with pagination
  const fetchExerciseLibrary = async () => {
    try {
      let allExercises = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data: exercises, error } = await supabase
          .from("Exercise Library")
          .select(
            "Exercise, Target_Muscle_Group, Video_Demonstration, In-Depth_Explanation, Favorite, 1_RM_Alex, Primary_Equipment, Mechanics, Force_Type"
          )
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) throw error;
        if (exercises.length === 0) {
          hasMore = false;
        } else {
          allExercises = [...allExercises, ...exercises];
          page++;
        }
      }

      console.log("Fetched Exercise Library: ", allExercises.length, " exercises");
      setExerciseLibrary(allExercises);
    } catch (err) {
      console.error("Error fetching Exercise Library:", err);
      setError(err.message || "Failed to fetch exercise library");
    }
  };

  // Initialize logs with pre-loaded data if available from navigation state
  useEffect(() => {
    if (isInitialized.current) return;

    if (location.state?.exercises && location.state.exercises.length > 0) {
      const initialLogs = location.state.exercises.map((ex) => {
        const targetSets = parseInt(ex.target_sets) || 1;
        const targetWeight = ex.target_weight_kg || "";
        return {
          exercise: ex.exercise,
          superset: ex.superset || "",
          load_prescription: ex.load_prescription_p1rm || "",
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
      console.log("Initialized logs from location.state:", initialLogs.length, "exercises");
    } else if (selectedExercises.length > 0) {
      const initialLogs = selectedExercises.map((ex) => {
        const targetSets = parseInt(programData[ex.Exercise]?.target_sets) || 1;
        const targetWeight = programData[ex.Exercise]?.target_weight_kg || "";
        return {
          exercise: ex.Exercise,
          superset: programData[ex.Exercise]?.superset || "",
          load_prescription: programData[ex.Exercise]?.["load_prescription_p1rm"] || "",
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
      console.log("Initialized logs from selectedExercises:", initialLogs.length, "exercises");
    }
  }, [location.state, selectedExercises, programData, onUpdateExercises]);

  // Fetch previous workout data, program data, and exercise library
  useEffect(() => {
    if (isDataFetched.current) return;

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
            .limit(10);

          if (logError) throw logError;
          console.log("Previous Logs fetched:", logData?.length || 0, "entries");

          // Organize previous data by exercise for quick lookup (most recent first)
          const prevDataMap = {};
          logData?.forEach((log) => {
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
              "program_name, program_macro_cycle, week, day, focus, exercise, superset, target_sets, target_reps, load_prescription_p1rm, target_weight_kg, target_rpe, target_rest, target_tempo, target_time_distance"
            )
            .eq("program_id", programId);

          if (progError) throw progError;
          console.log("Program Data fetched:", progData?.length || 0, "entries");

          const progDataMap = {};
          progData?.forEach((item) => {
            progDataMap[item.exercise] = item;
          });
          setProgramData(progDataMap);

          // Set program-wide details from the first record
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
  }, [selectedExercises, selectedProgramId, location.state]);

  // Timer functions
  const startTimer = (exerciseIndex, setIndex) => {
    stopTimer();
    const startTime = Date.now();
    setActiveTimer({ exerciseIndex, setIndex, startTime });
    setTimerSeconds(0);

    const interval = setInterval(() => {
      setTimerSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    setTimerInterval(interval);
    console.log(`Timer started for Exercise ${exerciseIndex}, Set ${setIndex + 1}`);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    if (activeTimer) {
      const restTimeSeconds = Math.floor((Date.now() - activeTimer.startTime) / 1000);
      const restTimeFormatted = formatTime(restTimeSeconds);

      console.log(`Timer stopped. Rest time: ${restTimeFormatted}`);

      // Update the rest field for the specific set
      handleInputChange(
        activeTimer.exerciseIndex,
        activeTimer.setIndex,
        "rest",
        restTimeFormatted
      );

      setActiveTimer(null);
      setTimerSeconds(0);
      return restTimeFormatted;
    }
    return null;
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const isTimerActiveForSet = (exerciseIndex, setIndex) => {
    return (
      activeTimer &&
      activeTimer.exerciseIndex === exerciseIndex &&
      activeTimer.setIndex === setIndex
    );
  };

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
      const lastSet = updatedLogs[exerciseIndex].sets[updatedLogs[exerciseIndex].sets.length - 1];
      updatedLogs[exerciseIndex].sets.push({
        weight: lastSet.weight || updatedLogs[exerciseIndex].load_prescription || "",
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

  // Enhanced checkbox handler that starts/stops timer
  const handleSetCompletion = (exerciseIndex, setIndex, isCompleted) => {
    // Update the completed status
    handleInputChange(exerciseIndex, setIndex, "completed", isCompleted);

    if (isCompleted) {
      // Set is marked as done - start timer
      startTimer(exerciseIndex, setIndex);
      if (toast) {
        toast({
          title: "Set completed!",
          description: "Rest timer started",
          status: "success",
          duration: 2000,
          isClosable: true,
          position: "top",
        });
      }
    } else {
      // Set is unmarked - stop timer if it's active for this set
      if (isTimerActiveForSet(exerciseIndex, setIndex)) {
        stopTimer();
      }
    }
  };
// Add a new exercise to the log
const addExerciseToLog = (exerciseName) => {
  if (!exerciseName) return;
  if (logs.some((log) => log.exercise === exerciseName)) {
    if (toast) {
      toast({
        title: "Exercise already added",
        description: "This exercise is already in your workout",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
    return;
  }
  
  const exercise = exerciseLibrary.find((ex) => ex.Exercise === exerciseName);
  if (exercise) {
    const targetSets = parseInt(programData[exercise.Exercise]?.target_sets) || 1;
    const targetWeight = programData[exercise.Exercise]?.target_weight_kg || "";
    const newLog = {
      exercise: exercise.Exercise,
      superset: programData[exercise.Exercise]?.superset || "",
      load_prescription: programData[exercise.Exercise]?.["load_prescription_p1rm"] || "",
      calculated_target_load: targetWeight,
      target_reps: programData[exercise.Exercise]?.target_reps || "",
      rest: programData[exercise.Exercise]?.target_rest || "",
      tempo: programData[exercise.Exercise]?.target_tempo || "",
      time_distance: programData[exercise.Exercise]?.target_time_distance || "",
      sets: Array.from({ length: targetSets }, () => ({
        weight: targetWeight,
        reps: programData[exercise.Exercise]?.target_reps || "",
        rpe: programData[exercise.Exercise]?.target_rpe || "",
        completed: false,
        notes: "",
      })),
    };
    setLogs((prev) => [...prev, newLog]);
    onUpdateExercises([...selectedExercises, exercise]);
    setSearchTerm("");
    onSearchModalClose();
  }
};

// Replace an existing exercise with a new one
const replaceExercise = (exerciseIndex, newExerciseName) => {
  if (!newExerciseName) return;
  const newExercise = exerciseLibrary.find((ex) => ex.Exercise === newExerciseName);
  if (newExercise) {
    const targetSets = parseInt(programData[newExercise.Exercise]?.target_sets) || 1;
    const targetWeight = programData[newExercise.Exercise]?.target_weight_kg || "";
    const newLog = {
      exercise: newExercise.Exercise,
      superset: programData[newExercise.Exercise]?.superset || "",
      load_prescription: programData[newExercise.Exercise]?.["load_prescription_p1rm"] || "",
      calculated_target_load: targetWeight,
      target_reps: programData[newExercise.Exercise]?.target_reps || "",
      rest: programData[newExercise.Exercise]?.target_rest || "",
      tempo: programData[newExercise.Exercise]?.target_tempo || "",
      time_distance: programData[newExercise.Exercise]?.target_time_distance || "",
      sets: Array.from({ length: targetSets }, () => ({
        weight: targetWeight,
        reps: programData[newExercise.Exercise]?.target_reps || "",
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
    
    // Update selectedExercises
    const updatedExercises = [...selectedExercises];
    updatedExercises[exerciseIndex] = newExercise;
    onUpdateExercises(updatedExercises);
    
    // Close modals and reset states
    setSelectedExerciseDetails(null);
    setIsDetailsModalOpen(false);
    setIsChangeMode(false);
    setEditExerciseIndex(null);
    onChangeModalClose();
    setSearchTerm("");
    
    if (toast) {
      toast({
        title: "Exercise changed",
        description: `Changed to ${newExerciseName}`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  }
};

// Open change exercise modal
const openChangeExercise = (exerciseIndex) => {
  setEditExerciseIndex(exerciseIndex);
  setIsChangeMode(true);
  setSearchTerm("");
  onChangeModalClose(); // Close any existing modal first
  setTimeout(() => onChangeModalOpen(), 100); // Open with slight delay
};

// Handle exercise selection from change modal
const handleChangeExerciseSelect = (exerciseName) => {
  if (editExerciseIndex !== null) {
    replaceExercise(editExerciseIndex, exerciseName);
  }
};

// Open details modal for an exercise with PR data
const openDetailsModal = (exerciseIndex) => {
  const exercise = logs[exerciseIndex];
  // Find additional details from exerciseLibrary if available
  const exerciseDetails = exerciseLibrary.find(
    (ex) => ex.Exercise?.trim().toLowerCase() === exercise.exercise?.trim().toLowerCase()
  ) || {};

  setSelectedExerciseDetails({
    ...exercise,
    index: exerciseIndex,
    targetMuscleGroup: exerciseDetails.Target_Muscle_Group || "N/A",
    videoDemonstration: exerciseDetails.Video_Demonstration || "",
    inDepthExplanation: exerciseDetails["In-Depth_Explanation"] || "",
    favorite: exerciseDetails.Favorite || "",
    oneRmAlex: exerciseDetails["1_RM_Alex"] || "N/A",
    primaryEquipment: exerciseDetails.Primary_Equipment || "N/A",
    mechanics: exerciseDetails.Mechanics || "N/A",
    forceType: exerciseDetails.Force_Type || "N/A",
  });

  setIsDetailsModalOpen(true);
  setIsEditMode(false);
  setIsChangeMode(false);
  setEditExerciseIndex(exerciseIndex);

  // Fetch PR data for this exercise
  fetchPrData(exercise.exercise);
};

// Fetch PR progression data for an exercise
const fetchPrData = async (exerciseName) => {
  try {
    setLoadingPrData(true);
    setPrError(null);

    console.log("Fetching PR data for:", exerciseName);

    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setPrError("You must be logged in to view PR data");
      return;
    }

    // Fetch all workout logs for this exercise for the current user
    const { data: workoutLogs, error } = await supabase
      .from("Workout_Daily_Log")
      .select("date, weight_kg, reps, rpe, set")
      .eq("exercise", exerciseName)
      .eq("user_id", session.user.id)
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching PR data:", error);
      throw error;
    }

    console.log("Raw workout logs:", workoutLogs);

    if (!workoutLogs || workoutLogs.length === 0) {
      setPrData([]);
      return;
    }

    // Process the data to calculate key strength metrics
    const processedData = processWorkoutDataForPrChart(workoutLogs);
    console.log("Processed PR data:", processedData);

    setPrData(processedData);
  } catch (err) {
    console.error("Error fetching PR data:", err);
    setPrError(err.message || "Failed to fetch PR data");
  } finally {
    setLoadingPrData(false);
  }
};

// Process workout data into PR progression metrics
const processWorkoutDataForPrChart = (workoutLogs) => {
  // Group by date and calculate daily bests
  const dailyData = {};

  workoutLogs.forEach((log) => {
    const date = log.date;
    const weight = parseFloat(log.weight_kg) || 0;
    const reps = parseInt(log.reps) || 0;
    const rpe = parseFloat(log.rpe) || null;

    if (weight > 0 && reps > 0) {
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          maxWeight: weight,
          bestSet: { weight, reps, rpe },
          totalVolume: 0,
          avgRpe: [],
          estimated1RM: 0,
        };
      }

      // Track max weight for the day
      if (weight > dailyData[date].maxWeight) {
        dailyData[date].maxWeight = weight;
        dailyData[date].bestSet = { weight, reps, rpe };
      }

      // Calculate volume (weight x reps)
      dailyData[date].totalVolume += weight * reps;

      // Track RPE if available
      if (rpe) {
        dailyData[date].avgRpe.push(rpe);
      }
    }
  });

  // Convert to array and calculate additional metrics
  const chartData = Object.values(dailyData).map((day) => {
    const { weight, reps } = day.bestSet;

    // Calculate estimated 1RM using Epley formula: weight * (1 + reps/30)
    const estimated1RM = Math.round(weight * (1 + reps / 30));

    // Calculate average RPE for the day
    const avgRpe = day.avgRpe.length > 0
      ? Math.round((day.avgRpe.reduce((a, b) => a + b, 0) / day.avgRpe.length) * 10) / 10
      : null;

    return {
      date: day.date,
      formattedDate: new Date(day.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      maxWeight: day.maxWeight,
      bestReps: day.bestSet.reps,
      estimated1RM,
      totalVolume: day.totalVolume,
      avgRpe,
      // Calculate relative intensity (% of estimated 1RM)
      relativeIntensity: Math.round((day.maxWeight / estimated1RM) * 100),
    };
  });

  // Sort by date
  return chartData.sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Save edited exercise details to Supabase
const saveEditedDetails = async () => {
  if (!editingExercise) return;

  try {
    setSaving(true);
    setError(null);

    // Check authentication first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError("You must be logged in to update exercise details");
      return;
    }

    console.log("=== UPDATING EXERCISE DETAILS ===");
    console.log("Exercise name:", selectedExerciseDetails.exercise);

    // First, find the exact record
    const { data: findData, error: findError } = await supabase
      .from("Exercise Library")
      .select("*")
      .eq("Exercise", editingExercise.exercise);

    if (findError) throw findError;
    if (!findData || findData.length === 0) {
      throw new Error(`Exercise "${editingExercise.exercise}" not found in database`);
    }

    const currentRecord = findData[0];
    const updateData = {};

    // Only include fields that have actually changed
    if (currentRecord.Target_Muscle_Group !== editingExercise.targetMuscleGroup) {
      updateData.Target_Muscle_Group = editingExercise.targetMuscleGroup;
    }
    if (currentRecord.Video_Demonstration !== editingExercise.videoDemonstration) {
      updateData.Video_Demonstration = editingExercise.videoDemonstration;
    }
    if (currentRecord["In-Depth_Explanation"] !== editingExercise.inDepthExplanation) {
      updateData["In-Depth_Explanation"] = editingExercise.inDepthExplanation;
    }
    if (currentRecord.Favorite !== editingExercise.favorite) {
      updateData.Favorite = editingExercise.favorite;
    }
    if (currentRecord["1_RM_Alex"] !== editingExercise.oneRmAlex) {
      updateData["1_RM_Alex"] = editingExercise.oneRmAlex;
    }

    // If no fields have changed, don't perform update
    if (Object.keys(updateData).length === 0) {
      if (toast) {
        toast({
          title: "No changes detected",
          description: "Exercise details are already up to date!",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
      setIsDetailsModalOpen(false);
      setSelectedExerciseDetails(null);
      setIsEditMode(false);
      setEditingExercise(null);
      return;
    }

    // Update the Exercise Library table
    const { data: updateResult, error: updateError } = await supabase
      .from("Exercise Library")
      .update(updateData)
      .eq("Exercise", editingExercise.exercise)
      .select();

    if (updateError) {
      console.error("Supabase update error details:", updateError);
      throw updateError;
    }

    // Check if the update actually affected any rows
    if (!updateResult || updateResult.length === 0) {
      throw new Error("Update was blocked - check your permissions.");
    }

    // Update local state to reflect changes
    setExerciseLibrary((prevLibrary) =>
      prevLibrary.map((ex) =>
        ex.Exercise === editingExercise.exercise ? { ...ex, ...updateData } : ex
      )
    );

    // Update the selected exercise for the modal
    setSelectedExerciseDetails((prev) => ({ ...prev, ...updateData }));

    if (toast) {
      toast({
        title: "Exercise updated!",
        description: `Updated ${Object.keys(updateData).length} field(s) successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }

    // Close modal after success
    setTimeout(() => {
      setIsDetailsModalOpen(false);
      setIsEditMode(false);
      setEditingExercise(null);
    }, 1000);
  } catch (err) {
    console.error("Error updating exercise details:", err);
    setError(err.message || "Failed to update exercise details");
    if (toast) {
      toast({
        title: "Update failed",
        description: err.message || "Failed to update exercise details",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
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

  // Handle all other fields normally
  setEditingExercise((prev) => ({ ...prev, [field]: value }));
};

// Toggle favorite status
const toggleFavorite = async (exerciseName, currentFavorite) => {
  try {
    const newFavoriteValue = currentFavorite?.toLowerCase() === "yes" || 
                            currentFavorite?.toLowerCase() === "y" ? "No" : "Yes";

    const { error } = await supabase
      .from("Exercise Library")
      .update({ Favorite: newFavoriteValue })
      .eq("Exercise", exerciseName);

    if (error) throw error;

    // Update local state
    setExerciseLibrary((prevLibrary) =>
      prevLibrary.map((ex) =>
        ex.Exercise === exerciseName ? { ...ex, Favorite: newFavoriteValue } : ex
      )
    );

    // Update selected exercise details if it's the same exercise
    if (selectedExerciseDetails?.exercise === exerciseName) {
      setSelectedExerciseDetails((prev) => ({ ...prev, favorite: newFavoriteValue }));
    }

    if (toast) {
      toast({
        title: newFavoriteValue === "Yes" ? "Added to favorites" : "Removed from favorites",
        description: exerciseName,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  } catch (err) {
    console.error("Error toggling favorite:", err);
    if (toast) {
      toast({
        title: "Error updating favorite",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }
};

// Save logs to Supabase
const saveLogs = async () => {
  setSaving(true);
  try {
    setError(null);
    setSuccessMessage(null);

    // Get current user session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
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
          const previousRepKg = last ? `${last.reps} x ${last["weight_kg"]}kg` : "N/A";
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
            rest: set.rest || log.rest || "N/A",
            tempo: log.tempo || "N/A",
            time_distance: log.time_distance || "N/A",
            completed: set.completed || false,
            notes: set.notes || "",
            date: currentDate || new Date().toISOString().split("T")[0],
            user_id: userId,
            program_id: location.state?.programId || selectedProgramId || "N/A",
          });
        }
      });
    });

    if (logEntries.length === 0) {
      if (toast) {
        toast({
          title: "No data to save",
          description: "Please enter weight and reps for at least one set.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      }
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("Workout_Daily_Log").insert(logEntries);
    if (error) throw error;

    if (toast) {
      toast({
        title: "Workout saved!",
        description: "Your workout has been logged successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }

    setTimeout(() => {
      setLogs([]);
      onUpdateExercises([]);
      navigate("/"); // Redirect to dashboard after saving
    }, 2000);
  } catch (err) {
    setError(err.message || "Failed to save workout logs");
    if (toast) {
      toast({
        title: "Error saving workout",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  } finally {
    setSaving(false);
  }
};

// Clean up timer on unmount
useEffect(() => {
  return () => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
  };
}, [timerInterval]);

// Workout statistics
const workoutStats = {
  totalExercises: logs.length,
  completedSets: logs.reduce((acc, log) => acc + log.sets.filter(set => set.completed).length, 0),
  totalSets: logs.reduce((acc, log) => acc + log.sets.length, 0),
  totalVolume: logs.reduce((acc, log) => 
    acc + log.sets.reduce((setAcc, set) => 
      setAcc + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0), 0
    ), 0
  ),
};

// Loading state
if (loading) {
  return (
    <Container maxW={{ base: "full", md: "4xl" }} centerContent pt={8}>
      <VStack spacing={4}>
        <Spinner size="xl" color="teal.500" thickness="4px" />
        <Text>Loading workout...</Text>
      </VStack>
    </Container>
  );
}

// Error state
if (error) {
  return (
    <Container maxW={{ base: "full", md: "4xl" }} p={4}>
      <Alert status="error" mt={4}>
        <AlertIcon />
        {error}
      </Alert>
    </Container>
  );
}

// Success message state
if (successMessage) {
  return (
    <Container maxW={{ base: "full", md: "4xl" }} p={4}>
      <Alert status="success" mt={4}>
        <AlertIcon />
        {successMessage}
      </Alert>
    </Container>
  );
}

return (
  <Container maxW={{ base: "full", md: "4xl" }} p={0} minH="100vh" bg="gray.50">
    {/* Header */}
    <Box bg="white" shadow="sm" position="sticky" top={0} zIndex={10}>
      <Flex align="center" justify="space-between" p={4}>
        <HStack>
          <IconButton
            icon={<ArrowBackIcon />}
            variant="ghost"
            onClick={() => navigate("/")}
            aria-label="Back to dashboard"
          />
          <VStack align="start" spacing={0}>
            <Heading size={{ base: "sm", md: "md" }} color="gray.800">
              Daily Workout
            </Heading>
            <Text fontSize="sm" color="gray.600">
              {new Date(currentDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </Text>
          </VStack>
        </HStack>
        
        <HStack spacing={2}>
          {/* Add Exercise Button */}
          <Button
            leftIcon={<AddIcon />}
            size="sm"
            colorScheme="teal"
            variant="outline"
            onClick={onSearchModalOpen}
          >
            {isMobile ? "" : "Add Exercise"}
          </Button>
          
          {/* Date Input */}
          <Input
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            size="sm"
            w="auto"
            bg="gray.50"
          />
        </HStack>
      </Flex>

      {/* Program Details - Collapsible */}
      {programDetails.program_name && (
        <Collapse in={!!programDetails.program_name}>
          <Box px={4} pb={2}>
            <Text fontSize="xs" color="gray.600" mb={2}>Program Details:</Text>
            <Flex gap={2} wrap="wrap" direction={{ base: "column", md: "row" }}>
              <FormControl width={{ base: "full", md: "200px" }} size="sm">
                <FormLabel fontSize="xs">Program Name</FormLabel>
                <Input
                  value={programDetails.program_name}
                  onChange={(e) => handleProgramDetailsChange("program_name", e.target.value)}
                  size="sm"
                  bg="white"
                />
              </FormControl>
              <FormControl width={{ base: "full", md: "150px" }} size="sm">
                <FormLabel fontSize="xs">Macro Cycle</FormLabel>
                <Input
                  value={programDetails.program_macro_cycle}
                  onChange={(e) => handleProgramDetailsChange("program_macro_cycle", e.target.value)}
                  size="sm"
                  bg="white"
                />
              </FormControl>
              <FormControl width={{ base: "full", md: "80px" }} size="sm">
                <FormLabel fontSize="xs">Week</FormLabel>
                <Input
                  value={programDetails.week}
                  onChange={(e) => handleProgramDetailsChange("week", e.target.value)}
                  size="sm"
                  bg="white"
                />
              </FormControl>
              <FormControl width={{ base: "full", md: "80px" }} size="sm">
                <FormLabel fontSize="xs">Day</FormLabel>
                <Input
                  value={programDetails.day}
                  onChange={(e) => handleProgramDetailsChange("day", e.target.value)}
                  size="sm"
                  bg="white"
                />
              </FormControl>
              <FormControl width={{ base: "full", md: "200px" }} size="sm">
                <FormLabel fontSize="xs">Focus</FormLabel>
                <Select
                  value={programDetails.focus}
                  onChange={(e) => handleProgramDetailsChange("focus", e.target.value)}
                  size="sm"
                  bg="white"
                  placeholder="Select focus"
                >
                  <option value="Power (Speed x Force)">Power (Speed x Force)</option>
                  <option value="Strength">Strength</option>
                  <option value="Hypertrophy (Muscle Growth)">Hypertrophy (Muscle Growth)</option>
                  <option value="Muscular Endurance">Muscular Endurance</option>
                  <option value="Maximal Aerobic Output (VO2 Max)">Maximal Aerobic Output (VO2 Max)</option>
                  <option value="Long Duration Steady State Exercise">Long Duration Steady State Exercise</option>
                  <option value="Mobility, Stability, Yoga">Mobility, Stability, Yoga</option>
                  <option value="Other">Other</option>
                </Select>
              </FormControl>
            </Flex>
          </Box>
        </Collapse>
      )}

      {/* Workout Stats */}
      {logs.length > 0 && (
        <Box px={4} pb={4}>
          <SimpleGrid columns={4} spacing={2}>
            <Stat textAlign="center" bg="teal.50" p={2} borderRadius="md">
              <StatNumber fontSize={{ base: "md", md: "lg" }} color="teal.600">
                {workoutStats.completedSets}
              </StatNumber>
              <StatLabel fontSize="xs" color="teal.600">
                Sets Done
              </StatLabel>
            </Stat>
            
            <Stat textAlign="center" bg="blue.50" p={2} borderRadius="md">
              <StatNumber fontSize={{ base: "md", md: "lg" }} color="blue.600">
                {workoutStats.totalExercises}
              </StatNumber>
              <StatLabel fontSize="xs" color="blue.600">
                Exercises
              </StatLabel>
            </Stat>
            
            <Stat textAlign="center" bg="purple.50" p={2} borderRadius="md">
              <StatNumber fontSize={{ base: "md", md: "lg" }} color="purple.600">
                {Math.round(workoutStats.totalVolume)}
              </StatNumber>
              <StatLabel fontSize="xs" color="purple.600">
                Volume
              </StatLabel>
            </Stat>
            
            <Stat textAlign="center" bg="orange.50" p={2} borderRadius="md">
              <StatNumber fontSize={{ base: "md", md: "lg" }} color="orange.600">
                {workoutStats.totalSets > 0 ? Math.round((workoutStats.completedSets / workoutStats.totalSets) * 100) : 0}%
              </StatNumber>
              <StatLabel fontSize="xs" color="orange.600">
                Progress
              </StatLabel>
            </Stat>
          </SimpleGrid>
        </Box>
      )}
    </Box>

    {/* Exercise List */}
    <Box px={{ base: 2, md: 4 }} py={4}>
      {logs.length > 0 ? (
        <VStack spacing={0}>
          {logs.map((log, exerciseIndex) => (
            <ExerciseCard
              key={exerciseIndex}
              exercise={log}
              exerciseIndex={exerciseIndex}
              previousData={previousData}
              onInputChange={handleInputChange}
              onSetCompletion={handleSetCompletion}
              onAddSet={addSet}
              onDeleteSet={deleteSet}
              onDeleteExercise={deleteExercise}
              onOpenDetails={openDetailsModal}
              onChangeExercise={openChangeExercise}
              activeTimer={activeTimer}
              timerSeconds={timerSeconds}
              onStartTimer={startTimer}
              onStopTimer={stopTimer}
              onSupersetChange={handleSupersetChange}
            />
          ))}
        </VStack>
      ) : (
        <Card>
          <CardBody textAlign="center" py={12}>
            <Text color="gray.500" fontSize="lg" mb={4}>
              No exercises in this workout
            </Text>
            <Button colorScheme="teal" onClick={onSearchModalOpen}>
              Add Exercises
            </Button>
          </CardBody>
        </Card>
      )}
    </Box>

    {/* Save Button */}
    {logs.length > 0 && (
      <Box 
        position="sticky" 
        bottom={0} 
        bg="white" 
        p={4} 
        shadow="lg"
        borderTop="1px"
        borderColor="gray.200"
      >
        <Button
          colorScheme="teal"
          size="lg"
          w="full"
          onClick={saveLogs}
          isLoading={saving}
          loadingText="Saving..."
          leftIcon={<CheckIcon />}
          borderRadius="xl"
          py={6}
          fontSize="lg"
          fontWeight="bold"
        >
          Complete Workout
        </Button>
      </Box>
    )}

    {/* Add Exercise Search Modal */}
    <ExerciseSearchModal
        isOpen={isSearchModalOpen}
        onClose={onSearchModalClose}
        exerciseLibrary={exerciseLibrary}
        onSelectExercise={addExerciseToLog}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        title="Add Exercise"
      />

      {/* Change Exercise Search Modal */}
      <ExerciseSearchModal
        isOpen={isChangeModalOpen}
        onClose={onChangeModalClose}
        exerciseLibrary={exerciseLibrary}
        onSelectExercise={handleChangeExerciseSelect}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        title="Change Exercise"
      />

      {/* Exercise Details Modal with Full Analytics */}
      <Modal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)} 
        size={{ base: "full", md: "6xl" }}
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>
            <HStack justify="space-between" w="full">
              <HStack>
                <Text>{selectedExerciseDetails?.exercise}</Text>
                <Badge colorScheme="blue">Exercise Analytics</Badge>
              </HStack>
              <HStack spacing={2}>
                {/* Favorite Toggle */}
                <IconButton
                  icon={<StarIcon />}
                  colorScheme={
                    selectedExerciseDetails?.favorite?.toLowerCase() === "yes" || 
                    selectedExerciseDetails?.favorite?.toLowerCase() === "y" 
                      ? "yellow" 
                      : "gray"
                  }
                  variant={
                    selectedExerciseDetails?.favorite?.toLowerCase() === "yes" || 
                    selectedExerciseDetails?.favorite?.toLowerCase() === "y" 
                      ? "solid" 
                      : "outline"
                  }
                  size="sm"
                  onClick={() => toggleFavorite(
                    selectedExerciseDetails?.exercise, 
                    selectedExerciseDetails?.favorite
                  )}
                  aria-label="Toggle favorite"
                  title={
                    selectedExerciseDetails?.favorite?.toLowerCase() === "yes" || 
                    selectedExerciseDetails?.favorite?.toLowerCase() === "y" 
                      ? "Remove from favorites" 
                      : "Add to favorites"
                  }
                />
                
                {/* Edit Toggle */}
                <IconButton
                  icon={<EditIcon />}
                  colorScheme={isEditMode ? "blue" : "gray"}
                  variant={isEditMode ? "solid" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (!isEditMode) {
                      setEditingExercise({ ...selectedExerciseDetails });
                    }
                    setIsEditMode(!isEditMode);
                  }}
                  aria-label="Toggle edit mode"
                  title={isEditMode ? "Cancel editing" : "Edit exercise details"}
                />
              </HStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedExerciseDetails && (
              <Tabs variant="enclosed" colorScheme="teal">
                <TabList>
                  <Tab>📊 Analytics</Tab>
                  <Tab>📋 Details</Tab>
                  <Tab>📈 Progress Charts</Tab>
                </TabList>

                <TabPanels>
                  {/* Analytics Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      {/* Exercise Statistics */}
                      <ExerciseStats 
                        prData={prData} 
                        exerciseDetails={selectedExerciseDetails} 
                      />

                      {/* Quick Stats Grid */}
                      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                        <Stat bg="gray.50" p={4} borderRadius="lg" textAlign="center">
                          <StatLabel fontSize="xs" color="gray.600">Target Muscle</StatLabel>
                          <StatNumber fontSize="md" color="gray.700">
                            {selectedExerciseDetails.targetMuscleGroup}
                          </StatNumber>
                        </Stat>
                        
                        <Stat bg="gray.50" p={4} borderRadius="lg" textAlign="center">
                          <StatLabel fontSize="xs" color="gray.600">Equipment</StatLabel>
                          <StatNumber fontSize="md" color="gray.700">
                            {selectedExerciseDetails.primaryEquipment}
                          </StatNumber>
                        </Stat>
                        
                        <Stat bg="gray.50" p={4} borderRadius="lg" textAlign="center">
                          <StatLabel fontSize="xs" color="gray.600">Mechanics</StatLabel>
                          <StatNumber fontSize="md" color="gray.700">
                            {selectedExerciseDetails.mechanics}
                          </StatNumber>
                        </Stat>
                        
                        <Stat bg="gray.50" p={4} borderRadius="lg" textAlign="center">
                          <StatLabel fontSize="xs" color="gray.600">Force Type</StatLabel>
                          <StatNumber fontSize="md" color="gray.700">
                            {selectedExerciseDetails.forceType}
                          </StatNumber>
                        </Stat>
                      </SimpleGrid>

                      {/* Recent Performance */}
                      {prData.length > 0 && (
                        <Box>
                          <Heading size="sm" mb={4}>Recent Performance</Heading>
                          <SimpleGrid columns={1} spacing={3}>
                            {prData.slice(-5).reverse().map((session, index) => (
                              <Box key={index} p={3} bg="gray.50" borderRadius="md">
                                <HStack justify="space-between">
                                  <VStack align="start" spacing={1}>
                                    <Text fontSize="sm" fontWeight="bold">
                                      {new Date(session.date).toLocaleDateString()}
                                    </Text>
                                    <Text fontSize="xs" color="gray.600">
                                      {session.maxWeight}kg × {session.bestReps} reps
                                    </Text>
                                  </VStack>
                                  <VStack align="end" spacing={1}>
                                    <Badge colorScheme="teal">
                                      {session.estimated1RM}kg 1RM
                                    </Badge>
                                    <Text fontSize="xs" color="gray.600">
                                      Volume: {Math.round(session.totalVolume)}
                                    </Text>
                                  </VStack>
                                </HStack>
                              </Box>
                            ))}
                          </SimpleGrid>
                        </Box>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* Details Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      {/* Basic Exercise Info */}
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl>
                          <FormLabel>Target Muscle Group</FormLabel>
                          {isEditMode ? (
                            <Input
                              value={editingExercise?.targetMuscleGroup || ""}
                              onChange={(e) => handleEditFieldChange("targetMuscleGroup", e.target.value)}
                            />
                          ) : (
                            <Text p={2} bg="gray.50" borderRadius="md">
                              {selectedExerciseDetails.targetMuscleGroup}
                            </Text>
                          )}
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>1RM (Alex)</FormLabel>
                          {isEditMode ? (
                            <Input
                              value={editingExercise?.oneRmAlex || ""}
                              onChange={(e) => handleEditFieldChange("oneRmAlex", e.target.value)}
                              placeholder="Enter 1RM or N/A"
                            />
                          ) : (
                            <Text p={2} bg="gray.50" borderRadius="md">
                              {selectedExerciseDetails.oneRmAlex}
                            </Text>
                          )}
                        </FormControl>

                        <FormControl>
                          <FormLabel>Primary Equipment</FormLabel>
                          <Text p={2} bg="gray.50" borderRadius="md">
                            {selectedExerciseDetails.primaryEquipment}
                          </Text>
                        </FormControl>

                        <FormControl>
                          <FormLabel>
                            <HStack>
                              <Text>Favorite</Text>
                              <Switch
                                isChecked={
                                  selectedExerciseDetails.favorite?.toLowerCase() === "yes" || 
                                  selectedExerciseDetails.favorite?.toLowerCase() === "y"
                                }
                                onChange={(e) => toggleFavorite(
                                  selectedExerciseDetails.exercise, 
                                  selectedExerciseDetails.favorite
                                )}
                                colorScheme="yellow"
                              />
                            </HStack>
                          </FormLabel>
                        </FormControl>
                      </SimpleGrid>

                      {/* Video Demonstration */}
                      {selectedExerciseDetails.videoDemonstration && (
                        <FormControl>
                          <FormLabel>Video Demonstration</FormLabel>
                          {isEditMode ? (
                            <Input
                              value={editingExercise?.videoDemonstration || ""}
                              onChange={(e) => handleEditFieldChange("videoDemonstration", e.target.value)}
                              placeholder="Enter video URL"
                            />
                          ) : (
                            <Link 
                              href={selectedExerciseDetails.videoDemonstration} 
                              isExternal 
                              color="teal.500"
                              p={2} 
                              bg="gray.50" 
                              borderRadius="md" 
                              display="block"
                            >
                              {selectedExerciseDetails.videoDemonstration}
                            </Link>
                          )}
                        </FormControl>
                      )}

                      {/* In-Depth Explanation */}
                      <FormControl>
                        <FormLabel>Exercise Explanation</FormLabel>
                        {isEditMode ? (
                          <Textarea
                            value={editingExercise?.inDepthExplanation || ""}
                            onChange={(e) => handleEditFieldChange("inDepthExplanation", e.target.value)}
                            placeholder="Enter exercise explanation"
                            rows={6}
                          />
                        ) : (
                          <Text p={3} bg="gray.50" borderRadius="md" whiteSpace="pre-wrap">
                            {selectedExerciseDetails.inDepthExplanation || "No explanation available"}
                          </Text>
                        )}
                      </FormControl>

                      {/* Save Button for Edit Mode */}
                      {isEditMode && (
                        <HStack justify="end" spacing={3}>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsEditMode(false);
                              setEditingExercise(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            colorScheme="teal"
                            onClick={saveEditedDetails}
                            isLoading={saving}
                            loadingText="Saving..."
                          >
                            Save Changes
                          </Button>
                        </HStack>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* Progress Charts Tab */}
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      {loadingPrData ? (
                        <Box textAlign="center" py={8}>
                          <Spinner color="teal.500" size="lg" />
                          <Text mt={4}>Loading progress data...</Text>
                        </Box>
                      ) : prError ? (
                        <Alert status="error">
                          <AlertIcon />
                          {prError}
                        </Alert>
                      ) : prData.length > 0 ? (
                        <>
                          {/* Strength Progression Chart */}
                          <Box>
                            <Heading size="md" mb={4}>Strength Progression Over Time</Heading>
                            <Box h={{ base: "250px", md: "350px" }} w="full">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={prData}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis 
                                    dataKey="formattedDate" 
                                    fontSize={12}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                  />
                                  <YAxis fontSize={12} />
                                  <Tooltip 
                                    labelFormatter={(value, payload) => {
                                      if (payload && payload[0]) {
                                        return new Date(payload[0].payload.date).toLocaleDateString();
                                      }
                                      return value;
                                    }}
                                  />
                                  <Legend />
                                  <Line 
                                    type="monotone" 
                                    dataKey="maxWeight" 
                                    stroke="#319795" 
                                    strokeWidth={3}
                                    name="Max Weight (kg)"
                                    dot={{ fill: "#319795", strokeWidth: 2, r: 4 }}
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="estimated1RM" 
                                    stroke="#3182CE" 
                                    strokeWidth={3}
                                    name="Estimated 1RM (kg)"
                                    dot={{ fill: "#3182CE", strokeWidth: 2, r: 4 }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </Box>
                          </Box>

                          {/* Training Volume Chart */}
                          <Box>
                            <Heading size="md" mb={4}>Training Volume Progression</Heading>
                            <Box h={{ base: "250px", md: "350px" }} w="full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={prData}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis 
                                    dataKey="formattedDate" 
                                    fontSize={12}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                  />
                                  <YAxis fontSize={12} />
                                  <Tooltip 
                                    labelFormatter={(value, payload) => {
                                      if (payload && payload[0]) {
                                        return new Date(payload[0].payload.date).toLocaleDateString();
                                      }
                                      return value;
                                    }}
                                  />
                                  <Legend />
                                  <Bar 
                                    dataKey="totalVolume" 
                                    fill="#805AD5" 
                                    name="Total Volume (kg)"
                                    radius={[4, 4, 0, 0]}
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </Box>
                          </Box>

                          {/* Performance Summary */}
                          <Box>
                            <Heading size="md" mb={4}>Performance Summary</Heading>
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                              <Stat bg="green.50" p={4} borderRadius="lg" textAlign="center">
                                <StatLabel color="green.600">Total Workouts</StatLabel>
                                <StatNumber color="green.700" fontSize="2xl">
                                  {prData.length}
                                </StatNumber>
                              </Stat>
                              
                              <Stat bg="blue.50" p={4} borderRadius="lg" textAlign="center">
                                <StatLabel color="blue.600">Best Single Rep</StatLabel>
                                <StatNumber color="blue.700" fontSize="2xl">
                                  {Math.max(...prData.map(d => d.maxWeight))}kg
                                </StatNumber>
                              </Stat>
                              
                              <Stat bg="purple.50" p={4} borderRadius="lg" textAlign="center">
                                <StatLabel color="purple.600">Best Volume Day</StatLabel>
                                <StatNumber color="purple.700" fontSize="2xl">
                                  {Math.max(...prData.map(d => d.totalVolume)).toFixed(0)}
                                </StatNumber>
                              </Stat>
                            </SimpleGrid>
                          </Box>
                        </>
                      ) : (
                        <Box textAlign="center" py={8}>
                          <Text color="gray.500" fontSize="lg">
                            No workout history available for this exercise
                          </Text>
                          <Text color="gray.400" fontSize="sm" mt={2}>
                            Complete some workouts to see your progress charts
                          </Text>
                        </Box>
                      )}
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setIsDetailsModalOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}

export default DailyWorkoutLog;