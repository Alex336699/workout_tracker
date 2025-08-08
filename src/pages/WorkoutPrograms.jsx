import { debounce } from "lodash"; // Ensure lodash is installed (npm install lodash)
import { useState, useEffect, useRef, useCallback, memo } from "react";
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
  CloseButton,
  VStack,
  HStack,
  Badge,
  Select,
  IconButton,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useBreakpointValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  useSteps,
  Switch,
  RadioGroup,
  Radio,
  Stack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Image,
  Link,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import {
  ArrowBackIcon,
  EditIcon,
  DeleteIcon,
  AddIcon,
  InfoIcon,
  CalendarIcon,
  StarIcon,
  CheckIcon,
  DownloadIcon,
} from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

/*
// Add this ref for input control
const programNameRef = useRef(null);
const descriptionRef = useRef(null);
const timeWorkoutRef = useRef(null);
const equipmentRef = useRef(null);
*/

// Add this function to debug the weekOneTemplate --- DELETE LATER
const debugWeekOneTemplate = () => {
  console.log("=== DEBUG WEEK ONE TEMPLATE ===");
  console.log("weekOneTemplate structure:", weekOneTemplate);
  console.log("weekOneTemplate keys (days):", Object.keys(weekOneTemplate));
  
  Object.entries(weekOneTemplate).forEach(([day, exercisesArray]) => {
    console.log(`Day ${day}:`, exercisesArray);
    if (Array.isArray(exercisesArray)) {
      exercisesArray.forEach((exercise, index) => {
        console.log(`  Exercise ${index}:`, {
          name: exercise.exercise,
          day: exercise.day,
          sets: exercise.target_sets,
          reps: exercise.target_reps,
          weight: exercise.target_weight_kg,
          rpe: exercise.target_rpe
        });
      });
    }
  });
  console.log("=== END DEBUG ===");
};

// Constants for workout focus options
const WORKOUT_FOCUS_OPTIONS = [
  { value: "strength", label: "Strength" },
  { value: "hypertrophy", label: "Hypertrophy" },
  { value: "power", label: "Power" },
  { value: "muscular endurance", label: "Muscular Endurance" },
  { value: "other", label: "Other" },
  { value: "steady state cardio", label: "Cardio" },
  { value: "mobility | Yoga", label: "Mobility | Yoga" },
];


const PROGRESSION_TYPES = [
  {
    value: "linear",
    label: "Linear Progression",
    description: "Add weight consistently each week",
  },
  {
    value: "double",
    label: "Double Progression",
    description: "Increase reps first, then weight",
  },
  {
    value: "percentage",
    label: "Percentage-based",
    description: "Based on % of 1RM",
  },
  {
    value: "block",
    label: "Block Periodization",
    description: "Focused training blocks",
  },
  { value: "wave", label: "Wave Loading", description: "Undulating intensity" },
];

const TRAINING_STRUCTURES = [
  {
    value: "push_pull_legs",
    label: "Push/Pull/Legs",
    description: "3-day split focusing on movement patterns",
  },
  {
    value: "upper_lower",
    label: "Upper/Lower",
    description: "2-day split alternating upper and lower body",
  },
  {
    value: "full_body",
    label: "Full Body",
    description: "Train all muscle groups each session",
  },
  {
    value: "body_part",
    label: "Body Part Split",
    description: "Traditional bodybuilding split",
  },
  {
    value: "custom",
    label: "Custom Structure",
    description: "Define your own training structure",
  },
];


function WorkoutPrograms() {
  // Main state
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [expandedProgram, setExpandedProgram] = useState(null);

  // Add this state for tracking selected day in Step 4
const [selectedTrainingDay, setSelectedTrainingDay] = useState(1);

// Add this with your other state variables for Step 5
const [selectedWeekForView, setSelectedWeekForView] = useState(null);

  // Program creation state - 6-step wizard
  const [programCreationStep, setProgramCreationStep] = useState(0);
  const [isCreatingProgram, setIsCreatingProgram] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);

  // Step 1: Program Goals & Overview
  const [programOverview, setProgramOverview] = useState({
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
    Program_Length_in_Weeks: null,
    Days_Per_Week: "",
    Time_Per_Workout: "",
    Equipment: "",
    MUSCLE_ENGAGEMENT: "",
    Deload_Week: "",
    Progression: "",
    user_id: null,
  });

// Reverse - DELETE LATER
// Add these state variables at the top of your component (with other useState)
const [localProgramName, setLocalProgramName] = useState(programOverview.Program_Name || '');
const [localDescription, setLocalDescription] = useState(programOverview.Program_Description || '');
const [localTimePerWorkout, setLocalTimePerWorkout] = useState(programOverview.Time_Per_Workout || '');
const [localEquipment, setLocalEquipment] = useState(programOverview.Equipment || '');
// Add these local state variables for Step 1 inputs

const [localInputs, setLocalInputs] = useState({
  programName: programOverview.Program_Name || '',
  description: programOverview.Program_Description || '',
  timePerWorkout: programOverview.Time_Per_Workout || '',
  equipment: programOverview.Equipment || '',
});

// Sync local inputs with main state when programOverview changes
useEffect(() => {
  setLocalInputs({
    programName: programOverview.Program_Name || '',
    description: programOverview.Program_Description || '',
    timePerWorkout: programOverview.Time_Per_Workout || '',
    equipment: programOverview.Equipment || '',
  });
}, [programOverview.Program_Name, programOverview.Program_Description, programOverview.Time_Per_Workout, programOverview.Equipment]);


// Add this useEffect to sync local state with main state
useEffect(() => {
  setLocalProgramName(programOverview.Program_Name || '');
  setLocalDescription(programOverview.Program_Description || '');
  setLocalTimePerWorkout(programOverview.Time_Per_Workout || '');
  setLocalEquipment(programOverview.Equipment || '');
}, [programOverview.Program_Name, programOverview.Program_Description, programOverview.Time_Per_Workout, programOverview.Equipment]);

// Function to update main state from local inputs
const updateMainStateFromLocal = (field, value) => {
  setProgramOverview(prev => ({
    ...prev,
    [field]: value,
  }));
};


// Add this function to update main state on blur
const updateProgramOverviewOnBlur = (field, value) => {
  setProgramOverview(prev => ({
    ...prev,
    [field]: value
  }));
};



  
// Utility to debounce state updates
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Track the currently focused input
//const [activeInput, setActiveInput] = useState(null);
// Simple, explicit focus bookkeeping
const handleFocus = (key) => () => setActiveInput(key);
const handleBlur  = () => setActiveInput(null);
//const inputRefs = useRef({});
//const lastActiveInput = useRef(null);

// Handle input focus to store the active input field
/* const handleInputFocus = useCallback((field) => {
  setActiveInput(field);
  lastActiveInput.current = field;
  console.log(`Focused: ${field}`); // Debug: Log focused field
}, []);
*/

// Add this component inside your WorkoutPrograms function
const ProgramDescriptionDisplay = ({ description, programName }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const maxLength = 150; // Adjust based on your UI needs
  
  const shouldTruncate = description && description.length > maxLength;
  const truncatedText = shouldTruncate 
    ? `${description.substring(0, maxLength)}...` 
    : description;

  return (
    <>
      <Text fontSize="sm" color="gray.600" mb={2}>
        {truncatedText}
        {shouldTruncate && (
          <Button
            variant="link"
            size="sm"
            color="blue.500"
            ml={1}
            onClick={onOpen}
            fontWeight="medium"
          >
            Read More
          </Button>
        )}
      </Text>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <VStack align="start" spacing={1}>
              <Text>{programName}</Text>
              <Text fontSize="sm" color="gray.500" fontWeight="normal">
                Program Description
              </Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text lineHeight="1.6" whiteSpace="pre-wrap">
              {description}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

/*
// Add this component inside your WorkoutPrograms function
// Add this component inside your WorkoutPrograms function
const FineTuningStep = () => {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [showModifiedOnly, setShowModifiedOnly] = useState(false);

  const totalWeeks = programOverview.Program_Length_in_Weeks || 4;
  const daysPerWeek = trainingStructure.daysPerWeek || 3;

  // Get exercises for a specific week and day from the generated program
  const getGeneratedExercises = (week, day) => {
    return generatedProgram.weeks?.[week]?.exercises?.filter(ex => ex.day === day) || [];
  };

  // Get modified value or original value
  const getExerciseValue = (week, day, exerciseIndex, field, originalValue) => {
    const modifiedValue = fineTuning.modifiedWeeks?.[week]?.[day]?.[exerciseIndex]?.[field];
    return modifiedValue !== undefined ? modifiedValue : originalValue;
  };

  // Update exercise modification
  const updateExerciseModification = (week, day, exerciseIndex, field, value) => {
    setFineTuning(prev => ({
      ...prev,
      modifiedWeeks: {
        ...prev.modifiedWeeks,
        [week]: {
          ...prev.modifiedWeeks?.[week],
          [day]: {
            ...prev.modifiedWeeks?.[week]?.[day],
            [exerciseIndex]: {
              ...prev.modifiedWeeks?.[week]?.[day]?.[exerciseIndex],
              [field]: value,
            },
          },
        },
      },
    }));
  };

  // Add new exercise to existing day
  const addExerciseToDay = (week, day) => {
    const newExercise = {
      exercise: "",
      target_sets: 3,
      target_reps: 10,
      target_weight_kg: null,
      target_rpe: 7,
      target_rest: 60,
      load_prescription_p1rm: null,
      focus: programOverview.Focus,
      superset: "",
      exercise_program_note: "",
      day: day,
      week: week,
      isNew: true, // Flag to identify new exercises
    };

    // Add to fine-tuning as a new exercise
    const currentDayExercises = getGeneratedExercises(week, day);
    const newExerciseIndex = currentDayExercises.length;

    setFineTuning(prev => ({
      ...prev,
      modifiedWeeks: {
        ...prev.modifiedWeeks,
        [week]: {
          ...prev.modifiedWeeks?.[week],
          [day]: {
            ...prev.modifiedWeeks?.[week]?.[day],
            [`new_${newExerciseIndex}`]: newExercise,
          },
        },
      },
    }));
  };

  // Remove exercise (mark as deleted)
  const removeExercise = (week, day, exerciseIndex) => {
    setFineTuning(prev => ({
      ...prev,
      modifiedWeeks: {
        ...prev.modifiedWeeks,
        [week]: {
          ...prev.modifiedWeeks?.[week],
          [day]: {
            ...prev.modifiedWeeks?.[week]?.[day],
            [exerciseIndex]: {
              ...prev.modifiedWeeks?.[week]?.[day]?.[exerciseIndex],
              isDeleted: true,
            },
          },
        },
      },
    }));
  };

  // Get all exercises for a day (original + new, excluding deleted)
  const getAllDayExercises = (week, day) => {
    const originalExercises = getGeneratedExercises(week, day);
    const modifications = fineTuning.modifiedWeeks?.[week]?.[day] || {};
    
    const exercises = [];
    
    // Add original exercises (if not deleted)
    originalExercises.forEach((exercise, index) => {
      if (!modifications[index]?.isDeleted) {
        exercises.push({
          ...exercise,
          originalIndex: index,
          isOriginal: true,
        });
      }
    });
    
    // Add new exercises
    Object.entries(modifications).forEach(([key, exercise]) => {
      if (key.startsWith('new_') && exercise.isNew) {
        exercises.push({
          ...exercise,
          newKey: key,
          isOriginal: false,
        });
      }
    });
    
    return exercises;
  };

  // Check if exercise has modifications
  const hasModifications = (week, day, exerciseIndex) => {
    const mods = fineTuning.modifiedWeeks?.[week]?.[day]?.[exerciseIndex];
    return mods && Object.keys(mods).some(key => key !== 'isDeleted');
  };

  // Get modification count for week/day
  const getModificationCount = (week, day) => {
    const mods = fineTuning.modifiedWeeks?.[week]?.[day] || {};
    return Object.keys(mods).length;
  };

  // Reset modifications for specific week/day
  const resetDayModifications = (week, day) => {
    setFineTuning(prev => {
      const newModifiedWeeks = { ...prev.modifiedWeeks };
      if (newModifiedWeeks[week]) {
        delete newModifiedWeeks[week][day];
        if (Object.keys(newModifiedWeeks[week]).length === 0) {
          delete newModifiedWeeks[week];
        }
      }
      return {
        ...prev,
        modifiedWeeks: newModifiedWeeks,
      };
    });
  };

  

 
  return (
    <VStack spacing={6} align="stretch">
      {/* Program Overview */
    
    /*}
     
  
     <Card>
        <CardHeader>
          <VStack align="start" spacing={2}>
            <Heading size="md">Fine-tune Your Generated Program</Heading>
            <Text fontSize="sm" color="gray.600">
              Your {totalWeeks}-week program has been generated with {getTotalSessionsGenerated()} total sessions. 
              Make any adjustments needed below.
            </Text>
            <HStack spacing={4}>
              <Badge colorScheme="blue">
                {getTotalExercisesGenerated()} Total Exercises
              </Badge>
              {getDeloadWeeksCount() > 0 && (
                <Badge colorScheme="orange">
                  {getDeloadWeeksCount()} Deload Weeks
                </Badge>
              )}
              <Badge colorScheme="green">
                {Object.keys(fineTuning.modifiedWeeks || {}).length} Weeks Modified
              </Badge>
            </HStack>
          </VStack>
        </CardHeader>
      </Card>

      {/* Week and Day Navigation */ 
      
      /* }

      
<Card>
        <CardHeader>
          <HStack justify="space-between" align="center">
            <Heading size="md">Select Week & Day</Heading>
            <HStack>
              <Switch
                isChecked={showModifiedOnly}
                onChange={(e) => setShowModifiedOnly(e.target.checked)}
                size="sm"
              />
              <Text fontSize="sm">Show only modified</Text>
            </HStack>
          </HStack>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel>Week</FormLabel>
              <Select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
              >
                {Array.from({ length: totalWeeks }, (_, i) => i + 1)
                  .filter(week => !showModifiedOnly || fineTuning.modifiedWeeks?.[week])
                  .map(week => (
                  <option key={week} value={week}>
                    Week {week} {isDeloadWeek(week) ? '(Deload)' : ''}
                    {fineTuning.modifiedWeeks?.[week] && ' ✏️'}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Training Day</FormLabel>
              <Select
                value={selectedDay}
                onChange={(e) => setSelectedDay(parseInt(e.target.value))}
              >
                {Array.from({ length: daysPerWeek }, (_, i) => i + 1)
                  .filter(day => !showModifiedOnly || getModificationCount(selectedWeek, day) > 0)
                  .map(day => (
                  <option key={day} value={day}>
                    Day {day} - {getTrainingDayLabel(trainingStructure.type, day - 1)}
                    {getModificationCount(selectedWeek, day) > 0 && ` (${getModificationCount(selectedWeek, day)} changes)`}
                  </option>
                ))}
              </Select>
            </FormControl>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Exercise List for Selected Day */
    /* }
  
  <Card>
        <CardHeader>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Heading size="md">
                Week {selectedWeek}, Day {selectedDay} - {getTrainingDayLabel(trainingStructure.type, selectedDay - 1)}
              </Heading>
              <HStack>
                {isDeloadWeek(selectedWeek) && (
                  <Badge colorScheme="orange">Deload Week</Badge>
                )}
                {getModificationCount(selectedWeek, selectedDay) > 0 && (
                  <Badge colorScheme="blue">
                    {getModificationCount(selectedWeek, selectedDay)} Modifications
                  </Badge>
                )}
              </HStack>
            </VStack>
            <HStack>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                size="sm"
                onClick={() => addExerciseToDay(selectedWeek, selectedDay)}
              >
                Add Exercise
              </Button>
              {getModificationCount(selectedWeek, selectedDay) > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="red"
                  onClick={() => {
                    if (confirm(`Reset all changes for Week ${selectedWeek}, Day ${selectedDay}?`)) {
                      resetDayModifications(selectedWeek, selectedDay);
                    }
                  }}
                >
                  Reset Day
                </Button>
              )}
            </HStack>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            {getAllDayExercises(selectedWeek, selectedDay).map((exercise, displayIndex) => (
              <ModifiableExerciseCard
                key={exercise.isOriginal ? `orig-${exercise.originalIndex}` : exercise.newKey}
                exercise={exercise}
                week={selectedWeek}
                day={selectedDay}
                exerciseIndex={exercise.isOriginal ? exercise.originalIndex : exercise.newKey}
                isOriginal={exercise.isOriginal}
                isDeloadWeek={isDeloadWeek(selectedWeek)}
                hasModifications={exercise.isOriginal ? hasModifications(selectedWeek, selectedDay, exercise.originalIndex) : true}
                onUpdate={(field, value) => {
                  if (exercise.isOriginal) {
                    updateExerciseModification(selectedWeek, selectedDay, exercise.originalIndex, field, value);
                  } else {
                    // Update new exercise
                    setFineTuning(prev => ({
                      ...prev,
                      modifiedWeeks: {
                        ...prev.modifiedWeeks,
                        [selectedWeek]: {
                          ...prev.modifiedWeeks?.[selectedWeek],
                          [selectedDay]: {
                            ...prev.modifiedWeeks?.[selectedWeek]?.[selectedDay],
                            [exercise.newKey]: {
                              ...prev.modifiedWeeks?.[selectedWeek]?.[selectedDay]?.[exercise.newKey],
                              [field]: value,
                            },
                          },
                        },
                      },
                    }));
                  }
                }}
                onRemove={() => {
                  if (exercise.isOriginal) {
                    if (confirm('Remove this exercise from the program?')) {
                      removeExercise(selectedWeek, selectedDay, exercise.originalIndex);
                    }
                  } else {
                    // Remove new exercise
                    if (confirm('Remove this added exercise?')) {
                      setFineTuning(prev => {
                        const newModifiedWeeks = { ...prev.modifiedWeeks };
                        delete newModifiedWeeks[selectedWeek][selectedDay][exercise.newKey];
                        return {
                          ...prev,
                          modifiedWeeks: newModifiedWeeks,
                        };
                      });
                    }
                  }
                }}
                getExerciseValue={(field, originalValue) => {
                  if (exercise.isOriginal) {
                    return getExerciseValue(selectedWeek, selectedDay, exercise.originalIndex, field, originalValue);
                  } else {
                    return fineTuning.modifiedWeeks?.[selectedWeek]?.[selectedDay]?.[exercise.newKey]?.[field] || originalValue;
                  }
                }}
              />
            ))}

            {getAllDayExercises(selectedWeek, selectedDay).length === 0 && (
              <Box textAlign="center" py={8}>
                <Text color="gray.500" mb={4}>
                  No exercises generated for this day, or all have been removed.
                </Text>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="blue"
                  variant="outline"
                  onClick={() => addExerciseToDay(selectedWeek, selectedDay)}
                >
                  Add Exercise
                </Button>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Summary of All Modifications */
    
    /*}
  
      {Object.keys(fineTuning.modifiedWeeks || {}).length > 0 && (
        <Card>
          <CardHeader>
            <Heading size="sm">Modification Summary</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={2} align="stretch">
              {Object.entries(fineTuning.modifiedWeeks || {}).map(([week, weekMods]) => (
                <Box key={week} p={3} bg="gray.50" borderRadius="md">
                  <Text fontWeight="bold" fontSize="sm" mb={2}>
                    Week {week} {isDeloadWeek(parseInt(week)) && '(Deload)'}
                  </Text>
                  <HStack spacing={4} flexWrap="wrap">
                    {Object.entries(weekMods).map(([day, dayMods]) => (
                      <Badge key={day} colorScheme="blue" variant="outline">
                        Day {day}: {Object.keys(dayMods).length} changes
                      </Badge>
                    ))}
                  </HStack>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
};


// Add this component for individual exercise editing
const ModifiableExerciseCard = ({ 
  exercise, 
  week, 
  day, 
  exerciseIndex, 
  isOriginal, 
  isDeloadWeek, 
  hasModifications, 
  onUpdate, 
  onRemove, 
  getExerciseValue 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localValues, setLocalValues] = useState({});

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce((field, value) => {
      onUpdate(field, value);
    }, 300),
    [onUpdate]
  );

  const handleFieldChange = (field, value) => {
    setLocalValues(prev => ({ ...prev, [field]: value }));
    debouncedUpdate(field, value);
  };

  const getCurrentValue = (field) => {
    if (localValues[field] !== undefined) return localValues[field];
    return getExerciseValue(field, exercise[field]);
  };

  const handleExerciseSelect = (selectedExercise) => {
    onUpdate('exercise', selectedExercise.Exercise);
    onUpdate('exerciseDetails', selectedExercise);
  };

  return (
    <Card 
      variant="outline" 
      bg={isDeloadWeek ? "orange.50" : hasModifications ? "blue.50" : "white"}
      borderColor={hasModifications ? "blue.200" : "gray.200"}
    >
      <CardHeader pb={2}>
        <HStack justify="space-between">
          <HStack spacing={3}>
            <VStack align="start" spacing={1}>
              <HStack>
                <Text fontWeight="bold" fontSize="sm">
                  {getCurrentValue('exercise') || 'New Exercise'}
                </Text>
                {!isOriginal && (
                  <Badge colorScheme="green" size="sm">NEW</Badge>
                )}
                {hasModifications && isOriginal && (
                  <Badge colorScheme="blue" size="sm">MODIFIED</Badge>
                )}
                {isDeloadWeek && (
                  <Badge colorScheme="orange" size="sm">DELOAD</Badge>
                )}
              </HStack>
              <HStack fontSize="xs" color="gray.600" spacing={4}>
                <Text>{getCurrentValue('target_sets')} sets</Text>
                <Text>{getCurrentValue('target_reps')} reps</Text>
                {getCurrentValue('target_weight_kg') && (
                  <Text>{getCurrentValue('target_weight_kg')}kg</Text>
                )}
                <Text>RPE {getCurrentValue('target_rpe')}</Text>
              </HStack>
            </VStack>
          </HStack>
          <HStack>
            <IconButton
              icon={isExpanded ? <ArrowBackIcon transform="rotate(90deg)" /> : <ArrowBackIcon transform="rotate(-90deg)" />}
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? "Collapse" : "Expand"}
            />
            <IconButton
              icon={<DeleteIcon />}
              size="sm"
              colorScheme="red"
              variant="ghost"
              onClick={onRemove}
              aria-label="Remove exercise"
            />
          </HStack>
        </HStack>
      </CardHeader>

      {isExpanded && (
        <CardBody pt={0}>
          <VStack spacing={4} align="stretch">
            {/* Exercise Selection */
          /*}
  
  
  <FormControl>
              <FormLabel fontSize="sm">Exercise</FormLabel>
              <ExerciseSearchInput
                currentValue={getCurrentValue('exercise') || ""}
                onSelectExercise={handleExerciseSelect}
              />
            </FormControl>

            {/* Basic Parameters */
          /*}
 
 <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
              <FormControl>
                <FormLabel fontSize="sm">Sets</FormLabel>
                <NumberInput
                  value={getCurrentValue('target_sets') || 3}
                  onChange={(_, value) => handleFieldChange('target_sets', value)}
                  min={1}
                  max={10}
                  size="sm"
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Reps</FormLabel>
                <NumberInput
                  value={getCurrentValue('target_reps') || 10}
                  onChange={(_, value) => handleFieldChange('target_reps', value)}
                  min={1}
                  max={50}
                  size="sm"
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Weight (kg)</FormLabel>
                <NumberInput
                  value={getCurrentValue('target_weight_kg') || ""}
                  onChange={(_, value) => handleFieldChange('target_weight_kg', value)}
                  min={0}
                  step={0.25}
                  precision={2}
                  size="sm"
                >
                  <NumberInputField placeholder="Auto" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">RPE</FormLabel>
                <NumberInput
                  value={getCurrentValue('target_rpe') || 7}
                  onChange={(_, value) => handleFieldChange('target_rpe', value)}
                  min={1}
                  max={10}
                  step={0.5}
                  size="sm"
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </SimpleGrid>

            {/* Additional Parameters */
          /*}
  
  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
              <FormControl>
                <FormLabel fontSize="sm">Rest (sec)</FormLabel>
                <NumberInput
                  value={getCurrentValue('target_rest') || 60}
                  onChange={(_, value) => handleFieldChange('target_rest', value)}
                  min={15}
                  max={600}
                  step={15}
                  size="sm"
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">% 1RM</FormLabel>
                <NumberInput
                  value={getCurrentValue('load_prescription_p1rm') || ""}
                  onChange={(_, value) => handleFieldChange('load_prescription_p1rm', value)}
                  min={10}
                  max={100}
                  step={2.5}
                  size="sm"
                >
                  <NumberInputField placeholder="Auto" />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Superset</FormLabel>
                <Input
                  value={getCurrentValue('superset') || ""}
                  onChange={(e) => handleFieldChange('superset', e.target.value)}
                  placeholder="e.g., A1, B1"
                  size="sm"
                />
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel fontSize="sm">Exercise Notes</FormLabel>
              <Textarea
                value={getCurrentValue('exercise_program_note') || ""}
                onChange={(e) => handleFieldChange('exercise_program_note', e.target.value)}
                placeholder="Special instructions, modifications, etc."
                size="sm"
                rows={2}
              />
            </FormControl>
          </VStack>
        </CardBody>
      )}
    </Card>
  );
};
*/


// Helper function to get training day labels
const getTrainingDayLabel = (structureType, dayIndex) => {
  const labels = {
    push_pull_legs: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Rest'],
    upper_lower: ['Upper', 'Lower', 'Upper', 'Lower', 'Upper', 'Lower', 'Rest'],
    full_body: ['Full Body', 'Full Body', 'Full Body', 'Full Body', 'Full Body', 'Full Body', 'Rest'],
    body_part: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Rest'],
    custom: ['Custom', 'Custom', 'Custom', 'Custom', 'Custom', 'Custom', 'Rest'],
  };
  
  return labels[structureType]?.[dayIndex] || `Day ${dayIndex + 1}`;
};


// Get exercises for a specific day
const getExercisesForDay = (day) => {
  return Object.values(weekOneTemplate).filter(exercise => exercise.day === day) || [];
};

// Add these helper functions for Steps 5 & 6
// Add this improved handleGenerateProgram function
// Replace your existing handleGenerateProgram function with this corrected version
const handleGenerateProgram = async () => {
  try {
    setLoading(true);
    setError(null);
    
    console.log("🚀 Starting program generation...");
    console.log("Week 1 Template:", weekOneTemplate);
    console.log("Program Overview:", programOverview);
    console.log("Progression Rules:", progressionRules);
    
    // Get all exercises from weekOneTemplate (which is structured as {day: [exercises]})
    const templateExercises = [];
    Object.entries(weekOneTemplate).forEach(([day, exercisesArray]) => {
      if (Array.isArray(exercisesArray)) {
        exercisesArray.forEach(exercise => {
          templateExercises.push({
            ...exercise,
            day: parseInt(day) // Ensure day is set correctly
          });
        });
      }
    });
    
    console.log("Flattened template exercises:", templateExercises);
    
    if (templateExercises.length === 0) {
      throw new Error("No exercises found in Week 1 template. Please add exercises first.");
    }
    
    const totalWeeks = programOverview.Program_Length_in_Weeks || 4;
    const generatedWeeks = {};
    
    // Generate each week
    for (let week = 1; week <= totalWeeks; week++) {
      console.log(`📅 Generating Week ${week}...`);
      
      // Check if this is a deload week
      const isDeload = week % (progressionRules.deloadFrequency || 4) === 0;
      
      // Generate exercises for this week based on Week 1 template
     // Replace the progression logic in handleGenerateProgram with this:
const weekExercises = templateExercises.map((baseExercise, index) => {
  // Calculate progression for this week
  let progressedExercise = { ...baseExercise };
  
  if (isDeload) {
    // Deload week - reduce intensity
    const deloadMultiplier = (progressionRules.deloadPercentage || 80) / 100;
    
    if (progressedExercise.target_weight_kg) {
      progressedExercise.target_weight_kg = Math.round(
        progressedExercise.target_weight_kg * deloadMultiplier * 4
      ) / 4; // Round to nearest 0.25kg
    }
    
    if (progressedExercise.target_rpe) {
      progressedExercise.target_rpe = Math.max(
        6, 
        progressedExercise.target_rpe - 1
      );
    }
    
    progressedExercise.week_progression_note = `Deload week - ${progressionRules.deloadPercentage}% intensity`;
  } else {
    // Apply progression based on type
    switch (progressionRules.type) {
      case 'linear':
        if (progressedExercise.target_weight_kg) {
          const weekProgression = (week - 1) * (progressionRules.weightProgression || 2.5);
          progressedExercise.target_weight_kg = Math.round(
            (progressedExercise.target_weight_kg + weekProgression) * 4
          ) / 4; // Round to nearest 0.25kg
        }
        progressedExercise.week_progression_note = `Linear progression: +${progressionRules.weightProgression || 2.5}kg per week`;
        break;

      case 'double':
        const repMin = progressionRules.repRangeMin || 8;
        const repMax = progressionRules.repRangeMax || 12;
        const baseReps = baseExercise.target_reps || repMin;
        
        // Calculate which week we're in within the double progression cycle
        const weeksToMaxReps = repMax - repMin + 1;
        const cycleWeek = ((week - 1) % (weeksToMaxReps + 1)) + 1;
        
        if (cycleWeek <= weeksToMaxReps) {
          // Still increasing reps
          progressedExercise.target_reps = Math.min(repMax, baseReps + (cycleWeek - 1));
          progressedExercise.week_progression_note = `Double progression: Week ${cycleWeek} of rep range ${repMin}-${repMax}`;
        } else {
          // Reset reps and increase weight
          progressedExercise.target_reps = repMin;
          if (progressedExercise.target_weight_kg) {
            const weightIncrements = Math.floor((week - 1) / weeksToMaxReps);
            progressedExercise.target_weight_kg = Math.round(
              (progressedExercise.target_weight_kg + (weightIncrements * (progressionRules.weightProgression || 2.5))) * 4
            ) / 4;
          }
          progressedExercise.week_progression_note = `Double progression: Weight increased, reps reset to ${repMin}`;
        }
        break;

      case 'percentage':
        if (progressedExercise.load_prescription_p1rm || progressedExercise.exerciseDetails?.['1_RM_Alex']) {
          const startingPercentage = progressionRules.startingPercentage || 70;
          const weeklyIncrease = progressionRules.percentageIncrease || 2.5;
          const currentPercentage = startingPercentage + ((week - 1) * weeklyIncrease);
          
          // Update the load prescription
          progressedExercise.load_prescription_p1rm = Math.min(95, currentPercentage);
          
          // Recalculate weight based on new percentage
          if (progressedExercise.exerciseDetails?.['1_RM_Alex']) {
            const oneRM = parseFloat(progressedExercise.exerciseDetails['1_RM_Alex']);
            progressedExercise.target_weight_kg = Math.round(
              (oneRM * currentPercentage / 100) * 4
            ) / 4;
          }
          
          progressedExercise.week_progression_note = `Percentage-based: ${currentPercentage.toFixed(1)}% of 1RM`;
        }
        break;

      case 'block':
        const blockLength = progressionRules.blockLength || 4;
        const blockNumber = Math.floor((week - 1) / blockLength) + 1;
        const weekInBlock = ((week - 1) % blockLength) + 1;
        const blockFocus = progressionRules.blockFocus || 'accumulation';
        
        switch (blockFocus) {
          case 'accumulation':
            // Increase volume (sets/reps) while maintaining intensity
            if (weekInBlock <= 2) {
              progressedExercise.target_sets = Math.min(6, (baseExercise.target_sets || 3) + weekInBlock - 1);
            } else {
              progressedExercise.target_reps = Math.min(15, (baseExercise.target_reps || 10) + weekInBlock - 2);
            }
            progressedExercise.week_progression_note = `Block ${blockNumber} (Accumulation): Week ${weekInBlock}`;
            break;
            
          case 'intensification':
            // Increase intensity while reducing volume
            if (progressedExercise.target_weight_kg) {
              const intensityIncrease = weekInBlock * 2.5;
              progressedExercise.target_weight_kg = Math.round(
                (progressedExercise.target_weight_kg + intensityIncrease) * 4
              ) / 4;
            }
            progressedExercise.target_reps = Math.max(3, (baseExercise.target_reps || 10) - weekInBlock + 1);
            progressedExercise.week_progression_note = `Block ${blockNumber} (Intensification): Week ${weekInBlock}`;
            break;
            
          case 'realization':
            // Peak performance - high intensity, low volume
            if (progressedExercise.target_weight_kg) {
              const peakIncrease = (blockNumber - 1) * 5 + weekInBlock * 1.25;
              progressedExercise.target_weight_kg = Math.round(
                (progressedExercise.target_weight_kg + peakIncrease) * 4
              ) / 4;
            }
            progressedExercise.target_sets = Math.max(2, (baseExercise.target_sets || 3) - 1);
            progressedExercise.target_reps = Math.max(1, 6 - weekInBlock);
            progressedExercise.week_progression_note = `Block ${blockNumber} (Realization): Week ${weekInBlock}`;
            break;
        }
        break;

      case 'wave':
        const wavePattern = progressionRules.wavePattern || [75, 80, 85, 90];
        const waveWeek = ((week - 1) % wavePattern.length);
        const wavePercentage = wavePattern[waveWeek];
        const waveNumber = Math.floor((week - 1) / wavePattern.length) + 1;
        
        if (progressedExercise.exerciseDetails?.['1_RM_Alex']) {
          const oneRM = parseFloat(progressedExercise.exerciseDetails['1_RM_Alex']);
          // Add wave progression - each wave cycle increases base intensity
          const baseIncrease = (waveNumber - 1) * 2.5;
          const adjustedPercentage = Math.min(95, wavePercentage + baseIncrease);
          
          progressedExercise.load_prescription_p1rm = adjustedPercentage;
          progressedExercise.target_weight_kg = Math.round(
            (oneRM * adjustedPercentage / 100) * 4
          ) / 4;
          
          progressedExercise.week_progression_note = `Wave ${waveNumber}: ${adjustedPercentage.toFixed(1)}% of 1RM`;
        } else if (progressedExercise.target_weight_kg) {
          // If no 1RM available, use relative progression
          const baseWeight = baseExercise.target_weight_kg;
          const waveMultiplier = wavePercentage / 75; // Normalize to base wave
          const progressionMultiplier = 1 + ((waveNumber - 1) * 0.05); // 5% increase per wave
          
          progressedExercise.target_weight_kg = Math.round(
            (baseWeight * waveMultiplier * progressionMultiplier) * 4
          ) / 4;
          
          progressedExercise.week_progression_note = `Wave ${waveNumber}: ${wavePercentage}% intensity`;
        }
        break;

      default:
        // No progression - maintain base values
        progressedExercise.week_progression_note = `Week ${week} - no progression applied`;
    }
    
    // Auto-adjust RPE if enabled
    if (generatedProgram.autoAdjustRPE && progressedExercise.target_rpe) {
      const rpeIncrease = Math.floor((week - 1) / 2) * 0.5;
      progressedExercise.target_rpe = Math.min(
        10, 
        progressedExercise.target_rpe + rpeIncrease
      );
    }
  }
  
  // Add week and program identification
  progressedExercise.week = week;
  progressedExercise.program_id = `generated_${Date.now()}`;
  progressedExercise.exercise_id = `week${week}_day${progressedExercise.day}_ex${index}`;
  
  return progressedExercise;
});
      
      generatedWeeks[week] = {
        weekNumber: week,
        isDeload,
        exercises: weekExercises,
        totalExercises: weekExercises.length,
        trainingDays: [...new Set(weekExercises.map(ex => ex.day))].length,
      };
      
      console.log(`✅ Week ${week} generated with ${weekExercises.length} exercises`);
      console.log(`Training days for week ${week}:`, [...new Set(weekExercises.map(ex => ex.day))]);
    }
    
    // Update the generated program state
    const newGeneratedProgram = {
      weeks: generatedWeeks,
      includeDeloads: generatedProgram.includeDeloads !== false,
      autoAdjustRPE: generatedProgram.autoAdjustRPE !== false,
      includeNotes: generatedProgram.includeNotes !== false,
      generatedAt: new Date().toISOString(),
      totalWeeks: totalWeeks,
      programName: programOverview.Program_Name,
    };
    
    setGeneratedProgram(newGeneratedProgram);
    
    console.log("🎉 Program generation completed!", newGeneratedProgram);
    
    setSuccessMessage(`Successfully generated ${totalWeeks}-week program!`);
    setTimeout(() => setSuccessMessage(null), 5000);
    
  } catch (error) {
    console.error("💥 Error generating program:", error);
    setError('Failed to generate program: ' + error.message);
  } finally {
    setLoading(false);
  }
};

// Add this component for detailed week view
// Replace the WeekDetailView component with this corrected version
const WeekDetailView = ({ weekNumber, weekData, onClose }) => {
  const [selectedDay, setSelectedDay] = useState(1);
  
  if (!weekData) return null;
  
  console.log("WeekDetailView - weekData:", weekData);
  console.log("WeekDetailView - exercises:", weekData.exercises);
  
  // Get unique days for this week
  const availableDays = [...new Set(weekData.exercises.map(ex => ex.day))].sort((a, b) => a - b);
  console.log("Available days:", availableDays);
  
  // Set initial selected day to first available day
  useEffect(() => {
    if (availableDays.length > 0 && !availableDays.includes(selectedDay)) {
      setSelectedDay(availableDays[0]);
    }
  }, [availableDays, selectedDay]);
  
  // Get exercises for selected day
  const dayExercises = weekData.exercises.filter(ex => ex.day === selectedDay);
  console.log(`Exercises for day ${selectedDay}:`, dayExercises);
  
  return (
    <Modal isOpen={true} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxH="90vh" overflowY="auto">
        <ModalHeader>
          <VStack align="start" spacing={2}>
            <HStack>
              <Text>Week {weekNumber} Details</Text>
              {weekData.isDeload && (
                <Badge colorScheme="orange">Deload Week</Badge>
              )}
            </HStack>
            <Text fontSize="sm" color="gray.600">
              {weekData.totalExercises} exercises across {weekData.trainingDays} training days
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Debug Info */}
            <Box p={3} bg="gray.100" borderRadius="md" fontSize="sm">
              <Text fontWeight="bold">Debug Info:</Text>
              <Text>Total exercises in week: {weekData.exercises.length}</Text>
              <Text>Available days: {availableDays.join(', ')}</Text>
              <Text>Selected day: {selectedDay}</Text>
              <Text>Exercises for selected day: {dayExercises.length}</Text>
            </Box>
            
            {/* Day Selection */}
            <Card>
              <CardHeader>
                <Heading size="sm">Select Training Day</Heading>
              </CardHeader>
              <CardBody>
                <HStack spacing={2} flexWrap="wrap">
                  {availableDays.map(day => {
                    const dayExerciseCount = weekData.exercises.filter(ex => ex.day === day).length;
                    return (
                      <Button
                        key={day}
                        size="sm"
                        variant={selectedDay === day ? "solid" : "outline"}
                        colorScheme={selectedDay === day ? "teal" : "gray"}
                        onClick={() => setSelectedDay(day)}
                      >
                        Day {day} - {getTrainingDayLabel(trainingStructure.type, day - 1)}
                        <Badge ml={2} colorScheme={selectedDay === day ? "white" : "teal"}>
                          {dayExerciseCount}
                        </Badge>
                      </Button>
                    );
                  })}
                </HStack>
              </CardBody>
            </Card>
            
            {/* Day Exercises */}
            <Card>
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="sm">
                    Day {selectedDay} - {getTrainingDayLabel(trainingStructure.type, selectedDay - 1)}
                  </Heading>
                  <Badge colorScheme="blue">
                    {dayExercises.length} exercises
                  </Badge>
                </HStack>
              </CardHeader>
              <CardBody>
                {dayExercises.length > 0 ? (
                  <VStack spacing={4} align="stretch">
                    {dayExercises.map((exercise, index) => (
                      <Card key={exercise.exercise_id || index} variant="outline">
                        <CardBody>
                          <VStack align="stretch" spacing={3}>
                            {/* Exercise Header */}
                            <HStack justify="space-between" align="start">
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold" fontSize="lg">
                                  {exercise.exercise || 'Unknown Exercise'}
                                </Text>
                                {exercise.exerciseDetails && (
                                  <HStack spacing={2}>
                                    <Tag size="sm" colorScheme="teal">
                                      {exercise.exerciseDetails.Target_Muscle_Group}
                                    </Tag>
                                    <Tag size="sm" colorScheme="orange">
                                      {exercise.exerciseDetails.Primary_Equipment}
                                    </Tag>
                                  </HStack>
                                )}
                              </VStack>
                              
                              {exercise.superset && (
                                <Badge colorScheme="purple">
                                  {exercise.superset}
                                </Badge>
                              )}
                            </HStack>
                            
                            {/* Exercise Parameters */}
                            <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={4}>
                              <Box>
                                <Text fontSize="xs" color="gray.500" fontWeight="bold">SETS</Text>
                                <Text fontSize="lg" fontWeight="bold" color="teal.600">
                                  {exercise.target_sets || 3}
                                </Text>
                              </Box>
                              
                              <Box>
                                <Text fontSize="xs" color="gray.500" fontWeight="bold">REPS</Text>
                                <Text fontSize="lg" fontWeight="bold" color="teal.600">
                                  {exercise.target_reps || 10}
                                </Text>
                              </Box>
                              
                              {exercise.target_weight_kg && (
                                <Box>
                                  <Text fontSize="xs" color="gray.500" fontWeight="bold">WEIGHT</Text>
                                  <Text fontSize="lg" fontWeight="bold" color="blue.600">
                                    {exercise.target_weight_kg}kg
                                  </Text>
                                </Box>
                              )}
                              
                              <Box>
                                <Text fontSize="xs" color="gray.500" fontWeight="bold">RPE</Text>
                                <Text fontSize="lg" fontWeight="bold" color="orange.600">
                                  {exercise.target_rpe || 7}
                                </Text>
                              </Box>
                              
                              <Box>
                                <Text fontSize="xs" color="gray.500" fontWeight="bold">REST</Text>
                                <Text fontSize="lg" fontWeight="bold" color="purple.600">
                                  {exercise.target_rest || 60}s
                                </Text>
                              </Box>
                              
                              {exercise.load_prescription_p1rm && (
                                <Box>
                                  <Text fontSize="xs" color="gray.500" fontWeight="bold">% 1RM</Text>
                                  <Text fontSize="lg" fontWeight="bold" color="red.600">
                                    {exercise.load_prescription_p1rm}%
                                  </Text>
                                </Box>
                              )}
                            </SimpleGrid>
                            
                            {/* Exercise Notes */}
                            {(exercise.exercise_program_note || exercise.week_progression_note) && (
                              <Box bg="gray.50" p={3} borderRadius="md">
                                {exercise.week_progression_note && (
                                  <Text fontSize="sm" color="blue.600" fontWeight="medium" mb={1}>
                                    📈 {exercise.week_progression_note}
                                  </Text>
                                )}
                                {exercise.exercise_program_note && (
                                  <Text fontSize="sm" color="gray.700">
                                    💡 {exercise.exercise_program_note}
                                  </Text>
                                )}
                              </Box>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                ) : (
                  <Box textAlign="center" py={8}>
                    <Text color="gray.500">
                      No exercises found for Day {selectedDay}
                    </Text>
                    <Text fontSize="sm" color="gray.400" mt={2}>
                      Debug: Total exercises in week: {weekData.exercises.length}
                    </Text>
                  </Box>
                )}
              </CardBody>
            </Card>
          </VStack>
        </ModalBody>
        
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const generateWeekExercises = (weekNumber, isDeload) => {
  // Apply progression rules to week 1 template
  const baseExercises = Object.values(weekOneTemplate);
  
  return baseExercises.map(exercise => {
    const progressionMultiplier = isDeload 
      ? (progressionRules.deloadPercentage || 80) / 100
      : weekNumber * (progressionRules.weightProgression || 2.5) / 100 + 1;
      
    return {
      ...exercise,
      target_weight_kg: exercise.target_weight_kg 
        ? Math.round(exercise.target_weight_kg * progressionMultiplier * 4) / 4 // Round to nearest 0.25kg
        : null,
      week_progression_note: isDeload 
        ? 'Deload week - reduced intensity'
        : `Week ${weekNumber} progression applied`,
    };
  });
};

const getTotalSessionsGenerated = () => {
  if (!generatedProgram.weeks) return 0;
  const totalWeeks = Object.keys(generatedProgram.weeks).length;
  const daysPerWeek = trainingStructure.daysPerWeek || 3;
  return totalWeeks * daysPerWeek;
};

const getTotalExercisesGenerated = () => {
  if (!generatedProgram.weeks) return 0;
  return Object.values(generatedProgram.weeks).reduce((total, week) => {
    return total + (week.exercises?.length || 0);
  }, 0);
};

const getDeloadWeeksCount = () => {
  if (!generatedProgram.weeks) return 0;
  return Object.values(generatedProgram.weeks).filter(week => week.isDeload).length;
};

const isDeloadWeek = (weekNum) => {
  return generatedProgram.weeks?.[weekNum]?.isDeload || false;
};

const getExercisesForWeekDay = (week, day) => {
  return generatedProgram.weeks?.[week]?.exercises?.filter(ex => ex.day === day) || [];
};

const getModifiedValue = (week, day, exerciseIndex, field) => {
  return fineTuning.modifiedWeeks?.[week]?.[day]?.[exerciseIndex]?.[field];
};

const updateWeekModification = (week, day, exerciseIndex, field, value) => {
  setFineTuning(prev => ({
    ...prev,
    modifiedWeeks: {
      ...prev.modifiedWeeks,
      [week]: {
        ...prev.modifiedWeeks?.[week],
        [day]: {
          ...prev.modifiedWeeks?.[week]?.[day],
          [exerciseIndex]: {
            ...prev.modifiedWeeks?.[week]?.[day]?.[exerciseIndex],
            [field]: value,
          },
        },
      },
    },
  }));
};

const resetWeekModifications = (week) => {
  setFineTuning(prev => {
    const newModifiedWeeks = { ...prev.modifiedWeeks };
    delete newModifiedWeeks[week];
    return {
      ...prev,
      modifiedWeeks: newModifiedWeeks,
    };
  });
};

const handleSaveProgram = async () => {
  try {
    setLoading(true);
    // Save program logic here - you'll implement this later
    setSuccessMessage('Program saved successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  } catch (error) {
    setError('Failed to save program: ' + error.message);
  } finally {
    setLoading(false);
  }
};

const handleExportProgram = () => {
  // Export program logic here - you'll implement this later
  console.log('Exporting program...');
  setSuccessMessage('Program export started!');
  setTimeout(() => setSuccessMessage(null), 3000);
};

// Add exercise to a specific day
const addExercise = () => {
  const newExercise = {
    exercise: "",
    target_sets: 3,
    target_reps: 10,
    target_weight_kg: null,
    target_rpe: 7,
    target_rest: 60,
    load_prescription_p1rm: null,
    focus: programOverview.Focus,
    superset: "",
    exercise_program_note: "",
    exerciseDetails: null,
  };
  const updatedExercises = [...dayExercises, newExercise];
  setDayExercises(updatedExercises);

  const updatedWeek = {
    ...weekData,
    [selectedDay]: updatedExercises,
  };
  onUpdate(updatedWeek);
};

// Update exercise in a specific day
const updateExerciseInDay = (day, exerciseIndex, updates) => {
  const dayExercises = getExercisesForDay(day);
  if (dayExercises[exerciseIndex]) {
    const exerciseId = Object.keys(weekOneTemplate).find(key => 
      weekOneTemplate[key] === dayExercises[exerciseIndex]
    );
    
    if (exerciseId) {
      setWeekOneTemplate(prev => ({
        ...prev,
        [exerciseId]: {
          ...prev[exerciseId],
          ...updates,
        }
      }));
    }
  }
};

// Remove exercise from a specific day
const removeExerciseFromDay = (day, exerciseIndex) => {
  const dayExercises = getExercisesForDay(day);
  if (dayExercises[exerciseIndex]) {
    const exerciseId = Object.keys(weekOneTemplate).find(key => 
      weekOneTemplate[key] === dayExercises[exerciseIndex]
    );
    
    if (exerciseId) {
      setWeekOneTemplate(prev => {
        const newTemplate = { ...prev };
        delete newTemplate[exerciseId];
        return newTemplate;
      });
    }
  }
};

// Get total exercises in template
const getTotalExercisesInTemplate = () => {
  let total = 0;
  Object.values(weekOneTemplate).forEach(exercisesArray => {
    if (Array.isArray(exercisesArray)) {
      total += exercisesArray.length;
    }
  });
  return total;
};

// 👆 END OF HELPER FUNCTIONS 👆    


// Step 2: Training Structure
const [trainingStructure, setTrainingStructure] = useState({
  type: "",
  daysPerWeek: 3,
  sessionsPerDay: 1,
  customStructure: {},
});

/*  // Memoized setProgramOverview with debounce
const setProgramOverviewCallback = useCallback(
  debounce((newState) => {
    setProgramOverview((prev) => {
      console.log("Updating programOverview:", newState); // Debug: Log state update
      return { ...prev, ...newState };
    });
  }, 100), // 100ms debounce
  []
);
*/

/*
// Memoized setTrainingStructure with debounce
const setTrainingStructureCallback = useCallback(
  debounce((newState) => {
    setTrainingStructure((prev) => {
      console.log("Updating trainingStructure:", newState); // Debug: Log state update
      return { ...prev, ...newState };
    });
  }, 100), // 100ms debounce
  []
);
*/

// Add this stable callback for WeekTemplateEditor
const handleWeekTemplateUpdate = useCallback((updatedWeek) => {
  setWeekOneTemplate(updatedWeek);
}, []);




useEffect(() => {
  const orig = HTMLInputElement.prototype.focus;
  HTMLInputElement.prototype.focus = function () {
    console.trace("➡ forced focus on", this);   // <= only change
    return orig.apply(this, arguments);
  };
}, []);


  /*// Focus restoration for unexpected blur due to re-renders
  useEffect(() => {
    if (activeInput && inputRefs.current[activeInput]) {
      const currentInput = inputRefs.current[activeInput];
      const activeElement = document.activeElement;

      // Only restore focus if the current input is not focused and no other input is focused
      if (
        activeElement !== currentInput &&
        !Object.values(inputRefs.current).includes(activeElement) &&
        document.contains(currentInput)
      ) {
        // console.log(`Restoring focus to: ${activeInput}`); // Debug: Log focus restoration
        currentInput.focus();
      }
    }
  }, [activeInput, programOverview, trainingStructure]);
  

 // Clear focus after NumberInput state updates
useEffect(() => {
  const timer = setTimeout(() => {
    if (
      document.activeElement.tagName === "INPUT" &&
      document.activeElement.type === "number"
    ) {
      document.activeElement.blur();
      console.log("Cleared focus from NumberInput"); // Debug
    }
  }, 150); // 150ms to allow state update

  return () => clearTimeout(timer);
}, [programOverview, trainingStructure]);

*/

// State for step navigation
const [currentStep, setCurrentStep] = useState(1);

  // delete? necessary?

  // Step 3: Progression Rules
  const [progressionRules, setProgressionRules] = useState({
    type: "linear",
    weightProgression: 2.5, // kg per week for linear
    repProgression: 1, // reps per week for double progression
    repRangeMin: 8, // min reps for double progression
    repRangeMax: 12, // max reps for double progression
    percentageIncrease: 2.5, // % increase per week
    startingPercentage: 70, // starting % of 1RM for percentage-based
    deloadFrequency: 4, // every 4th week
    deloadPercentage: 80, // 80% of previous week
    blockLength: 4, // weeks per block
    blockFocus: "accumulation", // accumulation, intensification, realization
    wavePattern: [75, 80, 85, 90], // % 1RM pattern for wave loading
    autoGenerate: true,
  });

  // Step 4: Week 1 Template
  const [weekOneTemplate, setWeekOneTemplate] = useState({});
  // Add this state for Step 4
const [localExerciseData, setLocalExerciseData] = useState({});

// Add this function to handle local exercise updates
const updateLocalExerciseData = (dayIndex, exerciseIndex, field, value) => {
  const key = `day${dayIndex}_ex${exerciseIndex}_${field}`;
  setLocalExerciseData(prev => ({
    ...prev,
    [key]: value
  }));
};

// Add this function to get local exercise value
const getLocalExerciseValue = (dayIndex, exerciseIndex, field, defaultValue) => {
  const key = `day${dayIndex}_ex${exerciseIndex}_${field}`;
  return localExerciseData[key] !== undefined ? localExerciseData[key] : defaultValue;
};

// Add this function to commit local changes to main state
const commitExerciseChanges = (dayIndex, exerciseIndex) => {
  const updates = {};
  Object.keys(localExerciseData).forEach(key => {
    if (key.startsWith(`day${dayIndex}_ex${exerciseIndex}_`)) {
      const field = key.split('_')[2];
      updates[field] = localExerciseData[key];
    }
  });
  
  if (Object.keys(updates).length > 0) {
    updateExerciseInDay(dayIndex, exerciseIndex, updates);
  }
};



  // Step 5: Generated Program
  const [generatedProgram, setGeneratedProgram] = useState({});

  // Step 6: Fine-tuning
  const [fineTuning, setFineTuning] = useState({
    modifiedWeeks: {},
    customExercises: {},
  });

  // Exercise management
  const [exercises, setExercises] = useState([]);
  const [newExercise, setNewExercise] = useState({
    program_name: "",
    program_macro_cycle: "",
    week: 1,
    day: 1,
    focus: "",
    exercise: "",
    exercise_program_note: "",
    superset: "",
    target_sets: 3,
    target_reps: 10,
    target_rpe: 7,
    target_rest: 60,
    target_tempo: "",
    target_time_distance: "",
    program_id: "",
    target_weight_kg: null,
    load_prescription_p1rm: null,
    user_id: null,
  });

  // exercise library state and functions
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  //const [exerciseSearchTerm, setExerciseSearchTerm] = useState("");
  //const [filteredExercises, setFilteredExercises] = useState([]);
  //const [selectedExerciseForDetails, setSelectedExerciseForDetails] =
  // useState(null);
  const [loadingExercises, setLoadingExercises] = useState(false);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [focusFilter, setFocusFilter] = useState("");
  const [weeksFilter, setWeeksFilter] = useState("");

  // User enrollment state
  const [userEnrollments, setUserEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [enrolling, setEnrolling] = useState(null);

  // Modal controls
  const {
    isOpen: isProgramModalOpen,
    onOpen: onProgramModalOpen,
    onClose: onProgramModalClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();

  const {
    isOpen: isEnrollmentModalOpen,
    onOpen: onEnrollmentModalOpen,
    onClose: onEnrollmentModalClose,
  } = useDisclosure();

  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Stepper for program creation
  const steps = [
    { title: "Goals", description: "" }, // "Define program goals and overview"
    { title: "Structure", description: "" }, // "Set up training structure"
    { title: "Progression", description: "" }, // "Define progression rules"
    { title: "Week 1", description: "" }, // "Create Week 1 template"
    { title: "Generate", description: "" }, // "Auto-generate program"
    { title: "Fine-tune", description: "" }, // "Adjust and finalize"
  ];

  const { activeStep, setActiveStep } = useSteps({
    index: programCreationStep,
    count: steps.length,
  });

  // Fetch exercise library
  const fetchExerciseLibrary = async () => {
    try {
      console.log("🔍 Starting to fetch exercise library in batches...");
      setLoadingExercises(true);

      // Get total count first
      const { count, error: countError } = await supabase
        .from("Exercise Library")
        .select("*", { count: "exact", head: true });

      if (countError) throw countError;
      console.log("📊 Total exercises in database:", count);

      const batchSize = 1000;
      const batches = Math.ceil(count / batchSize);
      let allExercises = [];

      console.log(
        "📦 Loading",
        batches,
        "batches of",
        batchSize,
        "exercises each"
      );

      // Load all batches
      for (let i = 0; i < batches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize - 1, count - 1);

        console.log(
          `📦 Loading batch ${i + 1}/${batches} (records ${start}-${end})`
        );

        const { data: batchData, error: batchError } = await supabase
          .from("Exercise Library")
          .select(
            `
            Exercise,
            Video_Demonstration,
            "In-Depth_Explanation",
            Exercise_Notes,
            Target_Muscle_Group,
            Primary_Equipment,
            Favorite,
            "1_RM_Alex",
            Difficulty_Level,
            Prime_Mover_Muscle,
            Secondary_Muscle,
            Tertiary_Muscle,
            Body_Region,
            "Movement_Pattern_#1",
            "Movement_Pattern_#2",
            "Movement_Pattern_#3",
            Primary_Exercise_Classification,
            Force_Type,
            Mechanics,
            Combination_Exercises
          `
          )
          .range(start, end)
          .order("Exercise", { ascending: true });

        if (batchError) {
          console.error(`❌ Error in batch ${i + 1}:`, batchError);
          throw batchError;
        }

        if (batchData && batchData.length > 0) {
          allExercises = [...allExercises, ...batchData];
          console.log(
            `✅ Batch ${i + 1} loaded: ${
              batchData.length
            } exercises (Total so far: ${allExercises.length})`
          );
        }
      }

      console.log(
        "🔄 All batches loaded. Total exercises:",
        allExercises.length
      );
      console.log("🎯 First exercise:", allExercises[0]?.Exercise);
      console.log(
        "🎯 Last exercise:",
        allExercises[allExercises.length - 1]?.Exercise
      );

      // Set state with all exercises
      console.log("🔄 Setting exercise library state...");
      setExerciseLibrary(allExercises);

      // Test searches in the complete dataset
      const gobletExercises = allExercises.filter((ex) =>
        ex.Exercise?.toLowerCase().includes("goblet")
      );
      console.log(
        "🏺 Goblet exercises found in complete dataset:",
        gobletExercises.map((ex) => ex.Exercise)
      );

      const squatExercises = allExercises.filter((ex) =>
        ex.Exercise?.toLowerCase().includes("squat")
      );
      console.log("🏋️ Total squat exercises found:", squatExercises.length);
      console.log(
        "🏋️ First 5 squat exercises:",
        squatExercises.slice(0, 5).map((ex) => ex.Exercise)
      );

      console.log("✅ Exercise library loading completed!");
    } catch (err) {
      console.error("💥 Error fetching exercise library:", err);
      setError(`Failed to load exercise library: ${err.message}`);
    } finally {
      setLoadingExercises(false);
    }
  };

  // Advanced exercise search function
  /*const searchExercises = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredExercises([]);
      return;
    }

    const terms = searchTerm
      .toLowerCase()
      .split(" ")
      .filter((term) => term.length > 0);

    const results = exerciseLibrary.filter((exercise) => {
      const searchableText = [
        exercise.Exercise,
        exercise.Target_Muscle_Group,
        exercise.Primary_Equipment,
        exercise.Prime_Mover_Muscle,
        exercise.Secondary_Muscle,
        exercise.Body_Region,
        exercise["Movement_Pattern_#1"], // Fixed: use bracket notation
        exercise["Movement_Pattern_#2"], // Fixed: use bracket notation
        exercise.Primary_Exercise_Classification,
      ]
        .join(" ")
        .toLowerCase();

      // Check if all search terms are found in the searchable text
      return terms.every((term) => searchableText.includes(term));
    });

    // Sort results: favorites first, then alphabetically
    const sortedResults = results.sort((a, b) => {
      // Favorites first
      const aIsFavorite = a.Favorite === "Yes" || a.Favorite === "Y";
      const bIsFavorite = b.Favorite === "Yes" || b.Favorite === "Y";

      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;

      // Then alphabetically
      return a.Exercise.localeCompare(b.Exercise);
    });

    setFilteredExercises(sortedResults.slice(0, 20)); // Limit to 20 results
  };
*/

  // Exercise Details Component
  const ExerciseDetailsPopover = ({ exercise, children }) => {
    if (!exercise) return children;

    const isFavorite = exercise.Favorite === "Yes" || exercise.Favorite === "Y";

    return (
      <Popover placement="right" isLazy>
        <PopoverTrigger>{children}</PopoverTrigger>
        <PopoverContent width="400px" maxH="500px" overflowY="auto">
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>
            <HStack justify="space-between" align="start">
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold" fontSize="md">
                  {exercise.Exercise}
                </Text>
                {isFavorite && (
                  <Badge colorScheme="yellow" variant="solid" size="sm">
                    ⭐ Favorite
                  </Badge>
                )}
              </VStack>
              {exercise["1_RM_Alex"] && (
                <Badge colorScheme="blue" variant="outline">
                  1RM: {exercise["1_RM_Alex"]}kg
                </Badge>
              )}
            </HStack>
          </PopoverHeader>
          <PopoverBody>
            <VStack spacing={4} align="stretch">
              {/* Video Demonstration */}
              {exercise.Video_Demonstration && (
                <Box>
                  <Text fontWeight="semibold" fontSize="sm" mb={2}>
                    Video Demonstration:
                  </Text>
                  {exercise.Video_Demonstration.includes("youtube.com") ||
                  exercise.Video_Demonstration.includes("youtu.be") ? (
                    <Link
                      href={exercise.Video_Demonstration}
                      isExternal
                      color="blue.500"
                      fontSize="sm"
                    >
                      Watch on YouTube 🎥
                    </Link>
                  ) : (
                    <Link
                      href={exercise.Video_Demonstration}
                      isExternal
                      color="blue.500"
                      fontSize="sm"
                    >
                      View Video
                    </Link>
                  )}
                </Box>
              )}

              {/* Target Muscle Group */}
              <Box>
                <Text fontWeight="semibold" fontSize="sm" mb={2}>
                  Target Muscles:
                </Text>
                <Wrap spacing={1}>
                  {exercise.Target_Muscle_Group && (
                    <WrapItem>
                      <Tag size="sm" colorScheme="teal">
                        <TagLabel>{exercise.Target_Muscle_Group}</TagLabel>
                      </Tag>
                    </WrapItem>
                  )}
                  {exercise.Prime_Mover_Muscle && (
                    <WrapItem>
                      <Tag size="sm" colorScheme="blue">
                        <TagLabel>
                          Primary: {exercise.Prime_Mover_Muscle}
                        </TagLabel>
                      </Tag>
                    </WrapItem>
                  )}
                  {exercise.Secondary_Muscle && (
                    <WrapItem>
                      <Tag size="sm" colorScheme="gray">
                        <TagLabel>
                          Secondary: {exercise.Secondary_Muscle}
                        </TagLabel>
                      </Tag>
                    </WrapItem>
                  )}
                </Wrap>
              </Box>

              {/* Equipment */}
              {exercise.Primary_Equipment && (
                <Box>
                  <Text fontWeight="semibold" fontSize="sm" mb={1}>
                    Equipment:
                  </Text>
                  <Tag size="sm" colorScheme="orange">
                    <TagLabel>{exercise.Primary_Equipment}</TagLabel>
                  </Tag>
                </Box>
              )}

              {/* Difficulty Level */}
              {exercise.Difficulty_Level && (
                <Box>
                  <Text fontWeight="semibold" fontSize="sm" mb={1}>
                    Difficulty:
                  </Text>
                  <Badge
                    colorScheme={
                      exercise.Difficulty_Level === "Beginner"
                        ? "green"
                        : exercise.Difficulty_Level === "Intermediate"
                        ? "yellow"
                        : exercise.Difficulty_Level === "Advanced"
                        ? "red"
                        : "gray"
                    }
                  >
                    {exercise.Difficulty_Level}
                  </Badge>
                </Box>
              )}

              {/* Movement Patterns - Fixed bracket notation */}
              {(exercise["Movement_Pattern_#1"] ||
                exercise["Movement_Pattern_#2"]) && (
                <Box>
                  <Text fontWeight="semibold" fontSize="sm" mb={2}>
                    Movement Patterns:
                  </Text>
                  <Wrap spacing={1}>
                    {exercise["Movement_Pattern_#1"] && (
                      <WrapItem>
                        <Tag size="sm" colorScheme="purple">
                          <TagLabel>{exercise["Movement_Pattern_#1"]}</TagLabel>
                        </Tag>
                      </WrapItem>
                    )}
                    {exercise["Movement_Pattern_#2"] && (
                      <WrapItem>
                        <Tag size="sm" colorScheme="purple" variant="outline">
                          <TagLabel>{exercise["Movement_Pattern_#2"]}</TagLabel>
                        </Tag>
                      </WrapItem>
                    )}
                  </Wrap>
                </Box>
              )}

              {/* In-Depth Explanation */}
              {/* In-Depth Explanation - Updated to use Exercise_Notes */}
              {/* In-Depth Explanation - Updated with clickable links */}
              {(exercise.Exercise_Notes ||
                exercise["In-Depth_Explanation"]) && (
                <Box>
                  <Text fontWeight="semibold" fontSize="sm" mb={2}>
                    Exercise Notes:
                  </Text>
                  <Text fontSize="sm" color="gray.700" lineHeight="1.4">
                    {renderTextWithLinks(
                      exercise.Exercise_Notes ||
                        exercise["In-Depth_Explanation"]
                    )}
                  </Text>
                </Box>
              )}
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
  };

  // Add this helper function inside your WorkoutPrograms component (near other helper functions)
  const renderTextWithLinks = (text) => {
    if (!text) return null;

    // Regular expression to detect URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    // Split text by URLs and create clickable links
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        // This part is a URL
        return (
          <Link
            key={index}
            href={part}
            isExternal
            color="blue.500"
            fontWeight="medium"
            _hover={{ textDecoration: "underline", color: "blue.600" }}
          >
            {part.includes("youtube.com") || part.includes("youtu.be")
              ? "Watch Video 🎥"
              : "View Link 🔗"}
          </Link>
        );
      } else {
        // This part is regular text
        return part;
      }
    });
  };

  // Enhanced Exercise Search Component
  // Enhanced Exercise Search Component - Fixed version with highlighting
  const ExerciseSearchInput = ({ onSelectExercise, currentValue = "" }) => {
    const [searchTerm, setSearchTerm] = useState(currentValue);
    const [showResults, setShowResults] = useState(false);
    const [isMouseOverResults, setIsMouseOverResults] = useState(false);
    const [localFilteredExercises, setLocalFilteredExercises] = useState([]);
    const [localLoading, setLocalLoading] = useState(false);

    // Helper function to highlight search terms
    const highlightSearchTerms = (text, searchTerms) => {
      if (!text || !searchTerms.length) return text;

      let highlightedText = text;
      searchTerms.forEach((term) => {
        const regex = new RegExp(
          `(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
          "gi"
        );
        highlightedText = highlightedText.replace(regex, "<mark>$1</mark>");
      });

      return highlightedText;
    };

    // Enhanced search function with better matching logic
    const performLocalSearch = (term) => {
      if (!term.trim()) {
        setLocalFilteredExercises([]);
        return;
      }

      // Split search terms and clean them
      const searchTerms = term
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter((t) => t.length > 0);

      const results = exerciseLibrary.filter((exercise) => {
        // Create comprehensive searchable text
        const searchableFields = [
          exercise.Exercise,
          exercise.Target_Muscle_Group,
          exercise.Primary_Equipment,
          exercise.Prime_Mover_Muscle,
          exercise.Secondary_Muscle,
          exercise.Tertiary_Muscle,
          exercise.Body_Region,
          exercise["Movement_Pattern_#1"],
          exercise["Movement_Pattern_#2"],
          exercise["Movement_Pattern_#3"],
          exercise.Primary_Exercise_Classification,
          exercise.Force_Type,
          exercise.Mechanics,
          exercise.Combination_Exercises,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        // IMPROVED LOGIC: ALL search terms must be found
        const allTermsMatch = searchTerms.every((searchTerm) =>
          searchableFields.includes(searchTerm)
        );

        return allTermsMatch;
      });

      // Enhanced sorting algorithm with better relevance scoring
      const sortedResults = results.sort((a, b) => {
        const aIsFavorite = a.Favorite === "Yes" || a.Favorite === "Y";
        const bIsFavorite = b.Favorite === "Yes" || b.Favorite === "Y";

        // 1. Favorites first
        if (aIsFavorite && !bIsFavorite) return -1;
        if (!aIsFavorite && bIsFavorite) return 1;

        // 2. Exact exercise name match
        const aExactMatch = a.Exercise?.toLowerCase() === term.toLowerCase();
        const bExactMatch = b.Exercise?.toLowerCase() === term.toLowerCase();
        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;

        // 3. Exercise name contains all terms in order
        const aContainsInOrder = searchTerms.every((searchTerm, index) => {
          const exerciseName = a.Exercise?.toLowerCase() || "";
          if (index === 0) return exerciseName.includes(searchTerm);

          // Check if current term appears after the previous term
          const prevTerm = searchTerms[index - 1];
          const prevIndex = exerciseName.indexOf(prevTerm);
          const currentIndex = exerciseName.indexOf(searchTerm);
          return prevIndex !== -1 && currentIndex > prevIndex;
        });

        const bContainsInOrder = searchTerms.every((searchTerm, index) => {
          const exerciseName = b.Exercise?.toLowerCase() || "";
          if (index === 0) return exerciseName.includes(searchTerm);

          const prevTerm = searchTerms[index - 1];
          const prevIndex = exerciseName.indexOf(prevTerm);
          const currentIndex = exerciseName.indexOf(searchTerm);
          return prevIndex !== -1 && currentIndex > prevIndex;
        });

        if (aContainsInOrder && !bContainsInOrder) return -1;
        if (!aContainsInOrder && bContainsInOrder) return 1;

        // 4. Exercise name starts with first search term
        const aStartsWithFirst = a.Exercise?.toLowerCase().startsWith(
          searchTerms[0]
        );
        const bStartsWithFirst = b.Exercise?.toLowerCase().startsWith(
          searchTerms[0]
        );
        if (aStartsWithFirst && !bStartsWithFirst) return -1;
        if (!aStartsWithFirst && bStartsWithFirst) return 1;

        // 5. Count how many terms appear in the exercise name (more = better)
        const aExerciseTermCount = searchTerms.filter((term) =>
          a.Exercise?.toLowerCase().includes(term)
        ).length;
        const bExerciseTermCount = searchTerms.filter((term) =>
          b.Exercise?.toLowerCase().includes(term)
        ).length;

        if (aExerciseTermCount !== bExerciseTermCount) {
          return bExerciseTermCount - aExerciseTermCount; // Higher count first
        }

        // 6. Shorter exercise names first (more specific)
        const aLength = a.Exercise?.length || 999;
        const bLength = b.Exercise?.length || 999;
        if (aLength !== bLength) {
          return aLength - bLength;
        }

        // 7. Alphabetical order as final tiebreaker
        return a.Exercise?.localeCompare(b.Exercise || "") || 0;
      });

      console.log(
        `Search for "${term}" (terms: [${searchTerms.join(", ")}]) found ${
          sortedResults.length
        } results`
      );

      // Show top results in console for debugging
      if (sortedResults.length > 0) {
        console.log(
          "Top 5 results:",
          sortedResults.slice(0, 5).map((ex) => ex.Exercise)
        );
      }

      setLocalFilteredExercises(sortedResults.slice(0, 25));
    };

    // Debounced search effect
    useEffect(() => {
      if (!searchTerm.trim()) {
        setLocalFilteredExercises([]);
        return;
      }

      setLocalLoading(true);
      const timeoutId = setTimeout(() => {
        performLocalSearch(searchTerm);
        setLocalLoading(false);
      }, 200);

      return () => {
        clearTimeout(timeoutId);
        setLocalLoading(false);
      };
    }, [searchTerm, exerciseLibrary]);

    // Update search term when currentValue changes
    useEffect(() => {
      if (currentValue !== searchTerm) {
        setSearchTerm(currentValue);
      }
    }, [currentValue]);

    const handleSelectExercise = (exercise) => {
      setSearchTerm(exercise.Exercise);
      setShowResults(false);
      setLocalFilteredExercises([]);
      setIsMouseOverResults(false);
      onSelectExercise(exercise);
    };

    /*const handleInputFocus = () => {
      setShowResults(true);
      if (searchTerm.trim() && localFilteredExercises.length === 0) {
        performLocalSearch(searchTerm);
      }
    };
*/
    const handleInputBlur = () => {
      if (!isMouseOverResults) {
        setTimeout(() => {
          setShowResults(false);
        }, 150);
      }
    };

    const handleInputChange = (e) => {
      const value = e.target.value;
      setSearchTerm(value);
      setShowResults(true);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowResults(false);
        setLocalFilteredExercises([]);
      }
    };

    return (
      <Box position="relative">
        <Input
          value={searchTerm}
          onChange={handleInputChange}
          // onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder="Search exercises (e.g., 'goblet squat', 'chest press')..."
          size="sm"
          autoComplete="off"
        />

        {showResults && (
          <Box
            position="absolute"
            top="100%"
            left={0}
            right={0}
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            boxShadow="lg"
            maxH="350px"
            overflowY="auto"
            zIndex={1000}
            mt={1}
            onMouseEnter={() => setIsMouseOverResults(true)}
            onMouseLeave={() => setIsMouseOverResults(false)}
          >
            {localLoading ? (
              <Flex justify="center" align="center" p={4}>
                <Spinner size="sm" />
                <Text ml={2} fontSize="sm">
                  Searching...
                </Text>
              </Flex>
            ) : localFilteredExercises.length > 0 ? (
              <VStack spacing={0} align="stretch">
                {localFilteredExercises.map((exercise) => {
                  const isFavorite =
                    exercise.Favorite === "Yes" || exercise.Favorite === "Y";
                  const searchTerms = searchTerm
                    .toLowerCase()
                    .trim()
                    .split(/\s+/)
                    .filter((t) => t.length > 0);

                  return (
                    <ExerciseDetailsPopover
                      key={exercise.Exercise}
                      exercise={exercise}
                    >
                      <Box
                        p={3}
                        _hover={{ bg: "gray.50" }}
                        cursor="pointer"
                        borderBottom="1px solid"
                        borderColor="gray.100"
                        onClick={() => handleSelectExercise(exercise)}
                        onMouseDown={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <HStack justify="space-between" align="start">
                          <VStack align="start" spacing={1} flex={1}>
                            <HStack>
                              <Text
                                fontWeight="medium"
                                fontSize="sm"
                                dangerouslySetInnerHTML={{
                                  __html: highlightSearchTerms(
                                    exercise.Exercise,
                                    searchTerms
                                  ),
                                }}
                              />
                              {isFavorite && (
                                <Badge colorScheme="yellow" size="sm">
                                  ⭐
                                </Badge>
                              )}
                            </HStack>

                            <HStack spacing={2} flexWrap="wrap">
                              {exercise.Target_Muscle_Group && (
                                <Tag size="xs" colorScheme="teal">
                                  {exercise.Target_Muscle_Group}
                                </Tag>
                              )}
                              {exercise.Primary_Equipment && (
                                <Tag size="xs" colorScheme="orange">
                                  {exercise.Primary_Equipment}
                                </Tag>
                              )}
                              {exercise["1_RM_Alex"] && (
                                <Tag size="xs" colorScheme="blue">
                                  1RM: {exercise["1_RM_Alex"]}kg
                                </Tag>
                              )}
                            </HStack>
                          </VStack>

                          <Text fontSize="xs" color="gray.500">
                            Hover for details
                          </Text>
                        </HStack>
                      </Box>
                    </ExerciseDetailsPopover>
                  );
                })}

                {localFilteredExercises.length === 25 && (
                  <Box
                    p={2}
                    textAlign="center"
                    bg="gray.50"
                    borderTop="1px solid"
                    borderColor="gray.200"
                  >
                    <Text fontSize="xs" color="gray.600">
                      Showing first 25 results. Refine search for more specific
                      results.
                    </Text>
                  </Box>
                )}
              </VStack>
            ) : searchTerm.trim() && !localLoading ? (
              <Box p={4}>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  No exercises found matching "{searchTerm}"
                </Text>
                <Text fontSize="xs" color="gray.400" textAlign="center" mt={1}>
                  Try different keywords like "squat", "press", or "pull"
                </Text>
              </Box>
            ) : searchTerm.trim() === "" ? (
              <Box p={4}>
                <Text fontSize="sm" color="gray.400" textAlign="center">
                  Start typing to search exercises...
                </Text>
              </Box>
            ) : null}
          </Box>
        )}
      </Box>
    );
  };

  // Fetch programs with correct schema
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch program overview with correct schema fields
      const { data: programOverview, error: overviewError } = await supabase
        .from("program_overview")
        .select(
          `
          Program_ID,
          Program_Name,
          Created,
          Program_Description,
          Level,
          Focus,
          Key_Training_Focus,
          Nutrition_Recovery,
          Training_Mix_Frequency,
          Key_Adaptations,
          Key_Assessments,
          Key_Assessment_Goals,
          Program_Macro_Cycle,
          Weeks,
          Prefered_Season,
          Program_Length_in_Weeks,
          Days_Per_Week,
          Time_Per_Workout,
          Equipment,
          MUSCLE_ENGAGEMENT,
          Deload_Week,
          Progression,
          user_id
        `
        )
        .order("Program_Name", { ascending: true });

      if (overviewError) throw overviewError;

      // Fetch program library with correct schema fields
      const programsWithDetails = await Promise.all(
        programOverview.map(async (program) => {
          const { data: programDetails, error: detailsError } = await supabase
            .from("program_library")
            .select(
              `
              id,
              program_name,
              program_macro_cycle,
              week,
              day,
              focus,
              exercise,
              exercise_program_note,
              superset,
              target_sets,
              target_reps,
              target_rpe,
              target_rest,
              target_tempo,
              target_time_distance,
              program_id,
              target_weight_kg,
              load_prescription_p1rm,
              user_id
            `
            )
            .eq("program_id", program.Program_ID)
            .order("week", { ascending: true })
            .order("day", { ascending: true });

          if (detailsError) {
            console.error(
              `Error fetching details for program ${program.Program_ID}:`,
              detailsError
            );
            return { ...program, exercises: [] };
          }

          return {
            ...program,
            exercises: programDetails || [],
          };
        })
      );

      setPrograms(programsWithDetails);
      console.log(
        "Fetched complete programs with correct schema:",
        programsWithDetails
      );
    } catch (err) {
      console.error("Error fetching programs:", err);
      setError(err.message || "Failed to fetch workout programs");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user enrollments
  const fetchUserEnrollments = async () => {
    try {
      setLoadingEnrollments(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data: enrollments, error } = await supabase
        .from("user_programs")
        .select(
          `
          *,
          program_overview!inner(Program_Name, Focus, Weeks, Level)
        `
        )
        .eq("user_id", session.user.id);

      if (error) throw error;

      setUserEnrollments(enrollments || []);
    } catch (err) {
      console.error("Error fetching user enrollments:", err);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  // Enroll in a program
  const enrollInProgram = async (programId) => {
    try {
      setEnrolling(programId);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("You must be logged in to enroll in a program");
        return;
      }

      const userId = session.user.id;

      // Check if user is already enrolled
      const { data: existingEnrollment, error: checkError } = await supabase
        .from("user_programs")
        .select("*")
        .eq("user_id", userId)
        .eq("program_id", programId)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingEnrollment) {
        setError("You are already enrolled in this program");
        return;
      }

      // Enroll user
      const { error: enrollError } = await supabase
        .from("user_programs")
        .insert({
          user_id: userId,
          program_id: programId,
          enrolled_at: new Date().toISOString(),
        });

      if (enrollError) throw enrollError;

      setSuccessMessage("Successfully enrolled in program!");
      setTimeout(() => setSuccessMessage(null), 3000);

      await fetchUserEnrollments();
    } catch (err) {
      console.error("Error enrolling in program:", err);
      setError(err.message || "Failed to enroll in program");
    } finally {
      setEnrolling(null);
    }
  };
// Helper functions for focus and colors
const getFocusType = (focus) => {
  const focusLower = focus?.toLowerCase() || "";
  if (focusLower.includes("strength")) return "strength";
  if (focusLower.includes("hypertrophy") || focusLower.includes("muscle"))
    return "hypertrophy";
  if (focusLower.includes("power")) return "power";
  if (focusLower.includes("muscular endurance")) return "muscEndurance";
  if (focusLower.includes("steady state cardio")) return "cardio";
  if (focusLower.includes("mobility") || focusLower.includes("yoga")) return "mobility_yoga";
  return "general";
};

// Focus options array (this should be defined as a constant)
const FOCUS_OPTIONS = [
  { value: "strength", label: "Strength" },
  { value: "hypertrophy", label: "Hypertrophy" },
  { value: "power", label: "Power" },
  { value: "muscular endurance", label: "Muscular Endurance" },
  { value: "steady state cardio", label: "Cardio" },
  { value: "mobility | yoga", label: "Mobility | Yoga" },
  { value: "other", label: "Other" },
];

const getFocusColorScheme = (focusType) => {
  const schemes = {
    power: "red",
    strength: "pink",
    hypertrophy: "green",
    muscEndurance: "yellow",
    cardio: "orange",
    mobility_yoga: "purple",
    other: "blue",
    general: "gray", // Added missing general case
  };
  return schemes[focusType] || schemes.general;
};

  // Check if user is enrolled
  const isUserEnrolled = (programId) => {
    return userEnrollments.some(
      (enrollment) => enrollment.program_id === programId
    );
  };

  // Get program statistics
  const getProgramStats = (program) => {
    const exercises = program.exercises || [];
    const totalExercises = exercises.length;
    const uniqueWeeks = [...new Set(exercises.map((ex) => ex.week))].length;
    const uniqueDays = [
      ...new Set(exercises.map((ex) => `${ex.week}-${ex.day}`)),
    ].length;

    return {
      totalExercises,
      uniqueWeeks,
      uniqueDays,
      avgExercisesPerDay:
        totalExercises > 0 ? Math.round(totalExercises / uniqueDays) : 0,
    };
  };

  // Filter programs
  const filteredPrograms = programs.filter((program) => {
    const matchesSearch =
      !searchTerm ||
      program.Program_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.Program_Description?.toLowerCase().includes(
        searchTerm.toLowerCase()
      );

    const matchesLevel = !levelFilter || program.Level === levelFilter;
    const matchesFocus = !focusFilter || program.Focus === focusFilter;

    const matchesWeeks =
      !weeksFilter ||
      (weeksFilter === "short" && program.Weeks <= 4) ||
      (weeksFilter === "medium" && program.Weeks > 4 && program.Weeks <= 12) ||
      (weeksFilter === "long" && program.Weeks > 12);

    return matchesSearch && matchesLevel && matchesFocus && matchesWeeks;
  });

  // Get unique values for filters
  const uniqueLevels = [
    ...new Set(programs.map((p) => p.Level).filter(Boolean)),
  ];
  const uniqueFocuses = [
    ...new Set(programs.map((p) => p.Focus).filter(Boolean)),
  ];

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setLevelFilter("");
    setFocusFilter("");
    setWeeksFilter("");
  };

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      await fetchPrograms();
      await fetchUserEnrollments();
      await fetchExerciseLibrary();
    };

    initializeData();
  }, []);

  if (loading && programs.length === 0) {
    return (
      <Box p={4} textAlign="center">
        <Spinner size="lg" color="teal.500" />
        <Text mt={2}>Loading workout programs...</Text>
      </Box>
    );
  }
  // Step 1: Program Goals & Overview Component
  // Step 1: Program Goals & Overview Component - Memoized to prevent re-renders
// Step 1: Program Goals & Overview Component - Simple version without useCallback
const renderStep1Goals = () => {
  console.log('renderStep1Goals called', Date.now());

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="md" mb={4} color="teal.600">
          Define Program Goals & Overview
        </Heading>
        <Text color="gray.600" mb={6}>
          Set the foundation for your training program by defining its core
          objectives and parameters.
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <FormControl isRequired>
          <FormLabel>Program Name</FormLabel>
          <Input
            key="program-name-stable"
            defaultValue={programOverview.Program_Name || ''}
            onBlur={(e) => {
              setProgramOverview(prev => ({
                ...prev,
                Program_Name: e.target.value,
              }));
            }}
            placeholder="e.g., Strength Building Phase 1"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Training Level</FormLabel>
          <Select
            value={programOverview.Level}
            onChange={(e) =>
              setProgramOverview((prev) => ({
                ...prev,
                Level: e.target.value,
              }))
            }
            placeholder="Select training level"
          >
            <option value="Beginner">Beginner (0-1 years)</option>
            <option value="Intermediate">Intermediate (1-3 years)</option>
            <option value="Advanced">Advanced (3+ years)</option>
            <option value="Expert">Expert/Competitive</option>
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Primary Focus</FormLabel>
          <Select
            value={programOverview.Focus}
            onChange={(e) =>
              setProgramOverview((prev) => ({
                ...prev,
                Focus: e.target.value,
              }))
            }
            placeholder="Select primary focus"
          >
            {WORKOUT_FOCUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Program Duration (Weeks)</FormLabel>
          <NumberInput
            defaultValue={programOverview.Program_Length_in_Weeks ?? ""}
            min={1}
            max={52}
          >
            <NumberInputField 
              placeholder="Enter weeks"
              onBlur={(e) =>
                setProgramOverview(prev => ({
                  ...prev,
                  Program_Length_in_Weeks: Number.isNaN(parseInt(e.target.value)) ? null : parseInt(e.target.value),
                }))
              }
            />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel>Key Training Focus</FormLabel>
          <Input
            key="key-training-focus-stable"
            defaultValue={programOverview.Key_Training_Focus || ''}
            onBlur={(e) => {
              setProgramOverview(prev => ({
                ...prev,
                Key_Training_Focus: e.target.value,
              }));
            }}
            placeholder="e.g., Compound movements, Progressive overload"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Training Mix & Frequency</FormLabel>
          <Input
            key="training-mix-frequency-stable"
            defaultValue={programOverview.Training_Mix_Frequency || ''}
            onBlur={(e) => {
              setProgramOverview(prev => ({
                ...prev,
                Training_Mix_Frequency: e.target.value,
              }));
            }}
            placeholder="e.g., 3x/week full body, 4x/week upper/lower"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Program Macro Cycle</FormLabel>
          <Input
            key="program-macro-cycle-stable"
            defaultValue={programOverview.Program_Macro_Cycle || ''}
            onBlur={(e) => {
              setProgramOverview(prev => ({
                ...prev,
                Program_Macro_Cycle: e.target.value,
              }));
            }}
            placeholder="e.g., Accumulation, Intensification, Realization"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Weeks</FormLabel>
          <NumberInput
            defaultValue={programOverview.Weeks ?? ""}
            min={1}
            max={52}
          >
            <NumberInputField 
              placeholder="Enter weeks"
              onBlur={(e) =>
                setProgramOverview(prev => ({
                  ...prev,
                  Weeks: Number.isNaN(parseInt(e.target.value)) ? null : parseInt(e.target.value),
                }))
              }
            />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel>Preferred Season</FormLabel>
          <Select
            value={programOverview.Prefered_Season || ''}
            onChange={(e) =>
              setProgramOverview((prev) => ({
                ...prev,
                Prefered_Season: e.target.value,
              }))
            }
            placeholder="Select preferred season"
          >
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
            <option value="Fall">Fall</option>
            <option value="Winter">Winter</option>
            <option value="Any">Any Season</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Time Per Workout</FormLabel>
          <Input
            key="time-stable"
            defaultValue={programOverview.Time_Per_Workout || ''}
            onBlur={(e) =>  
              setProgramOverview(prev => ({
                ...prev,
                Time_Per_Workout: e.target.value,
              }))
            }
            placeholder="e.g., 60-90 minutes"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Equipment</FormLabel>
          <Input
            key="equipment-stable"
            defaultValue={programOverview.Equipment || ''}
            onBlur={(e) =>  
              setProgramOverview(prev => ({
                ...prev,
                Equipment: e.target.value,
              }))
            }
            placeholder="e.g., Full gym, Home gym, Bodyweight"
          />
        </FormControl>
      </SimpleGrid>

      <FormControl>
        <FormLabel>Program Description</FormLabel>
        <Textarea
          key="description-stable"
          defaultValue={programOverview.Program_Description || ''}
          onBlur={(e) =>  
            setProgramOverview(prev => ({
              ...prev,
              Program_Description: e.target.value,
            }))
          }
          placeholder="Describe the program's objectives, methodology, and target outcomes..."
          rows={4}
        />
      </FormControl>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <FormControl>
          <FormLabel>Nutrition & Recovery</FormLabel>
          <Textarea
            key="nutrition-recovery-stable"
            defaultValue={programOverview.Nutrition_Recovery || ''}
            onBlur={(e) => {
              setProgramOverview(prev => ({
                ...prev,
                Nutrition_Recovery: e.target.value,
              }));
            }}
            placeholder="Guidelines for nutrition, sleep, and recovery protocols..."
            rows={3}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Key Adaptations</FormLabel>
          <Textarea
            key="key-adaptations-stable"
            defaultValue={programOverview.Key_Adaptations || ''}
            onBlur={(e) => {
              setProgramOverview(prev => ({
                ...prev,
                Key_Adaptations: e.target.value,
              }));
            }}
            placeholder="Expected physiological and performance adaptations..."
            rows={3}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Key Assessments</FormLabel>
          <Textarea
            key="key-assessments-stable"
            defaultValue={programOverview.Key_Assessments || ''}
            onBlur={(e) => {
              setProgramOverview(prev => ({
                ...prev,
                Key_Assessments: e.target.value,
              }));
            }}
            placeholder="Tests and measurements to track progress..."
            rows={3}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Key Assessment Goals</FormLabel>
          <Textarea
            key="key-assessment-goals-stable"
            defaultValue={programOverview.Key_Assessment_Goals || ''}
            onBlur={(e) => {
              setProgramOverview(prev => ({
                ...prev,
                Key_Assessment_Goals: e.target.value,
              }));
            }}
            placeholder="Target outcomes and benchmarks for assessments..."
            rows={3}
          />
        </FormControl>
      </SimpleGrid>
    </VStack>
  );
};
// Step 2: Training Structure Component - Fixed with stable keys and onBlur
const renderStep2Structure = () => {
  console.log('renderStep2Structure called', Date.now());

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="md" mb={4} color="teal.600">
          Training Structure Setup
        </Heading>
        <Text color="gray.600" mb={6}>
          Define how your training will be structured throughout the week and across different sessions.
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <FormControl isRequired>
          <FormLabel>Training Structure Type</FormLabel>
          <Select
            value={trainingStructure.type}
            onChange={(e) =>
              setTrainingStructure((prev) => ({
                ...prev,
                type: e.target.value,
              }))
            }
            placeholder="Select training structure"
          >
            {TRAINING_STRUCTURES.map((structure) => (
              <option key={structure.value} value={structure.value}>
                {structure.label}
              </option>
            ))}
          </Select>
          {trainingStructure.type && (
            <Text fontSize="sm" color="gray.600" mt={2}>
              {TRAINING_STRUCTURES.find(s => s.value === trainingStructure.type)?.description}
            </Text>
          )}
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Days Per Week</FormLabel>
          <NumberInput
            value={trainingStructure.daysPerWeek || ""}
            onChange={(valueString, valueNumber) =>
              setTrainingStructure(prev => ({
                ...prev,
                daysPerWeek: Number.isNaN(valueNumber) ? 3 : valueNumber,
              }))
            }
            min={1}
            max={7}
          >
            <NumberInputField placeholder="Enter days per week" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel>Sessions Per Day</FormLabel>
          <NumberInput
            value={trainingStructure.sessionsPerDay || ""}
            onChange={(valueString, valueNumber) =>
              setTrainingStructure(prev => ({
                ...prev,
                sessionsPerDay: Number.isNaN(valueNumber) ? 1 : valueNumber,
              }))
            }
            min={1}
            max={3}
          >
            <NumberInputField placeholder="Sessions per day" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Most programs use 1 session per day
          </Text>
        </FormControl>
      </SimpleGrid>

      {/* Custom Structure Configuration */}
      {trainingStructure.type === 'custom' && (
        <Box>
          <Heading size="sm" mb={4} color="teal.500">
            Custom Structure Configuration
          </Heading>
          <Alert status="info" mb={4}>
            <AlertIcon />
            <Text fontSize="sm">
              Define your custom training structure by specifying what muscle groups or movement patterns  
              you'll train on each day of the week.
            </Text>
          </Alert>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {Array.from({ length: trainingStructure.daysPerWeek || 3 }, (_, index) => (
              <FormControl key={index}>
                <FormLabel>Day {index + 1} Focus</FormLabel>
                <Input
                  key={`custom-day-${index + 1}-stable`}
                  defaultValue={trainingStructure.customStructure?.[`day${index + 1}`] || ""}
                  onBlur={(e) =>
                    setTrainingStructure(prev => ({
                      ...prev,
                      customStructure: {
                        ...prev.customStructure,
                        [`day${index + 1}`]: e.target.value,
                      }
                    }))
                  }
                  placeholder="e.g., Upper Body, Legs, Push, Pull, etc."
                />
              </FormControl>
            ))}
          </SimpleGrid>
        </Box>
      )}

      {/* Structure Preview */}
      {trainingStructure.type && trainingStructure.type !== 'custom' && (
        <Box>
          <Heading size="sm" mb={3} color="teal.500">
            Structure Preview
          </Heading>
          <Card>
            <CardBody>
              {trainingStructure.type === 'push_pull_legs' && (
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Box textAlign="center" p={3} bg="red.50" borderRadius="md">
                    <Text fontWeight="bold" color="red.600">Push Day</Text>
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      Chest, Shoulders, Triceps
                    </Text>
                  </Box>
                  <Box textAlign="center" p={3} bg="blue.50" borderRadius="md">
                    <Text fontWeight="bold" color="blue.600">Pull Day</Text>
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      Back, Biceps, Rear Delts
                    </Text>
                  </Box>
                  <Box textAlign="center" p={3} bg="green.50" borderRadius="md">
                    <Text fontWeight="bold" color="green.600">Legs Day</Text>
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      Quads, Hamstrings, Glutes, Calves
                    </Text>
                  </Box>
                </SimpleGrid>
              )}

              {trainingStructure.type === 'upper_lower' && (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box textAlign="center" p={3} bg="purple.50" borderRadius="md">
                    <Text fontWeight="bold" color="purple.600">Upper Body</Text>
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      Chest, Back, Shoulders, Arms
                    </Text>
                  </Box>
                  <Box textAlign="center" p={3} bg="orange.50" borderRadius="md">
                    <Text fontWeight="bold" color="orange.600">Lower Body</Text>
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      Quads, Hamstrings, Glutes, Calves
                    </Text>
                  </Box>
                </SimpleGrid>
              )}

              {trainingStructure.type === 'full_body' && (
                <Box textAlign="center" p={3} bg="teal.50" borderRadius="md">
                  <Text fontWeight="bold" color="teal.600">Full Body</Text>
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    All major muscle groups each session
                  </Text>
                </Box>
              )}

              {trainingStructure.type === 'body_part' && (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
                  {['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'].map((bodyPart) => (
                    <Box key={bodyPart} textAlign="center" p={2} bg="gray.50" borderRadius="md">
                      <Text fontWeight="medium" fontSize="sm">{bodyPart}</Text>
                    </Box>
                  ))}
                </SimpleGrid>
              )}
            </CardBody>
          </Card>
        </Box>
      )}

      {/* Weekly Schedule Preview */}      
      {
      /*trainingStructure.daysPerWeek && (
        <Box>
          <Heading size="sm" mb={3} color="teal.500">
            Weekly Schedule
          </Heading>
          <HStack spacing={2} flexWrap="wrap">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <Badge
                key={day}
                colorScheme={index < trainingStructure.daysPerWeek ? "teal" : "gray"}
                variant={index < trainingStructure.daysPerWeek ? "solid" : "outline"}
                p={2}
              >
                {day}
              </Badge>
            ))}
          </HStack>
          <Text fontSize="sm" color="gray.600" mt={2}>
            Training on {trainingStructure.daysPerWeek} days per week
          </Text>
        </Box>
      )*/
      }
    </VStack>
  );
};
  // Step 3: Progression Rules Component
  const renderStep3Progression = () => {
    return (
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="md" mb={4} color="teal.600">
            Define Progression Rules
          </Heading>
          <Text color="gray.600" mb={6}>
            Set how your program will progress over time. Choose the progression
            method that best fits your training goals.
          </Text>
        </Box>
  
        <Card>
          <CardHeader>
            <Heading size="sm">Progression Method</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Progression Type</FormLabel>
                <RadioGroup
                  value={progressionRules.type}
                  onChange={(value) =>
                    setProgressionRules((prev) => ({ ...prev, type: value }))
                  }
                >
                  <VStack align="start" spacing={3}>
                    {PROGRESSION_TYPES.map((type) => (
                      <Box key={type.value}>
                        <Radio value={type.value} size="md">
                          <VStack align="start" spacing={1} ml={2}>
                            <Text fontWeight="semibold">{type.label}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {type.description}
                            </Text>
                          </VStack>
                        </Radio>
                      </Box>
                    ))}
                  </VStack>
                </RadioGroup>
              </FormControl>
  
              {/* Linear Progression Settings */}
              {progressionRules.type === "linear" && (
                <Box p={4} bg="blue.50" borderRadius="md">
                  <Text fontWeight="semibold" mb={3} color="blue.700">
                    Linear Progression Settings
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="sm">Weight Increase per Week (kg)</FormLabel>
                      <NumberInput
                        value={progressionRules.weightProgression || 2.5}
                        onChange={(_, value) =>
                          setProgressionRules((prev) => ({
                            ...prev,
                            weightProgression: value || 2.5,
                          }))
                        }
                        min={0.5}
                        max={10}
                        step={0.5}
                        precision={1}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </SimpleGrid>
                </Box>
              )}
  
              {/* Double Progression Settings */}
              {progressionRules.type === "double" && (
                <Box p={4} bg="green.50" borderRadius="md">
                  <Text fontWeight="semibold" mb={3} color="green.700">
                    Double Progression Settings
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="sm">Rep Range Min</FormLabel>
                      <NumberInput
                        value={progressionRules.repRangeMin || 8}
                        onChange={(_, value) =>
                          setProgressionRules((prev) => ({
                            ...prev,
                            repRangeMin: value || 8,
                          }))
                        }
                        min={1}
                        max={20}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Rep Range Max</FormLabel>
                      <NumberInput
                        value={progressionRules.repRangeMax || 12}
                        onChange={(_, value) =>
                          setProgressionRules((prev) => ({
                            ...prev,
                            repRangeMax: value || 12,
                          }))
                        }
                        min={1}
                        max={30}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Weight Increase (kg)</FormLabel>
                      <NumberInput
                        value={progressionRules.weightProgression || 2.5}
                        onChange={(_, value) =>
                          setProgressionRules((prev) => ({
                            ...prev,
                            weightProgression: value || 2.5,
                          }))
                        }
                        min={0.5}
                        max={10}
                        step={0.5}
                        precision={1}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </SimpleGrid>
                  <Text fontSize="sm" color="green.600" mt={2}>
                    💡 Increase reps each week until max is reached, then increase weight and reset to min reps.
                  </Text>
                </Box>
              )}
  
              {/* Percentage-based Settings */}
              {progressionRules.type === "percentage" && (
                <Box p={4} bg="purple.50" borderRadius="md">
                  <Text fontWeight="semibold" mb={3} color="purple.700">
                    Percentage-based Progression Settings
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="sm">Weekly % Increase</FormLabel>
                      <NumberInput
                        value={progressionRules.percentageIncrease || 2.5}
                        onChange={(_, value) =>
                          setProgressionRules((prev) => ({
                            ...prev,
                            percentageIncrease: value || 2.5,
                          }))
                        }
                        min={1}
                        max={10}
                        step={0.5}
                        precision={1}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Starting % of 1RM</FormLabel>
                      <NumberInput
                        value={progressionRules.startingPercentage || 70}
                        onChange={(_, value) =>
                          setProgressionRules((prev) => ({
                            ...prev,
                            startingPercentage: value || 70,
                          }))
                        }
                        min={50}
                        max={95}
                        step={2.5}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </SimpleGrid>
                </Box>
              )}
  
              {/* Block Periodization Settings */}
              {progressionRules.type === "block" && (
                <Box p={4} bg="orange.50" borderRadius="md">
                  <Text fontWeight="semibold" mb={3} color="orange.700">
                    Block Periodization Settings
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="sm">Block Length (weeks)</FormLabel>
                      <NumberInput
                        value={progressionRules.blockLength || 4}
                        onChange={(_, value) =>
                          setProgressionRules((prev) => ({
                            ...prev,
                            blockLength: value || 4,
                          }))
                        }
                        min={2}
                        max={8}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Block Focus</FormLabel>
                      <Select
                        value={progressionRules.blockFocus || "accumulation"}
                        onChange={(e) =>
                          setProgressionRules((prev) => ({
                            ...prev,
                            blockFocus: e.target.value,
                          }))
                        }
                      >
                        <option value="accumulation">Accumulation (Volume)</option>
                        <option value="intensification">Intensification (Intensity)</option>
                        <option value="realization">Realization (Peak)</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>
                </Box>
              )}
  
              {/* Wave Loading Settings */}
              {progressionRules.type === "wave" && (
                <Box p={4} bg="teal.50" borderRadius="md">
                  <Text fontWeight="semibold" mb={3} color="teal.700">
                    Wave Loading Settings
                  </Text>
                  <FormControl>
                    <FormLabel fontSize="sm">Wave Pattern (% of 1RM)</FormLabel>
                    <HStack spacing={2}>
                      {progressionRules.wavePattern?.map((percentage, index) => (
                        <NumberInput
                          key={index}
                          value={percentage}
                          onChange={(_, value) => {
                            const newPattern = [...(progressionRules.wavePattern || [75, 80, 85, 90])];
                            newPattern[index] = value || 75;
                            setProgressionRules((prev) => ({
                              ...prev,
                              wavePattern: newPattern,
                            }));
                          }}
                          min={50}
                          max={100}
                          step={2.5}
                          size="sm"
                          width="80px"
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      )) || []}
                    </HStack>
                    <Text fontSize="xs" color="teal.600" mt={1}>
                      Week 1: {progressionRules.wavePattern?.[0] || 75}%, Week 2: {progressionRules.wavePattern?.[1] || 80}%, Week 3: {progressionRules.wavePattern?.[2] || 85}%, Week 4: {progressionRules.wavePattern?.[3] || 90}%
                    </Text>
                  </FormControl>
                </Box>
              )}
  
              {/* Common Deload Settings */}
              <Box p={4} bg="gray.50" borderRadius="md">
                <Text fontWeight="semibold" mb={3}>
                  Deload Settings
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm">Deload Every X Weeks</FormLabel>
                    <NumberInput
                      value={progressionRules.deloadFrequency || 4}
                      onChange={(_, value) =>
                        setProgressionRules((prev) => ({
                          ...prev,
                          deloadFrequency: value || 4,
                        }))
                      }
                      min={3}
                      max={8}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm">Deload Intensity (%)</FormLabel>
                    <NumberInput
                      value={progressionRules.deloadPercentage || 80}
                      onChange={(_, value) =>
                        setProgressionRules((prev) => ({
                          ...prev,
                          deloadPercentage: value || 80,
                        }))
                      }
                      min={60}
                      max={90}
                      step={5}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    );
  };

  // Step 4: Week 1 Template Component - Fixed with stable keys and proper focus handling
  const renderStep4WeekOne = () => {
    console.log('renderStep4WeekOne called', Date.now());
  
    return (
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="md" mb={4} color="teal.600">
            Create Week 1 Template
          </Heading>
          <Text color="gray.600" mb={6}>
            Design your first week of training. This will serve as the foundation
            for the entire program.
          </Text>
        </Box>
  
        <WeekTemplateEditor
          key="week-template-editor-stable"
          weekData={weekOneTemplate}
          weekNumber={1}
          trainingStructure={trainingStructure}
          onUpdate={setWeekOneTemplate}
          selectedDay={selectedTrainingDay}
          onSelectedDayChange={setSelectedTrainingDay}
        />
      </VStack>
    );
  };
  
  // Week Template Editor Component - Enhanced with automatic weight calculation
  const WeekTemplateEditor = memo(({
    weekData,
    weekNumber,
    trainingStructure,
    onUpdate,
    selectedDay,
    onSelectedDayChange,
  }) => {
    const [dayExercises, setDayExercises] = useState([]);
    const [workoutHistory, setWorkoutHistory] = useState({});
  
    console.log('WeekTemplateEditor called', Date.now());
  
    // Function to fetch workout history for an exercise
    const fetchWorkoutHistory = async (exerciseName) => {
      if (!exerciseName || workoutHistory[exerciseName]) {
        return workoutHistory[exerciseName] || null;
      }
  
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        
        if (!session) return null;
  
        console.log(`🔍 Fetching workout history for: ${exerciseName}`);
  
        const { data, error } = await supabase
          .from("Workout_Daily_Log")
          .select("weight_kg, reps")
          .eq("exercise", exerciseName)
          .eq("user_id", session.user.id)
          .not("weight_kg", "is", null)
          .not("reps", "is", null)
          .order("date", { ascending: false }) // Fixed: using "date" instead of "created_at"
          .limit(5); // Get last 5 entries
  
        if (error) {
          console.error("Error fetching workout history:", error);
          return null;
        }
  
        // Calculate estimated 1RM from history using Epley formula: weight * (1 + reps/30)
        let bestEstimated1RM = 0;
        if (data && data.length > 0) {
          console.log(`📊 Found ${data.length} workout history entries for ${exerciseName}`);
          data.forEach(entry => {
            const estimated1RM = entry.weight_kg * (1 + entry.reps / 30);
            console.log(`📈 History entry: ${entry.weight_kg}kg × ${entry.reps} reps = ${estimated1RM.toFixed(1)}kg estimated 1RM`);
            if (estimated1RM > bestEstimated1RM) {
              bestEstimated1RM = estimated1RM;
            }
          });
          console.log(`🏆 Best estimated 1RM for ${exerciseName}: ${bestEstimated1RM.toFixed(1)}kg`);
        } else {
          console.log(`📭 No workout history found for ${exerciseName}`);
        }
  
        const historyData = bestEstimated1RM > 0 ? { estimated1RM: bestEstimated1RM } : null;
        
        // Cache the result
        setWorkoutHistory(prev => ({
          ...prev,
          [exerciseName]: historyData
        }));
  
        return historyData;
      } catch (err) {
        console.error("Error fetching workout history:", err);
        return null;
      }
    };
  
    // Function to calculate target weight
    const calculateTargetWeight = async (exercise, loadPercentage) => {
      if (!loadPercentage || loadPercentage <= 0) {
        return null; // No calculation without load percentage
      }
  
      // Priority 1: Use 1RM from Exercise Library
      if (exercise.exerciseDetails && exercise.exerciseDetails['1_RM_Alex']) {
        const oneRM = parseFloat(exercise.exerciseDetails['1_RM_Alex']);
        if (oneRM > 0) {
          const targetWeight = (oneRM * loadPercentage) / 100;
          console.log(`💪 Calculated from 1RM: ${oneRM}kg × ${loadPercentage}% = ${targetWeight.toFixed(1)}kg`);
          return Math.round(targetWeight * 4) / 4; // Round to nearest 0.25kg
        }
      }
  
      // Priority 2: Use workout history
      if (exercise.exercise) {
        const history = await fetchWorkoutHistory(exercise.exercise);
        if (history && history.estimated1RM > 0) {
          const targetWeight = (history.estimated1RM * loadPercentage) / 100;
          console.log(`📊 Calculated from history: ${history.estimated1RM.toFixed(1)}kg × ${loadPercentage}% = ${targetWeight.toFixed(1)}kg`);
          return Math.round(targetWeight * 4) / 4; // Round to nearest 0.25kg
        }
      }
  
      // Priority 3: Manual entry required
      console.log(`ℹ️ No 1RM or history found for ${exercise.exercise}. Manual entry required.`);
      return null;
    };
  
    // Enhanced updateExercise function with weight calculation
    const updateExercise = async (index, field, value) => {
      const updated = [...dayExercises];
      updated[index] = { ...updated[index], [field]: value };
  
      // Auto-calculate weight when load percentage changes
      if (field === "load_prescription_p1rm" && value > 0) {
        const calculatedWeight = await calculateTargetWeight(updated[index], value);
        if (calculatedWeight !== null) {
          updated[index].target_weight_kg = calculatedWeight;
          // Fixed: Use bracket notation properly
          const hasOneRM = updated[index].exerciseDetails && updated[index].exerciseDetails['1_RM_Alex'];
          updated[index].weight_calculation_source = hasOneRM ? "1RM_Library" : "workout_history";
        }
      }
  
      // Also recalculate when exercise changes (if load percentage exists)
      if (field === "exerciseDetails" && updated[index].load_prescription_p1rm > 0) {
        const calculatedWeight = await calculateTargetWeight(updated[index], updated[index].load_prescription_p1rm);
        if (calculatedWeight !== null) {
          updated[index].target_weight_kg = calculatedWeight;
          // Fixed: Use bracket notation properly
          const hasOneRM = value && value['1_RM_Alex'];
          updated[index].weight_calculation_source = hasOneRM ? "1RM_Library" : "workout_history";
        }
      }
  
      setDayExercises(updated);
  
      const updatedWeek = {
        ...weekData,
        [selectedDay]: updated,
      };
      onUpdate(updatedWeek);
    };
  
    // Enhanced handleExerciseSelect with auto weight calculation
    const handleExerciseSelect = async (index, exerciseData) => {
      const updated = [...dayExercises];
      updated[index] = {
        ...updated[index],
        exercise: exerciseData.Exercise,
        exerciseDetails: exerciseData,
        focus: exerciseData.Target_Muscle_Group || updated[index].focus,
      };
  
      // Auto-calculate weight if load percentage exists
      if (updated[index].load_prescription_p1rm > 0) {
        const calculatedWeight = await calculateTargetWeight(updated[index], updated[index].load_prescription_p1rm);
        if (calculatedWeight !== null) {
          updated[index].target_weight_kg = calculatedWeight;
          // Fixed: Use bracket notation properly
          const hasOneRM = exerciseData && exerciseData['1_RM_Alex'];
          updated[index].weight_calculation_source = hasOneRM ? "1RM_Library" : "workout_history";
        }
      }
  
      setDayExercises(updated);
  
      const updatedWeek = {
        ...weekData,
        [selectedDay]: updated,
      };
      onUpdate(updatedWeek);
    };
  
    const addExercise = () => {
      const newExercise = {
        exercise: "",
        target_sets: 3,
        target_reps: 10,
        target_weight_kg: null,
        target_rpe: 7,
        target_rest: 60,
        load_prescription_p1rm: null,
        focus: programOverview.Focus,
        superset: "",
        exercise_program_note: "",
        exerciseDetails: null,
        weight_calculation_source: null, // Track how weight was calculated
      };
      const updatedExercises = [...dayExercises, newExercise];
      setDayExercises(updatedExercises);
  
      const updatedWeek = {
        ...weekData,
        [selectedDay]: updatedExercises,
      };
      onUpdate(updatedWeek);
    };
  
    const removeExercise = (index) => {
      const updated = dayExercises.filter((_, i) => i !== index);
      setDayExercises(updated);
  
      const updatedWeek = {
        ...weekData,
        [selectedDay]: updated,
      };
      onUpdate(updatedWeek);
    };
  
    useEffect(() => {
      setDayExercises(weekData[selectedDay] || []);
    }, [selectedDay, weekData]);
  
    return (
      <Box>
        <HStack mb={4}>
          <Text fontWeight="semibold">Training Day:</Text>
          {Array.from(
            { length: trainingStructure.daysPerWeek },
            (_, i) => i + 1
          ).map((day) => (
            <Button
              key={day}
              size="sm"
              colorScheme={selectedDay === day ? "teal" : "gray"}
              variant={selectedDay === day ? "solid" : "outline"}
              onClick={() => onSelectedDayChange(day)}
            >
              Day {day}
            </Button>
          ))}
        </HStack>
  
        <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight="semibold">Day {selectedDay} Exercises</Text>
            <Button
              leftIcon={<AddIcon />}
              size="sm"
              colorScheme="teal"
              onClick={addExercise}
            >
              Add Exercise
            </Button>
          </Flex>
  
          {dayExercises.length === 0 ? (
            <Box textAlign="center" py={8} bg="gray.50" borderRadius="md">
              <Text color="gray.500" mb={2}>
                No exercises added yet for Day {selectedDay}
              </Text>
              <Text fontSize="sm" color="gray.400">
                Click "Add Exercise" to get started
              </Text>
            </Box>
          ) : (
            <VStack spacing={4} align="stretch">
              {dayExercises.map((exercise, index) => (
                <Box
                  key={`day${selectedDay}-exercise${index}-stable`}
                  p={4}
                  bg="gray.50"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <Grid
                    templateColumns="repeat(auto-fit, minmax(200px, 1fr))"
                    gap={3}
                    mb={3}
                  >
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="semibold">
                        Exercise *
                      </FormLabel>
                      <ExerciseSearchInput
                        key={`exercise-search-${selectedDay}-${index}-stable`}
                        currentValue={exercise.exercise}
                        onSelectExercise={(exerciseData) =>
                          handleExerciseSelect(index, exerciseData)
                        }
                      />
                    </FormControl>
  
                    {/* Sets - Fixed with defaultValue + onBlur */}
                    <FormControl>
                      <FormLabel fontSize="sm">Sets</FormLabel>
                      <NumberInput
                        size="sm"
                        defaultValue={exercise.target_sets}
                        min={1}
                        max={10}
                      >
                        <NumberInputField
                          onBlur={(e) =>
                            updateExercise(
                              index,
                              "target_sets",
                              parseInt(e.target.value) || 3
                            )
                          }
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
  
                    {/* Reps - Fixed with defaultValue + onBlur */}
                    <FormControl>
                      <FormLabel fontSize="sm">Reps</FormLabel>
                      <NumberInput
                        size="sm"
                        defaultValue={exercise.target_reps}
                        min={1}
                        max={50}
                      >
                        <NumberInputField
                          onBlur={(e) =>
                            updateExercise(
                              index,
                              "target_reps",
                              parseInt(e.target.value) || 10
                            )
                          }
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </Grid>
  
                  <Grid
                    templateColumns="repeat(auto-fit, minmax(150px, 1fr))"
                    gap={3}
                    mb={3}
                  >
                    {/* Load % 1RM - Now triggers weight calculation */}
                    <FormControl>
                      <FormLabel fontSize="sm">Load % 1RM</FormLabel>
                      <NumberInput
                        size="sm"
                        defaultValue={exercise.load_prescription_p1rm || ""}
                        min={30}
                        max={100}
                        precision={1}
                        step={2.5}
                      >
                        <NumberInputField
                          onBlur={(e) =>
                            updateExercise(
                              index,
                              "load_prescription_p1rm",
                              parseFloat(e.target.value) || null
                            )
                          }
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
  
                    {/* Weight - Fixed with focus-friendly approach */}
                    <FormControl>
                      <FormLabel fontSize="sm">
                        <HStack spacing={1}>
                          <Text>Weight (kg)</Text>
                          {exercise.weight_calculation_source && (
                            <Badge 
                              size="xs" 
                              colorScheme={exercise.weight_calculation_source === "1RM_Library" ? "blue" : exercise.weight_calculation_source === "workout_history" ? "green" : "orange"}
                            >
                              {exercise.weight_calculation_source === "1RM_Library" ? "📚 1RM" : exercise.weight_calculation_source === "workout_history" ? "📊 History" : "✏️ Manual"}
                            </Badge>
                          )}
                        </HStack>
                      </FormLabel>
                      <NumberInput
                        size="sm"
                        defaultValue={exercise.target_weight_kg || ""} // Fixed: using defaultValue instead of value
                        min={0}
                        precision={2}
                        step={0.25}
                      >
                        <NumberInputField
                          placeholder={
                            exercise.load_prescription_p1rm 
                              ? "Auto-calculating..." 
                              : "Enter manually"
                          }
                          onBlur={(e) => {
                            const manualWeight = parseFloat(e.target.value) || null;
                            updateExercise(index, "target_weight_kg", manualWeight);
                            // Mark as manual when user enters value
                            if (manualWeight !== null) {
                              updateExercise(index, "weight_calculation_source", "manual");
                            }
                          }}
                          // Removed onChange to prevent focus loss
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      
                      {/* Weight calculation info */}
                      {exercise.load_prescription_p1rm && !exercise.target_weight_kg && (
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          💡 Enter % 1RM to auto-calculate weight
                        </Text>
                      )}
                      {exercise.target_weight_kg && exercise.weight_calculation_source === "1RM_Library" && (
                        <Text fontSize="xs" color="blue.600" mt={1}>
                          📚 Calculated from 1RM: {exercise.exerciseDetails && exercise.exerciseDetails['1_RM_Alex']}kg
                        </Text>
                      )}
                      {exercise.target_weight_kg && exercise.weight_calculation_source === "workout_history" && (
                        <Text fontSize="xs" color="green.600" mt={1}>
                          📊 Calculated from workout history
                        </Text>
                      )}
                      {exercise.target_weight_kg && exercise.weight_calculation_source === "manual" && (
                        <Text fontSize="xs" color="orange.600" mt={1}>
                          ✏️ Manually entered
                        </Text>
                      )}
                    </FormControl>
  
                    {/* RPE - Fixed with defaultValue + onBlur */}
                    <FormControl>
                      <FormLabel fontSize="sm">RPE</FormLabel>
                      <NumberInput
                        size="sm"
                        defaultValue={exercise.target_rpe}
                        min={1}
                        max={10}
                      >
                        <NumberInputField
                          onBlur={(e) =>
                            updateExercise(
                              index,
                              "target_rpe",
                              parseInt(e.target.value) || 7
                            )
                          }
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
  
                    {/* Rest - Fixed with defaultValue + onBlur */}
                    <FormControl>
                      <FormLabel fontSize="sm">Rest (seconds)</FormLabel>
                      <NumberInput
                        size="sm"
                        defaultValue={exercise.target_rest}
                        min={30}
                        max={300}
                        step={15}
                      >
                        <NumberInputField
                          onBlur={(e) =>
                            updateExercise(
                              index,
                              "target_rest",
                              parseInt(e.target.value) || 60
                            )
                          }
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
  
                    {/* Superset - Text field with focus-friendly approach */}
                    <FormControl>
                      <FormLabel fontSize="sm">Superset</FormLabel>
                      <Input
                        key={`superset-${selectedDay}-${index}-stable`}
                        size="sm"
                        defaultValue={exercise.superset || ""}
                        onBlur={(e) =>
                          updateExercise(index, "superset", e.target.value)
                        }
                        placeholder="e.g., A1, A2, B1..."
                      />
                    </FormControl>
                  </Grid>
  
                  {/* Exercise Details Preview */}
                  {exercise.exerciseDetails && (
                    <Accordion allowToggle mt={3}>
                      <AccordionItem
                        border="1px solid"
                        borderColor="blue.200"
                        borderRadius="md"
                      >
                        <AccordionButton
                          _hover={{ bg: "blue.50" }}
                          borderRadius="md"
                          p={3}
                        >
                          <Box flex="1" textAlign="left">
                            <HStack>
                              <Text
                                fontSize="sm"
                                fontWeight="semibold"
                                color="blue.600"
                              >
                                📋 Exercise Details
                              </Text>
                              {(exercise.exerciseDetails.Favorite === "Yes" ||
                                exercise.exerciseDetails.Favorite === "Y") && (
                                <Badge colorScheme="yellow" size="sm">
                                  ⭐ Favorite
                                </Badge>
                              )}
                              {exercise.exerciseDetails && exercise.exerciseDetails['1_RM_Alex'] && (
                                <Badge colorScheme="blue" size="sm">
                                  💪 1RM: {exercise.exerciseDetails['1_RM_Alex']}kg
                                </Badge>
                              )}
                            </HStack>
                          </Box>
                          <AccordionIcon color="blue.600" />
                        </AccordionButton>
  
                        <AccordionPanel pb={4} bg="blue.50">
                          {/* Video Demonstration */}
                          {exercise.exerciseDetails.Video_Demonstration && (
                            <Box
                              mb={3}
                              p={2}
                              bg="white"
                              borderRadius="md"
                              border="1px solid"
                              borderColor="blue.200"
                            >
                              <Text
                                fontSize="xs"
                                fontWeight="semibold"
                                mb={1}
                                color="blue.600"
                              >
                                🎥 Video Demonstration:
                              </Text>
                              {exercise.exerciseDetails.Video_Demonstration.includes(
                                "youtube.com"
                              ) ||
                              exercise.exerciseDetails.Video_Demonstration.includes(
                                "youtu.be"
                              ) ? (
                                <Link
                                  href={
                                    exercise.exerciseDetails.Video_Demonstration
                                  }
                                  isExternal
                                  color="blue.500"
                                  fontSize="xs"
                                  fontWeight="medium"
                                  _hover={{
                                    textDecoration: "underline",
                                    color: "blue.600",
                                  }}
                                >
                                  Watch on YouTube 🎥
                                </Link>
                              ) : exercise.exerciseDetails.Video_Demonstration.startsWith(
                                  "http"
                                ) ? (
                                <Link
                                  href={
                                    exercise.exerciseDetails.Video_Demonstration
                                  }
                                  isExternal
                                  color="blue.500"
                                  fontSize="xs"
                                  fontWeight="medium"
                                  _hover={{
                                    textDecoration: "underline",
                                    color: "blue.600",
                                  }}
                                >
                                  Watch Video 🎥
                                </Link>
                              ) : (
                                <Text fontSize="xs" color="gray.600">
                                  {exercise.exerciseDetails.Video_Demonstration}
                                </Text>
                              )}
                            </Box>
                          )}
  
                          <SimpleGrid
                            columns={{ base: 1, md: 2 }}
                            spacing={2}
                            fontSize="xs"
                            mb={3}
                          >
                            {exercise.exerciseDetails.Target_Muscle_Group && (
                              <Text>
                                <strong>Target:</strong>{" "}
                                {exercise.exerciseDetails.Target_Muscle_Group}
                              </Text>
                            )}
                            {exercise.exerciseDetails.Primary_Equipment && (
                              <Text>
                                <strong>Equipment:</strong>{" "}
                                {exercise.exerciseDetails.Primary_Equipment}
                              </Text>
                            )}
                            {exercise.exerciseDetails && exercise.exerciseDetails['1_RM_Alex'] && (
                              <Text color="blue.600" fontWeight="bold">
                                <strong>💪 1RM Available:</strong>{" "}
                                {exercise.exerciseDetails['1_RM_Alex']}kg
                              </Text>
                            )}
                            {exercise.exerciseDetails.Difficulty_Level && (
                              <Text>
                                <strong>Difficulty:</strong>{" "}
                                {exercise.exerciseDetails.Difficulty_Level}
                              </Text>
                            )}
                          </SimpleGrid>
  
                          {/* Exercise Notes */}
                          {(exercise.exerciseDetails.Exercise_Notes ||
                            exercise.exerciseDetails["In-Depth_Explanation"]) && (
                            <Box
                              p={2}
                              bg="white"
                              borderRadius="md"
                              border="1px solid"
                              borderColor="gray.200"
                            >
                              <Text
                                fontSize="xs"
                                fontWeight="semibold"
                                mb={1}
                                color="gray.600"
                              >
                                📝 Exercise Notes:
                              </Text>
                              <Text
                                fontSize="xs"
                                color="gray.700"
                                lineHeight="1.4"
                              >
                                {renderTextWithLinks(
                                  exercise.exerciseDetails.Exercise_Notes ||
                                    exercise.exerciseDetails["In-Depth_Explanation"]
                                )}
                              </Text>
                            </Box>
                          )}
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  )}
  
                  <Flex justify="space-between" align="center" mt={3}>
                    <FormControl width="200px">
                      <FormLabel fontSize="sm">
                        Exercise Notes (Program)
                      </FormLabel>
                      <Input
                        key={`program-notes-${selectedDay}-${index}-stable`}
                        size="sm"
                        defaultValue={exercise.exercise_program_note || ""}
                        onBlur={(e) =>
                          updateExercise(
                            index,
                            "exercise_program_note",
                            e.target.value
                          )
                        }
                        placeholder="Optional notes..."
                      />
                    </FormControl>
  
                    <IconButton
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => removeExercise(index)}
                      aria-label="Remove exercise"
                    />
                  </Flex>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      </Box>
    );
  });
  
  WeekTemplateEditor.displayName = 'WeekTemplateEditor';

  // Step 5: Auto-Generate Program Component
 // Step 5: Auto-Generate Program Component
const renderStep5Generate = () => (
  <VStack spacing={6} align="stretch">
    <Box>
      <Heading size="md" mb={4} color="teal.600">
        Generate Complete Program
      </Heading>
      <Text color="gray.600" mb={6}>
        Based on your settings, we'll automatically generate your complete training program with progression applied to each week.
      </Text>
    </Box> 




    {/* Program Summary */}
    <Card>
      <CardHeader>
        <Heading size="sm" color="teal.500">Program Summary</Heading>
      </CardHeader>
      <CardBody>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <Stat>
            <StatLabel>Program Name</StatLabel>
            <StatNumber fontSize="md">{programOverview.Program_Name || "Untitled Program"}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Duration</StatLabel>
            <StatNumber>{programOverview.Program_Length_in_Weeks || 0} weeks</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Training Days</StatLabel>
            <StatNumber>{trainingStructure.daysPerWeek || 3} days/week</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Structure</StatLabel>
            <StatNumber fontSize="sm">
              {TRAINING_STRUCTURES.find(s => s.value === trainingStructure.type)?.label || "Custom"}
            </StatNumber>
          </Stat>
        </SimpleGrid>
      </CardBody>
    </Card>

    {/* Progression Preview */}
    <Card>
      <CardHeader>
        <Heading size="sm" color="teal.500">Progression Strategy</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <HStack spacing={4}>
            <Badge colorScheme="blue" p={2}>
              {PROGRESSION_TYPES.find(p => p.value === progressionRules.type)?.label || "Linear"}
            </Badge>
            {progressionRules.autoGenerate && (
              <Badge colorScheme="green" p={2}>Auto-Generated</Badge>
            )}
          </HStack>

          <Text fontSize="sm" color="gray.600">
            {PROGRESSION_TYPES.find(p => p.value === progressionRules.type)?.description}
          </Text>

          {/* Progression Details */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {progressionRules.type === 'linear' && (
              <Box p={3} bg="blue.50" borderRadius="md">
                <Text fontWeight="bold" fontSize="sm">Weight Progression</Text>
                <Text fontSize="sm" color="gray.600">
                  +{progressionRules.weightProgression || 2.5}kg per week
                </Text>
              </Box>
            )}

            <Box p={3} bg="orange.50" borderRadius="md">
              <Text fontWeight="bold" fontSize="sm">Deload Schedule</Text>
              <Text fontSize="sm" color="gray.600">
                Every {progressionRules.deloadFrequency || 4} weeks at {progressionRules.deloadPercentage || 80}%
              </Text>
            </Box>

            <Box p={3} bg="purple.50" borderRadius="md">
              <Text fontWeight="bold" fontSize="sm">Week 1 Template</Text>
              <Text fontSize="sm" color="gray.600">
                {getTotalExercisesInTemplate()} exercises configured
              </Text>
            </Box>
          </SimpleGrid>
        </VStack>
      </CardBody>
    </Card>

    {/* Generation Controls */}
    <Card>
      <CardHeader>
        <Heading size="sm" color="teal.500">Program Generation</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Alert status="info">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold" fontSize="sm">Ready to Generate</Text>
              <Text fontSize="sm">
                Your program will be generated based on the Week 1 template with progression rules applied to create {programOverview.Program_Length_in_Weeks || 0} weeks of training.
              </Text>
            </VStack>
          </Alert>

          {/* Generation Options */}
          <Box>
            <Text fontWeight="bold" mb={3}>Generation Options</Text>
            <VStack spacing={3} align="stretch">
              <HStack>
                <Switch
                  isChecked={generatedProgram.includeDeloads !== false}
                  onChange={(e) =>
                    setGeneratedProgram(prev => ({
                      ...prev,
                      includeDeloads: e.target.checked,
                    }))
                  }
                  colorScheme="teal"
                />
                <Text fontSize="sm">Include scheduled deload weeks</Text>
              </HStack>

              <HStack>
                <Switch
                  isChecked={generatedProgram.autoAdjustRPE !== false}
                  onChange={(e) =>
                    setGeneratedProgram(prev => ({
                      ...prev,
                      autoAdjustRPE: e.target.checked,
                    }))
                  }
                  colorScheme="teal"
                />
                <Text fontSize="sm">Auto-adjust RPE based on progression</Text>
              </HStack>

              <HStack>
                <Switch
                  isChecked={generatedProgram.includeNotes !== false}
                  onChange={(e) =>
                    setGeneratedProgram(prev => ({
                      ...prev,
                      includeNotes: e.target.checked,
                    }))
                  }
                  colorScheme="teal"
                />
                <Text fontSize="sm">Include progression notes for each week</Text>
              </HStack>
            </VStack>
          </Box>

          {/* Generate Button */}
          <HStack justify="center" pt={4}>
            <Button
              colorScheme="teal"
              size="lg"
              leftIcon={<CheckIcon />}
              onClick={handleGenerateProgram}
              isLoading={loading}
              loadingText="Generating..."
              isDisabled={getTotalExercisesInTemplate() === 0}
            >
              Generate Complete Program
            </Button>
          </HStack>

          {getTotalExercisesInTemplate() === 0 && (
            <Text fontSize="sm" color="red.500" textAlign="center">
              Please add exercises to your Week 1 template before generating the program
            </Text>
          )}
        </VStack>
      </CardBody>
    </Card>

    {/* Generated Program Preview */}
    {Object.keys(generatedProgram.weeks || {}).length > 0 && (
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="sm" color="green.500">Generated Program Preview</Heading>
            <Badge colorScheme="green">Generated Successfully</Badge>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <Stat>
                <StatLabel>Total Weeks</StatLabel>
                <StatNumber>{Object.keys(generatedProgram.weeks || {}).length}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Total Sessions</StatLabel>
                <StatNumber>{getTotalSessionsGenerated()}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Total Exercises</StatLabel>
                <StatNumber>{getTotalExercisesGenerated()}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Deload Weeks</StatLabel>
                <StatNumber>{getDeloadWeeksCount()}</StatNumber>
              </Stat>
            </SimpleGrid>

            <Divider />

            <Box>
              <Text fontWeight="bold" mb={2}>Week-by-Week Overview (Click to view details)</Text>
              <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={2}>
                {Object.entries(generatedProgram.weeks || {}).map(([weekNum, weekData]) => (
                  <Box
                    key={weekNum}
                    p={3}
                    bg={weekData.isDeload ? "orange.100" : "teal.50"}
                    borderRadius="md"
                    textAlign="center"
                    cursor="pointer"
                    _hover={{
                      bg: weekData.isDeload ? "orange.200" : "teal.100",
                      transform: "translateY(-2px)",
                      boxShadow: "md"
                    }}
                    transition="all 0.2s"
                    onClick={() => setSelectedWeekForView({ weekNumber: weekNum, weekData })}
                  >
                    <Text fontWeight="bold" fontSize="sm">
                      Week {weekNum}
                    </Text>
                    <Text fontSize="xs" color="gray.600" mb={1}>
                      {weekData.isDeload ? "Deload" : "Training"}
                    </Text>
                    <VStack spacing={1}>
                      <Badge size="xs" colorScheme="blue">
                        {weekData.totalExercises} exercises
                      </Badge>
                      <Badge size="xs" colorScheme="green">
                        {weekData.trainingDays} days
                      </Badge>
                    </VStack>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>

            {/* Week Detail Modal */}
            {selectedWeekForView && (
              <WeekDetailView
                weekNumber={selectedWeekForView.weekNumber}
                weekData={selectedWeekForView.weekData}
                onClose={() => setSelectedWeekForView(null)}
              />
            )}
          </VStack>
        </CardBody>
      </Card>
    )}
  </VStack>
);

// Step 6: Fine-Tune Programs
/// Step 6: Fine-tune Component - Isolated like Step 4
const renderStep6FineTune = () => {
  // Create a stable, isolated copy for editing
  const [editableProgram, setEditableProgram] = useState(generatedProgram);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);

  // Only sync when generatedProgram actually changes (not on every render)
  useEffect(() => {
    if (Object.keys(generatedProgram.weeks || {}).length > 0) {
      setEditableProgram(generatedProgram);
    }
  }, [generatedProgram.generatedAt]); // Only sync when program is regenerated

  // Apply changes back to main state only when user is done
  const handleApplyChanges = () => {
    setGeneratedProgram(editableProgram);
  };

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="md" mb={4} color="teal.600">
          Fine-tune & Finalize Program
        </Heading>
        <Text color="gray.600" mb={6}>
          Review and make final adjustments to your generated program before saving it to your library.
        </Text>
      </Box>

      <ProgramFineTunerIsolated
        key="program-fine-tuner-isolated-stable"
        editableProgram={editableProgram}
        onUpdate={setEditableProgram}
        trainingStructure={trainingStructure}
        programOverview={programOverview}
        selectedWeek={selectedWeek}
        selectedDay={selectedDay}
        onWeekChange={setSelectedWeek}
        onDayChange={setSelectedDay}
        onApplyChanges={handleApplyChanges}
      />
    </VStack>
  );
};

// Isolated Fine Tuner - Completely separate from main state
const ProgramFineTunerIsolated = memo(({
  editableProgram,
  onUpdate,
  trainingStructure,
  programOverview,
  selectedWeek,
  selectedDay,
  onWeekChange,
  onDayChange,
  onApplyChanges,
}) => {
  const [dayExercises, setDayExercises] = useState([]);

  console.log('ProgramFineTunerIsolated called', Date.now());

  // Get exercises for current selected day
  const getExercisesForDay = (week, day) => {
    return editableProgram.weeks?.[week]?.exercises?.filter(ex => ex.day === day) || [];
  };

  // Update exercise - ONLY affects local editableProgram
  const updateExercise = (index, field, value) => {
    const updated = [...dayExercises];
    updated[index] = { ...updated[index], [field]: value };
    setDayExercises(updated);

    // Update the editable program (isolated from main state)
    const newProgram = { ...editableProgram };
    const weekExercises = newProgram.weeks[selectedWeek].exercises;
    const dayExercisesInWeek = weekExercises.filter(ex => ex.day === selectedDay);
    
    if (dayExercisesInWeek[index]) {
      const globalIndex = weekExercises.indexOf(dayExercisesInWeek[index]);
      weekExercises[globalIndex] = {
        ...weekExercises[globalIndex],
        [field]: value
      };
    }
    
    onUpdate(newProgram);
  };

  // Add exercise - ONLY affects local editableProgram
  const addExercise = () => {
    const newExercise = {
      exercise: "",
      target_sets: 3,
      target_reps: 10,
      target_weight_kg: null,
      target_rpe: 7,
      target_rest: 60,
      load_prescription_p1rm: null,
      focus: programOverview.Focus,
      superset: "",
      exercise_program_note: "",
      day: selectedDay,
      week: selectedWeek,
      exercise_id: `week${selectedWeek}_day${selectedDay}_new_${Date.now()}`
    };

    const updatedExercises = [...dayExercises, newExercise];
    setDayExercises(updatedExercises);

    // Update the editable program (isolated from main state)
    const newProgram = { ...editableProgram };
    if (!newProgram.weeks[selectedWeek]) {
      newProgram.weeks[selectedWeek] = { exercises: [] };
    }
    newProgram.weeks[selectedWeek].exercises.push(newExercise);
    
    onUpdate(newProgram);
  };

  // Handle exercise selection
  const handleExerciseSelect = (index, exerciseData) => {
    const updated = [...dayExercises];
    updated[index] = {
      ...updated[index],
      exercise: exerciseData.Exercise,
      exerciseDetails: exerciseData,
      focus: exerciseData.Target_Muscle_Group || updated[index].focus,
    };
    setDayExercises(updated);

    // Update the editable program (isolated from main state)
    const newProgram = { ...editableProgram };
    const weekExercises = newProgram.weeks[selectedWeek].exercises;
    const dayExercisesInWeek = weekExercises.filter(ex => ex.day === selectedDay);
    
    if (dayExercisesInWeek[index]) {
      const globalIndex = weekExercises.indexOf(dayExercisesInWeek[index]);
      weekExercises[globalIndex] = {
        ...weekExercises[globalIndex],
        exercise: exerciseData.Exercise,
        exerciseDetails: exerciseData,
        focus: exerciseData.Target_Muscle_Group || weekExercises[globalIndex].focus,
      };
    }
    
    onUpdate(newProgram);
  };

  // Remove exercise
  const removeExercise = (index) => {
    const updated = dayExercises.filter((_, i) => i !== index);
    setDayExercises(updated);

    // Update the editable program (isolated from main state)
    const newProgram = { ...editableProgram };
    const weekExercises = newProgram.weeks[selectedWeek].exercises;
    const dayExercisesInWeek = weekExercises.filter(ex => ex.day === selectedDay);
    
    if (dayExercisesInWeek[index]) {
      const exerciseToRemove = dayExercisesInWeek[index];
      newProgram.weeks[selectedWeek].exercises = weekExercises.filter(ex => ex !== exerciseToRemove);
    }
    
    onUpdate(newProgram);
  };

  // Update dayExercises when selection changes
  useEffect(() => {
    setDayExercises(getExercisesForDay(selectedWeek, selectedDay));
  }, [selectedWeek, selectedDay, editableProgram]);

  // Check if program is generated
  if (!editableProgram.weeks || Object.keys(editableProgram.weeks).length === 0) {
    return (
      <Card>
        <CardBody>
          <Alert status="warning">
            <AlertIcon />
            <Text>Please generate your program in Step 5 before proceeding to fine-tuning.</Text>
          </Alert>
        </CardBody>
      </Card>
    );
  }

  const isDeloadWeek = (weekNum) => {
    return editableProgram.weeks?.[weekNum]?.isDeload || false;
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Program Status */}
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="sm" color="teal.500">Program Status</Heading>
            <HStack>
              <Badge colorScheme="green" size="lg">Ready to Edit</Badge>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={onApplyChanges}
              >
                Apply Changes
              </Button>
            </HStack>
          </HStack>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Stat>
              <StatLabel>Program Name</StatLabel>
              <StatNumber fontSize="md">{programOverview.Program_Name}</StatNumber>
              <StatHelpText>Ready for final review</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Total Duration</StatLabel>
              <StatNumber>{Object.keys(editableProgram.weeks || {}).length} weeks</StatNumber>
              <StatHelpText>Including deload weeks</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Total Exercises</StatLabel>
              <StatNumber>
                {Object.values(editableProgram.weeks || {}).reduce((total, week) => {
                  return total + (week.exercises?.length || 0);
                }, 0)}
              </StatNumber>
              <StatHelpText>Across all weeks</StatHelpText>
            </Stat>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Week and Day Selection */}
      <Card>
        <CardHeader>
          <Heading size="sm" color="teal.500">Select Week & Day to Edit</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            {/* Week Selection */}
            <Box>
              <HStack mb={2}>
                <Text fontWeight="semibold">Week:</Text>
                {Object.keys(editableProgram.weeks || {}).map((weekNum) => (
                  <Button
                    key={weekNum}
                    size="sm"
                    colorScheme={selectedWeek === parseInt(weekNum) ? "teal" : "gray"}
                    variant={selectedWeek === parseInt(weekNum) ? "solid" : "outline"}
                    onClick={() => onWeekChange(parseInt(weekNum))}
                  >
                    Week {weekNum}
                    {isDeloadWeek(weekNum) && <Text fontSize="xs" ml={1}>(D)</Text>}
                  </Button>
                ))}
              </HStack>
            </Box>

            {/* Day Selection */}
            <Box>
              <HStack mb={4}>
                <Text fontWeight="semibold">Training Day:</Text>
                {Array.from(
                  { length: trainingStructure.daysPerWeek || 3 },
                  (_, i) => i + 1
                ).map((day) => (
                  <Button
                    key={day}
                    size="sm"
                    colorScheme={selectedDay === day ? "teal" : "gray"}
                    variant={selectedDay === day ? "solid" : "outline"}
                    onClick={() => onDayChange(day)}
                  >
                    Day {day} - {getTrainingDayLabel(trainingStructure.type, day - 1)}
                  </Button>
                ))}
              </HStack>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Exercise Editor */}
      <Card>
        <CardHeader>
          <VStack align="start" spacing={1}>
            <Heading size="sm">
              Week {selectedWeek}, Day {selectedDay} - {getTrainingDayLabel(trainingStructure.type, selectedDay - 1)}
            </Heading>
            {isDeloadWeek(selectedWeek) && (
              <Badge colorScheme="orange">Deload Week</Badge>
            )}
          </VStack>
        </CardHeader>
        <CardBody>
          <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
            <Flex justify="space-between" align="center" mb={4}>
              <Text fontWeight="semibold">Day {selectedDay} Exercises</Text>
              <Button
                leftIcon={<AddIcon />}
                size="sm"
                colorScheme="teal"
                onClick={addExercise}
              >
                Add Exercise
              </Button>
            </Flex>

            {dayExercises.length === 0 ? (
              <Box textAlign="center" py={8} bg="gray.50" borderRadius="md">
                <Text color="gray.500" mb={2}>
                  No exercises for Day {selectedDay} in Week {selectedWeek}
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Click "Add Exercise" to get started
                </Text>
              </Box>
            ) : (
              <VStack spacing={4} align="stretch">
                {dayExercises.map((exercise, index) => (
                  <Box
                    key={`week${selectedWeek}-day${selectedDay}-exercise${index}-isolated`}
                    p={4}
                    bg="gray.50"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <Grid
                      templateColumns="repeat(auto-fit, minmax(200px, 1fr))"
                      gap={3}
                      mb={3}
                    >
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="semibold">
                          Exercise *
                        </FormLabel>
                        <ExerciseSearchInput
                          key={`exercise-search-${selectedWeek}-${selectedDay}-${index}-isolated`}
                          currentValue={exercise.exercise}
                          onSelectExercise={(exerciseData) =>
                            handleExerciseSelect(index, exerciseData)
                          }
                        />
                      </FormControl>

                      {/* Sets - Using Step 4's exact approach */}
                      <FormControl>
                        <FormLabel fontSize="sm">Sets</FormLabel>
                        <NumberInput
                          size="sm"
                          defaultValue={exercise.target_sets}
                          min={1}
                          max={10}
                        >
                          <NumberInputField
                            onBlur={(e) =>
                              updateExercise(
                                index,
                                "target_sets",
                                parseInt(e.target.value) || 3
                              )
                            }
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>

                      {/* Reps - Using Step 4's exact approach */}
                      <FormControl>
                        <FormLabel fontSize="sm">Reps</FormLabel>
                        <NumberInput
                          size="sm"
                          defaultValue={exercise.target_reps}
                          min={1}
                          max={50}
                        >
                          <NumberInputField
                            onBlur={(e) =>
                              updateExercise(
                                index,
                                "target_reps",
                                parseInt(e.target.value) || 10
                              )
                            }
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </Grid>

                    <Grid
                      templateColumns="repeat(auto-fit, minmax(150px, 1fr))"
                      gap={3}
                      mb={3}
                    >
                      {/* Weight - Using Step 4's exact approach */}
                      <FormControl>
                        <FormLabel fontSize="sm">Weight (kg)</FormLabel>
                        <NumberInput
                          size="sm"
                          defaultValue={exercise.target_weight_kg || ""}
                          min={0}
                          precision={2}
                          step={0.25}
                        >
                          <NumberInputField
                            onBlur={(e) =>
                              updateExercise(
                                index,
                                "target_weight_kg",
                                parseFloat(e.target.value) || null
                              )
                            }
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>

                      {/* RPE - Using Step 4's exact approach */}
                      <FormControl>
                        <FormLabel fontSize="sm">RPE</FormLabel>
                        <NumberInput
                          size="sm"
                          defaultValue={exercise.target_rpe}
                          min={1}
                          max={10}
                          step={0.5}
                        >
                          <NumberInputField
                            onBlur={(e) =>
                              updateExercise(
                                index,
                                "target_rpe",
                                parseFloat(e.target.value) || 7
                              )
                            }
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>

                      {/* Rest - Using Step 4's exact approach */}
                      <FormControl>
                        <FormLabel fontSize="sm">Rest (seconds)</FormLabel>
                        <NumberInput
                          size="sm"
                          defaultValue={exercise.target_rest}
                          min={15}
                          max={600}
                          step={15}
                        >
                          <NumberInputField
                            onBlur={(e) =>
                              updateExercise(
                                index,
                                "target_rest",
                                parseInt(e.target.value) || 60
                              )
                            }
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>

                      {/* Superset - Using Step 4's exact approach */}
                      <FormControl>
                        <FormLabel fontSize="sm">Superset</FormLabel>
                        <Input
                          key={`superset-${selectedWeek}-${selectedDay}-${index}-isolated`}
                          size="sm"
                          defaultValue={exercise.superset || ""}
                          onBlur={(e) =>
                            updateExercise(index, "superset", e.target.value)
                          }
                          placeholder="e.g., A1, A2, B1..."
                        />
                      </FormControl>
                    </Grid>

                    {/* Show progression note if exists */}
                    {exercise.week_progression_note && (
                      <Box bg="blue.50" p={3} borderRadius="md" mb={3}>
                        <Text fontSize="sm" color="blue.700">
                          📈 {exercise.week_progression_note}
                        </Text>
                      </Box>
                    )}

                    <Flex justify="space-between" align="center" mt={3}>
                      <FormControl width="300px">
                        <FormLabel fontSize="sm">Exercise Notes</FormLabel>
                        <Input
                          key={`program-notes-${selectedWeek}-${selectedDay}-${index}-isolated`}
                          size="sm"
                          defaultValue={exercise.exercise_program_note || ""}
                          onBlur={(e) =>
                            updateExercise(
                              index,
                              "exercise_program_note",
                              e.target.value
                            )
                          }
                          placeholder="Optional notes..."
                        />
                      </FormControl>

                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => removeExercise(index)}
                        aria-label="Remove exercise"
                      />
                    </Flex>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        </CardBody>
      </Card>

      {/* Save Program */}
      <Card>
        <CardHeader>
          <Heading size="sm" color="teal.500">Save Program</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="center" pt={4} spacing={4}>
              <Button
                variant="outline"
                leftIcon={<DownloadIcon />}
                onClick={handleExportProgram}
              >
                Export Program
              </Button>
              <Button
                colorScheme="teal"
                size="lg"
                leftIcon={<CheckIcon />}
                onClick={() => {
                  onApplyChanges(); // Apply changes first
                  handleSaveProgram(); // Then save
                }}
                isLoading={loading}
                loadingText="Saving..."
              >
                Save to Library
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
});

ProgramFineTunerIsolated.displayName = 'ProgramFineTunerIsolated';

  // Program Creation Wizard Component
  const ProgramCreationWizard = () => {
    const renderStepContent = (step) => {
      switch (step) {
        case 0:
          return renderStep1Goals();
        case 1:
          return renderStep2Structure();
        case 2:
          return renderStep3Progression();
        case 3:
          return renderStep4WeekOne();
        case 4:
          return renderStep5Generate();
        case 5:
          return renderStep6FineTune();
        default:
          return renderStep1Goals();
      }
    };

    const nextStep = () => {
      if (programCreationStep < steps.length - 1) {
        setProgramCreationStep(programCreationStep + 1);
        setActiveStep(programCreationStep + 1);
      }
    };

    const prevStep = () => {
      if (programCreationStep > 0) {
        setProgramCreationStep(programCreationStep - 1);
        setActiveStep(programCreationStep - 1);
      }
    };

    const canProceed = () => {
      switch (programCreationStep) {
        case 0:
          return (
            programOverview.Program_Name &&
            programOverview.Level &&
            programOverview.Focus &&
            typeof programOverview.Program_Length_in_Weeks === 'number'
          );
        case 1:
          return trainingStructure.type;
        case 2:
          return progressionRules.type;
        case 3:
          return Object.keys(weekOneTemplate).length > 0;
        case 4:
          return Object.keys(generatedProgram).length > 0;
        case 5:
          return true;
        default:
          return false;
      }
    };

    return (
      <Box>
        <Stepper index={activeStep} mb={8} colorScheme="teal" >
                 {steps.map((step, index) => (
            <Step key={index}>
              <StepIndicator>
                <StepStatus
                  complete={<StepIcon />}
                  incomplete={<StepNumber />}
                  active={<StepNumber />}
                />
              </StepIndicator>
              <Box flexShrink="0">
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </Box>
              <StepSeparator />
            </Step>
          ))}
        </Stepper>

        <Box minH="500px">{renderStepContent(programCreationStep)}</Box>

        <Flex justify="space-between" mt={8}>
          <Button
            onClick={prevStep}
            isDisabled={programCreationStep === 0}
            variant="outline"
          >
            Previous
          </Button>

          <HStack>
            <Text fontSize="sm" color="gray.600">
              Step {programCreationStep + 1} of {steps.length}
            </Text>
          </HStack>

          {programCreationStep === steps.length - 1 ? (
            <Button
              colorScheme="green"
              onClick={saveCompleteProgram}
              isLoading={loading}
              loadingText="Saving..."
            >
              Save Program
            </Button>
          ) : (
            <Button
              colorScheme="teal"
              onClick={nextStep}
              isDisabled={!canProceed()}
            >
              Next
            </Button>
          )}
        </Flex>
      </Box>
    );
  };
// Save complete program to database
// Save complete program to database
const saveCompleteProgram = async () => {
  try {
    setLoading(true);
    setError(null);

    console.log("🚀 Starting program save...");
    console.log("Generated Program:", generatedProgram);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("You must be logged in to save programs");
    }

    const userId = session.user.id;
    
    // Generate a unique Program_ID
    const programId = `program_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log("Generated Program_ID:", programId);

    // Save program overview first
    const { data: savedProgram, error: overviewError } = await supabase
      .from("program_overview")
      .insert({
        Program_ID: programId,
        Program_Name: programOverview.Program_Name,
        Created: new Date().toISOString(),
        Program_Description: programOverview.Program_Description,
        Level: programOverview.Level,
        Focus: programOverview.Focus,
        Key_Training_Focus: programOverview.Key_Training_Focus,
        Nutrition_Recovery: programOverview.Nutrition_Recovery,
        Training_Mix_Frequency: programOverview.Training_Mix_Frequency,
        Key_Adaptations: programOverview.Key_Adaptations,
        Key_Assessments: programOverview.Key_Assessments,
        Key_Assessment_Goals: programOverview.Key_Assessment_Goals,
        Program_Macro_Cycle: programOverview.Program_Macro_Cycle,
        Weeks: programOverview.Weeks,
        Prefered_Season: programOverview.Prefered_Season,
        Program_Length_in_Weeks: programOverview.Program_Length_in_Weeks,
        Days_Per_Week: programOverview.Days_Per_Week,
        Time_Per_Workout: programOverview.Time_Per_Workout,
        Equipment: programOverview.Equipment,
        MUSCLE_ENGAGEMENT: programOverview.MUSCLE_ENGAGEMENT,
        Deload_Week: progressionRules.deloadFrequency?.toString() || "4",
        Progression: JSON.stringify(progressionRules),
        user_id: userId,
      })
      .select()
      .single();

    if (overviewError) {
      console.error("Error saving program overview:", overviewError);
      throw overviewError;
    }

    console.log("✅ Program overview saved:", savedProgram);

    // Get the current table schema to check exact column names
    console.log("🔍 Checking current table schema...");
    const { data: schemaCheck, error: schemaError } = await supabase
      .from("program_library")
      .select("*")
      .limit(1);
    
    if (schemaCheck && schemaCheck.length > 0) {
      console.log("📋 Current table columns:", Object.keys(schemaCheck[0]));
    }

    // Save all exercises
    const allExercises = [];

    Object.values(generatedProgram.weeks || {}).forEach((weekData) => {
      (weekData.exercises || []).forEach((exercise) => {
        // Only include exercises that have a name
        if (exercise.exercise && exercise.exercise.trim() !== "") {
          // Create exercise object with corrected column names
          const exerciseData = {
            // Don't include 'id' - let database auto-generate it
            program_name: programOverview.Program_Name,
            program_macro_cycle: programOverview.Program_Macro_Cycle || "",
            week: exercise.week || 1,
            day: exercise.day || 1,
            focus: exercise.focus || programOverview.Focus || "",
            exercise: exercise.exercise,
            exercise_program_note: exercise.exercise_program_note || "",
            superset: exercise.superset || "",
            target_sets: exercise.target_sets || 3,
            target_reps: exercise.target_reps || 10,
            target_rpe: exercise.target_rpe || 7,
            target_rest: exercise.target_rest || 60,
            target_tempo: exercise.target_tempo || "",
            target_time_distance: exercise.target_time_distance || "",
            program_id: programId,
            target_weight_kg: exercise.target_weight_kg || null,
            // Fixed: use lowercase for this field based on error message
            load_prescription_p1rm: exercise.load_prescription_p1rm || null,
            user_id: userId,
          };
          
          allExercises.push(exerciseData);
        }
      });
    });

    console.log("📝 Exercises to save:", allExercises.length);
    console.log("📝 Sample exercise data:", allExercises[0]);

    if (allExercises.length > 0) {
      // Use simple insert without upsert or conflict resolution
      const { data: insertedExercises, error: exerciseError } = await supabase
        .from("program_library")
        .insert(allExercises)
        .select();

      if (exerciseError) {
        console.error("❌ Exercise insert failed:", exerciseError);
        console.error("❌ Sample exercise data:", allExercises[0]);
        
        // Let's try to understand the exact schema issue
        if (schemaCheck && schemaCheck.length > 0) {
          const sampleRecord = schemaCheck[0];
          console.log("📋 Database record sample:", sampleRecord);
          console.log("📋 Our data keys:", Object.keys(allExercises[0]));
          console.log("📋 Database keys:", Object.keys(sampleRecord));
          
          // Find mismatched keys
          const ourKeys = Object.keys(allExercises[0]);
          const dbKeys = Object.keys(sampleRecord);
          const missingInDb = ourKeys.filter(key => !dbKeys.includes(key));
          const extraInDb = dbKeys.filter(key => !ourKeys.includes(key));
          
          console.log("❌ Keys we have but DB doesn't:", missingInDb);
          console.log("ℹ️ Keys DB has but we don't:", extraInDb);
        }
        
        throw exerciseError;
      }

      console.log("✅ All exercises saved successfully");
      console.log("✅ Inserted exercises:", insertedExercises?.length || 0);
    } else {
      console.warn("⚠️ No exercises to save");
    }

    setSuccessMessage(
      `Program "${programOverview.Program_Name}" saved successfully with ${allExercises.length} exercises!`
    );

    resetProgramCreation();
    onProgramModalClose();
    await fetchPrograms();

  } catch (err) {
    console.error("Error saving complete program:", err);
    setError(err.message || "Failed to save program");
  } finally {
    setLoading(false);
  }
};


  // Reset program creation state
  const resetProgramCreation = () => {
    setProgramCreationStep(0);
    setActiveStep(0);
    setProgramOverview({
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
      Program_Length_in_Weeks: null,
      Days_Per_Week: "",
      Time_Per_Workout: "",
      Equipment: "",
      MUSCLE_ENGAGEMENT: "",
      Deload_Week: "",
      Progression: "",
      user_id: null,
    });
    setTrainingStructure({
      type: "",
      daysPerWeek: 3,
      sessionsPerDay: 1,
      customStructure: {},
    });
    setProgressionRules({
      type: "linear",
      weightProgression: 2.5,
      repProgression: 1,
      percentageIncrease: 2.5,
      deloadFrequency: 4,
      deloadPercentage: 80,
      blockLength: 4,
      wavePattern: [75, 80, 85, 90],
      autoGenerate: true,
    });
    setWeekOneTemplate({});
    setGeneratedProgram({});
    setFineTuning({
      modifiedWeeks: {},
      customExercises: {},
    });
  };

  // Start creating new program
  const startCreatingProgram = () => {
    setEditingProgram(null);
    setIsCreatingProgram(true);
    resetProgramCreation();
    onProgramModalOpen();
  };

  // Group exercises by week and day for display
  const groupExercisesByWeekAndDay = (exercises) => {
    const grouped = {};
    exercises.forEach((exercise) => {
      const key = `Week ${exercise.week}, Day ${exercise.day}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(exercise);
    });
    return grouped;
  };

  // Navigate back to Dashboard
  const goBackToDashboard = () => {
    navigate("/");
  };

  // Delete program
  const deleteProgram = async (programId) => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("You must be logged in to delete a program");
        return;
      }

      // Delete exercises first
      const { error: exerciseError } = await supabase
        .from("program_library")
        .delete()
        .eq("program_id", programId);

      if (exerciseError) throw exerciseError;

      // Delete program overview
      const { error: overviewError } = await supabase
        .from("program_overview")
        .delete()
        .eq("Program_ID", programId);

      if (overviewError) throw overviewError;

      setSuccessMessage("Program deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);

      onDeleteModalClose();
      await fetchPrograms();
    } catch (err) {
      console.error("Error deleting program:", err);
      setError(err.message || "Failed to delete program");
    } finally {
      setLoading(false);
    }
  };

  // Unenroll from program
  const unenrollFromProgram = async (programId) => {
    try {
      setEnrolling(programId);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("You must be logged in to unenroll from a program");
        return;
      }

      const { error } = await supabase
        .from("user_programs")
        .delete()
        .eq("user_id", session.user.id)
        .eq("program_id", programId);

      if (error) throw error;

      setSuccessMessage("Successfully unenrolled from program!");
      setTimeout(() => setSuccessMessage(null), 3000);

      await fetchUserEnrollments();
    } catch (err) {
      console.error("Error unenrolling from program:", err);
      setError(err.message || "Failed to unenroll from program");
    } finally {
      setEnrolling(null);
    }
  };

  // Export program data
  const exportProgramData = (program) => {
    const csvData = program.exercises.map((exercise) => ({
      Program: program.Program_Name,
      Week: exercise.week,
      Day: exercise.day,
      Exercise: exercise.exercise,
      Sets: exercise.target_sets,
      Reps: exercise.target_reps,
      Weight: exercise.target_weight_kg,
      RPE: exercise.target_rpe,
      Rest: exercise.target_rest,
      Focus: exercise.focus,
      Load_1RM: exercise.load_prescription_p1rm,
    }));

    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Program,Week,Day,Exercise,Sets,Reps,Weight,RPE,Rest,Focus,Load_1RM\n" +
      csvData.map((row) => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${program.Program_Name.replace(/\s+/g, "_")}_program.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Main render function
  return (
    <Box p={4} maxW="100%" bg="gray.50" minH="100vh">
      {/* Header */}
      <Flex align="center" justify="space-between" mb={6}>
        <Flex align="center">
          <IconButton
            icon={<ArrowBackIcon />}
            colorScheme="teal"
            size="md"
            onClick={goBackToDashboard}
            aria-label="Back to Dashboard"
            mr={3}
          />
          <Heading size="lg">Workout Programs</Heading>
        </Flex>

        <HStack spacing={3}>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="teal"
            onClick={startCreatingProgram}
            size="md"
          >
            Create Program
          </Button>
          <Button
            leftIcon={<CalendarIcon />}
            variant="outline"
            onClick={onEnrollmentModalOpen}
            size="md"
          >
            My Programs
          </Button>
        </HStack>
      </Flex>

      {/* Error and Success Messages */}
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
          <CloseButton
            position="absolute"
            right="8px"
            top="8px"
            onClick={() => setError(null)}
          />
        </Alert>
      )}

      {successMessage && (
        <Alert status="success" mb={4}>
          <AlertIcon />
          {successMessage}
        </Alert>
      )}

      {/* Search and Filters */}
      <Box mb={6} p={4} bg="white" borderRadius="lg" boxShadow="sm">
        <Heading size="md" mb={4}>
          Search & Filter Programs
        </Heading>

        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(5, 1fr)",
          }}
          gap={4}
        >
          <FormControl>
            <FormLabel fontSize="sm">Search Programs</FormLabel>
            <Input
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="md"
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm">Level</FormLabel>
            <Select
              placeholder="All Levels"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              size="md"
            >
              {uniqueLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm">Focus</FormLabel>
            <Select
              placeholder="All Focus Areas"
              value={focusFilter}
              onChange={(e) => setFocusFilter(e.target.value)}
              size="md"
            >
              {WORKOUT_FOCUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm">Duration</FormLabel>
            <Select
              placeholder="All Durations"
              value={weeksFilter}
              onChange={(e) => setWeeksFilter(e.target.value)}
              size="md"
            >
              <option value="short">Short (1-4 weeks)</option>
              <option value="medium">Medium (5-12 weeks)</option>
              <option value="long">Long (13+ weeks)</option>
            </Select>
          </FormControl>

          <Flex align="end">
            <Button
              onClick={clearFilters}
              variant="outline"
              size="md"
              width="full"
            >
              Clear Filters
            </Button>
          </Flex>
        </Grid>

        <Text fontSize="sm" color="gray.600" mt={3}>
          Showing {filteredPrograms.length} of {programs.length} programs
        </Text>
      </Box>

      {/* Quick Stats */}
      {programs.length > 0 && (
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
          <Stat bg="white" p={4} borderRadius="md" boxShadow="sm">
            <StatLabel>Total Programs</StatLabel>
            <StatNumber color="teal.500">{programs.length}</StatNumber>
            <StatHelpText>Available programs</StatHelpText>
          </Stat>
          <Stat bg="white" p={4} borderRadius="md" boxShadow="sm">
            <StatLabel>My Enrollments</StatLabel>
            <StatNumber color="blue.500">{userEnrollments.length}</StatNumber>
            <StatHelpText>Programs enrolled</StatHelpText>
          </Stat>
          <Stat bg="white" p={4} borderRadius="md" boxShadow="sm">
            <StatLabel>Total Exercises</StatLabel>
            <StatNumber color="purple.500">
              {programs.reduce((sum, p) => sum + (p.exercises?.length || 0), 0)}
            </StatNumber>
            <StatHelpText>Across all programs</StatHelpText>
          </Stat>
          <Stat bg="white" p={4} borderRadius="md" boxShadow="sm">
            <StatLabel>Avg Duration</StatLabel>
            <StatNumber color="orange.500">
              {programs.length > 0
                ? Math.round(
                    programs.reduce(
                      (sum, p) => sum + (parseInt(p.Weeks) || 0),
                      0
                    ) / programs.length
                  )
                : 0}{" "}
              weeks
            </StatNumber>
            <StatHelpText>Program length</StatHelpText>
          </Stat>
        </SimpleGrid>
      )}

      {/* Programs Grid */}
      {filteredPrograms.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text fontSize="lg" color="gray.500" mb={4}>
            {programs.length === 0
              ? "No workout programs available."
              : "No programs match your search criteria."}
          </Text>
          {programs.length === 0 && (
            <Button
              leftIcon={<AddIcon />}
              colorScheme="teal"
              onClick={startCreatingProgram}
            >
              Create Your First Program
            </Button>
          )}
        </Box>
      ) : (
        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          }}
          gap={6}
        >
          {filteredPrograms.map((program) => {
            const stats = getProgramStats(program);
            const isEnrolled = isUserEnrolled(program.Program_ID);

            return (
              <Card
                key={program.Program_ID}
                overflow="hidden"
                variant="elevated"
                _hover={{
                  boxShadow: "xl",
                  transform: "translateY(-4px)",
                  borderColor: "teal.200",
                }}
                transition="all 0.3s ease"
                borderWidth="1px"
                borderColor="gray.200"
              >
                {/* Program Header */}
                <CardHeader
                  bg={isEnrolled ? "teal.500" : "gradient-to-r"}
                  bgGradient={
                    !isEnrolled ? "linear(to-r, teal.500, blue.500)" : undefined
                  }
                  color="white"
                  position="relative"
                >
                  <Flex justify="space-between" align="start">
                    <Box flex="1">
                      <Heading size="md" mb={2} noOfLines={2}>
                        {program.Program_Name}
                      </Heading>
                      <HStack spacing={2} mb={2}>
                        <Badge
                          colorScheme="whiteAlpha"
                          variant="solid"
                          fontSize="xs"
                        >
                          {program.Level}
                        </Badge>
                        <Badge
                          colorScheme="whiteAlpha"
                          variant="solid"
                          fontSize="xs"
                        >
                          {program.Weeks} weeks
                        </Badge>
                        {isEnrolled && (
                          <Badge
                            colorScheme="yellow"
                            variant="solid"
                            fontSize="xs"
                          >
                            <StarIcon w={2} h={2} mr={1} />
                            Enrolled
                          </Badge>
                        )}
                      </HStack>
                    </Box>

                    <HStack spacing={1}>
                      <IconButton
                        icon={<EditIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme="whiteAlpha"
                        onClick={() => {
                          setEditingProgram(program);
                          // Load program data into wizard
                          setProgramOverview({
                            Program_Name: program.Program_Name || "",
                            Program_Description:
                              program.Program_Description || "",
                            Level: program.Level || "",
                            Focus: program.Focus || "",
                            Key_Training_Focus:
                              program.Key_Training_Focus || "",
                            Nutrition_Recovery:
                              program.Nutrition_Recovery || "",
                            Training_Mix_Frequency:
                              program.Training_Mix_Frequency || "",
                            Key_Adaptations: program.Key_Adaptations || "",
                            Key_Assessments: program.Key_Assessments || "",
                            Key_Assessment_Goals:
                              program.Key_Assessment_Goals || "",
                            Program_Macro_Cycle:
                              program.Program_Macro_Cycle || "",
                            Weeks: program.Weeks || "",
                            Prefered_Season: program.Prefered_Season || "",
                            Program_Length_in_Weeks:
                              program.Program_Length_in_Weeks,
                            Days_Per_Week: program.Days_Per_Week || "",
                            Time_Per_Workout: program.Time_Per_Workout || "",
                            Equipment: program.Equipment || "",
                            MUSCLE_ENGAGEMENT: program.MUSCLE_ENGAGEMENT || "",
                            Deload_Week: program.Deload_Week || "",
                            Progression: program.Progression || "",
                            user_id: program.user_id,
                          });
                          onProgramModalOpen();
                        }}
                        aria-label="Edit program"
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme="whiteAlpha"
                        onClick={() => {
                          setSelectedProgram(program);
                          onDeleteModalOpen();
                        }}
                        aria-label="Delete program"
                      />
                    </HStack>
                  </Flex>
                </CardHeader>

                {/* Program Body */}
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {/* Program Details */}
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={2}>
                        <strong>Focus:</strong>{" "}
                        <Badge
                          colorScheme={getFocusColorScheme(
                            getFocusType(program.Focus)
                          )}
                          variant="subtle"
                        >
                          {program.Focus || "Mixed"}
                        </Badge>
                      </Text>

                      {program.Program_Description && (
                        <ProgramDescriptionDisplay 
                        description={program.Program_Description} 
                        programName={program.Program_Name}
                      />
                      )}
                    </Box>

                    {/* Program Statistics */}
                    <SimpleGrid columns={2} spacing={3}>
                      <Stat size="sm">
                        <StatLabel fontSize="xs">Total Exercises</StatLabel>
                        <StatNumber fontSize="lg" color="teal.500">
                          {stats.totalExercises}
                        </StatNumber>
                      </Stat>
                      <Stat size="sm">
                        <StatLabel fontSize="xs">Training Days</StatLabel>
                        <StatNumber fontSize="lg" color="blue.500">
                          {stats.uniqueDays}
                        </StatNumber>
                      </Stat>
                    </SimpleGrid>

                    <Divider />

                    {/* Action Buttons */}
                    <VStack spacing={3}>
                      {isEnrolled ? (
                        <Button
                          colorScheme="red"
                          variant="outline"
                          size="md"
                          width="full"
                          onClick={() =>
                            unenrollFromProgram(program.Program_ID)
                          }
                          isLoading={enrolling === program.Program_ID}
                          loadingText="Unenrolling..."
                          leftIcon={<StarIcon />}
                        >
                          Unenroll from Program
                        </Button>
                      ) : (
                        <Button
                          colorScheme="teal"
                          size="md"
                          width="full"
                          onClick={() => enrollInProgram(program.Program_ID)}
                          isLoading={enrolling === program.Program_ID}
                          loadingText="Enrolling..."
                          leftIcon={<StarIcon />}
                        >
                          Enroll in Program
                        </Button>
                      )}

                      <HStack spacing={2} width="full">
                        <Button
                          variant="outline"
                          size="sm"
                          flex="1"
                          onClick={() =>
                            setExpandedProgram(
                              expandedProgram === program.Program_ID
                                ? null
                                : program.Program_ID
                            )
                          }
                          leftIcon={<InfoIcon />}
                        >
                          {expandedProgram === program.Program_ID
                            ? "Hide Details"
                            : "View Details"}
                        </Button>

                        <IconButton
                          icon={<DownloadIcon />}
                          size="sm"
                          variant="outline"
                          onClick={() => exportProgramData(program)}
                          aria-label="Export program"
                        />
                      </HStack>
                    </VStack>

                    {/* Expanded Program Details */}
                    {expandedProgram === program.Program_ID && (
                      <Box
                        mt={4}
                        pt={4}
                        borderTop="1px solid"
                        borderColor="gray.200"
                      >
                        <Heading size="sm" mb={4} color="teal.600">
                          Program Schedule
                        </Heading>

                        {program.exercises && program.exercises.length > 0 ? (
                          <Accordion allowMultiple>
                            {Object.entries(
                              groupExercisesByWeekAndDay(program.exercises)
                            ).map(([weekDay, exercises], index) => (
                              <AccordionItem
                                key={index}
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                                mb={2}
                              >
                                <AccordionButton _hover={{ bg: "gray.50" }}>
                                  <Box flex="1" textAlign="left">
                                    <Text
                                      fontWeight="semibold"
                                      color="gray.700"
                                    >
                                      {weekDay}
                                    </Text>
                                    <Text fontSize="sm" color="gray.500">
                                      {exercises.length} exercises •{" "}
                                      {exercises.reduce(
                                        (sum, ex) =>
                                          sum + (parseInt(ex.target_sets) || 0),
                                        0
                                      )}{" "}
                                      total sets
                                    </Text>
                                  </Box>
                                  <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel pb={4} bg="gray.50">
                                  {isMobile ? (
                                    // Mobile view - Card layout
                                    <VStack spacing={3} align="stretch">
                                      {exercises.map(
                                        (exercise, exerciseIndex) => (
                                          <Box
                                            key={`${exercise.exercise}-${exercise.week}-${exercise.day}`}
                                            p={3}
                                            bg="white"
                                            borderRadius="md"
                                            boxShadow="sm"
                                          >
                                            <Text fontWeight="bold" mb={3}>
                                              {exercise.exercise}
                                            </Text>

                                            <SimpleGrid
                                              columns={2}
                                              spacing={2}
                                              fontSize="sm"
                                            >
                                              <Text>
                                                <strong>Sets:</strong>{" "}
                                                {exercise.target_sets || "N/A"}
                                              </Text>
                                              <Text>
                                                <strong>Reps:</strong>{" "}
                                                {exercise.target_reps || "N/A"}
                                              </Text>
                                              <Text>
                                                <strong>Weight:</strong>{" "}
                                                {exercise.target_weight_kg ||
                                                  "N/A"}{" "}
                                                kg
                                              </Text>
                                              <Text>
                                                <strong>RPE:</strong>{" "}
                                                {exercise.target_rpe || "N/A"}
                                              </Text>
                                              <Text>
                                                <strong>Rest:</strong>{" "}
                                                {exercise.target_rest || "N/A"}s
                                              </Text>
                                              <Text>
                                                <strong>Load %:</strong>{" "}
                                                {exercise.load_prescription_p1rm ||
                                                  "N/A"}
                                                %
                                              </Text>
                                            </SimpleGrid>

                                            <Box mt={3}>
                                              <Text fontSize="sm">
                                                <strong>Focus:</strong>{" "}
                                                <Badge
                                                  colorScheme={getFocusColorScheme(
                                                    getFocusType(exercise.focus)
                                                  )}
                                                  variant="subtle"
                                                >
                                                  {exercise.focus ||
                                                    "Not specified"}
                                                </Badge>
                                              </Text>
                                            </Box>
                                          </Box>
                                        )
                                      )}
                                    </VStack>
                                  ) : (
                                    // Desktop view - Table layout
                                    <Box overflowX="auto">
                                      <Table size="sm" variant="simple">
                                        <Thead>
                                          <Tr>
                                            <Th>Exercise</Th>
                                            <Th>Sets</Th>
                                            <Th>Reps</Th>
                                            <Th>Weight (kg)</Th>
                                            <Th>RPE</Th>
                                            <Th>Rest (s)</Th>
                                            <Th>Load %</Th>
                                            <Th>Focus</Th>
                                          </Tr>
                                        </Thead>
                                        <Tbody>
                                          {exercises.map(
                                            (exercise, exerciseIndex) => (
                                              <Tr
                                                key={`${exercise.exercise}-${exercise.week}-${exercise.day}`}
                                              >
                                                <Td
                                                  fontWeight="medium"
                                                  maxW="200px"
                                                >
                                                  <Text noOfLines={2}>
                                                    {exercise.exercise}
                                                  </Text>
                                                </Td>
                                                <Td>
                                                  {exercise.target_sets ||
                                                    "N/A"}
                                                </Td>
                                                <Td>
                                                  {exercise.target_reps ||
                                                    "N/A"}
                                                </Td>
                                                <Td>
                                                  {exercise.target_weight_kg ||
                                                    "N/A"}
                                                </Td>
                                                <Td>
                                                  {exercise.target_rpe || "N/A"}
                                                </Td>
                                                <Td>
                                                  {exercise.target_rest ||
                                                    "N/A"}
                                                </Td>
                                                <Td>
                                                  {exercise.load_prescription_p1rm ||
                                                    "N/A"}
                                                  %
                                                </Td>
                                                <Td>
                                                  <Badge
                                                    colorScheme={getFocusColorScheme(
                                                      getFocusType(
                                                        exercise.focus
                                                      )
                                                    )}
                                                    variant="subtle"
                                                    size="sm"
                                                  >
                                                    {exercise.focus || "N/A"}
                                                  </Badge>
                                                </Td>
                                              </Tr>
                                            )
                                          )}
                                        </Tbody>
                                      </Table>
                                    </Box>
                                  )}
                                </AccordionPanel>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        ) : (
                          <Box
                            textAlign="center"
                            py={6}
                            bg="gray.50"
                            borderRadius="md"
                          >
                            <Text color="gray.500" mb={3}>
                              No exercises found for this program.
                            </Text>
                          </Box>
                        )}
                      </Box>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            );
          })}
        </Grid>
      )}

      {/* Program Creation Modal */}
      <Modal 
      data-focus-lock-disabled="true"
        isOpen={isProgramModalOpen}
        trapFocus={false}
        onClose={onProgramModalClose}
        size="6xl"
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent /*trapFocus={false} data-focus-lock-disabled="true"*/ maxH="90vh" overflowY="auto">
          <ModalHeader>
            {editingProgram ? "Edit Program" : "Create New Program"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ProgramCreationWizard />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Program</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to delete the program "
              {selectedProgram?.Program_Name}"? This action cannot be undone and
              will remove all associated exercises.
            </Text>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button
                colorScheme="red"
                onClick={() => deleteProgram(selectedProgram?.Program_ID)}
                isLoading={loading}
                loadingText="Deleting..."
              >
                Delete Program
              </Button>
              <Button variant="outline" onClick={onDeleteModalClose}>
                Cancel
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* User Enrollments Modal */}
      <Modal
        isOpen={isEnrollmentModalOpen}
        onClose={onEnrollmentModalClose}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>My Enrolled Programs</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {loadingEnrollments ? (
              <Flex justify="center" py={8}>
                <Spinner size="lg" color="teal.500" />
              </Flex>
            ) : userEnrollments.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Text color="gray.500" mb={4}>
                  You are not enrolled in any programs yet.
                </Text>
                <Button
                  colorScheme="teal"
                  onClick={() => {
                    onEnrollmentModalClose();
                  }}
                >
                  Browse Programs
                </Button>
              </Box>
            ) : (
              <VStack spacing={4} align="stretch">
                {userEnrollments.map((enrollment) => (
                  <Box
                    key={enrollment.program_id}
                    p={4}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    bg="gray.50"
                  >
                    <Flex justify="space-between" align="start">
                      <Box flex="1">
                        <Text fontWeight="bold" mb={1}>
                          {enrollment.program_overview?.Program_Name}
                        </Text>
                        <HStack spacing={2} mb={2}>
                          <Badge colorScheme="teal" variant="subtle">
                            {enrollment.program_overview?.Level}
                          </Badge>
                          <Badge colorScheme="blue" variant="subtle">
                            {enrollment.program_overview?.Weeks} weeks
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          Enrolled:{" "}
                          {new Date(
                            enrollment.enrolled_at
                          ).toLocaleDateString()}
                        </Text>
                      </Box>
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        onClick={() =>
                          unenrollFromProgram(enrollment.program_id)
                        }
                        isLoading={enrolling === enrollment.program_id}
                      >
                        Unenroll
                      </Button>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onEnrollmentModalClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default WorkoutPrograms;
