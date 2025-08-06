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

// Constants for workout focus options
const WORKOUT_FOCUS_OPTIONS = [
  { value: "strength", label: "Strength" },
  { value: "hypertrophy", label: "Hypertrophy" },
  { value: "power", label: "Power" },
  { value: "endurance", label: "Endurance" },
  { value: "general", label: "General Fitness" },
  { value: "cardio", label: "Cardio" },
  { value: "mobility", label: "Mobility" },
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
const handleGenerateProgram = async () => {
  try {
    setLoading(true);
    
    // Generate program logic here
    const generatedWeeks = {};
    const totalWeeks = programOverview.Program_Length_in_Weeks || 4;
    
    for (let week = 1; week <= totalWeeks; week++) {
      const isDeload = week % (progressionRules.deloadFrequency || 4) === 0;
      generatedWeeks[week] = {
        isDeload,
        exercises: generateWeekExercises(week, isDeload),
      };
    }
    
    setGeneratedProgram({
      weeks: generatedWeeks,
      includeDeloads: true,
      autoAdjustRPE: true,
      includeNotes: true,
    });
    
    setSuccessMessage('Program generated successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  } catch (error) {
    setError('Failed to generate program: ' + error.message);
  } finally {
    setLoading(false);
  }
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
  const weeks = Object.keys(generatedProgram.weeks || {}).length;
  return weeks * (trainingStructure.daysPerWeek || 3);
};

const getTotalExercisesGenerated = () => {
  const weeks = Object.keys(generatedProgram.weeks || {}).length;
  const exercisesPerWeek = getTotalExercisesInTemplate();
  return weeks * exercisesPerWeek;
};

const getDeloadWeeksCount = () => {
  return Object.values(generatedProgram.weeks || {}).filter(week => week.isDeload).length;
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
    load_prescription_p1RM: null,
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
  return Object.keys(weekOneTemplate).length;
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
    percentageIncrease: 2.5, // % increase per week
    deloadFrequency: 4, // every 4th week
    deloadPercentage: 80, // 80% of previous week
    blockLength: 4, // weeks per block
    wavePattern: [75, 80, 85, 90], // % 1RM pattern
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
    load_prescription_p1RM: null,
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
              program_library_id,
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
              load_prescription_p1RM,
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
    if (focusLower.includes("endurance")) return "endurance";
    if (focusLower.includes("cardio")) return "cardio";
    if (focusLower.includes("mobility")) return "mobility";
    return "general";
  };

  const getFocusColorScheme = (focusType) => {
    const schemes = {
      power: "red",
      strength: "pink",
      hypertrophy: "green",
      endurance: "yellow",
      cardio: "orange",
      mobility: "purple",
      general: "blue",
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
      {trainingStructure.daysPerWeek && (
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
      )}
    </VStack>
  );
};
  // Step 3: Progression Rules Component
  const renderStep3Progression = () => (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="md" mb={4} color="teal.600">
          Progression Rules & Strategy
        </Heading>
        <Text color="gray.600" mb={6}>
          Define how your program will progress over time to ensure continuous adaptation and improvement.
        </Text>
      </Box>
  
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <FormControl isRequired>
          <FormLabel>Progression Type</FormLabel>
          <Select
            value={progressionRules.type}
            onChange={(e) =>
              setProgressionRules((prev) => ({
                ...prev,
                type: e.target.value,
              }))
            }
            placeholder="Select progression method"
          >
            {PROGRESSION_TYPES.map((progression) => (
              <option key={progression.value} value={progression.value}>
                {progression.label}
              </option>
            ))}
          </Select>
          {progressionRules.type && (
            <Text fontSize="sm" color="gray.600" mt={2}>
              {PROGRESSION_TYPES.find(p => p.value === progressionRules.type)?.description}
            </Text>
          )}
        </FormControl>
  
        <FormControl>
          <FormLabel>Auto-Generate Progression</FormLabel>
          <Switch
            isChecked={progressionRules.autoGenerate}
            onChange={(e) =>
              setProgressionRules((prev) => ({
                ...prev,
                autoGenerate: e.target.checked,
              }))
            }
            colorScheme="teal"
          />
          <Text fontSize="sm" color="gray.500" mt={1}>
            Automatically calculate progression based on your rules
          </Text>
        </FormControl>
      </SimpleGrid>
  
      {/* Linear Progression Settings */}
      {progressionRules.type === 'linear' && (
        <Card>
          <CardHeader>
            <Heading size="sm" color="teal.500">Linear Progression Settings</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Weight Progression (kg per week)</FormLabel>
                <NumberInput
                  value={progressionRules.weightProgression || ""}
                  onChange={(valueString, valueNumber) =>
                    setProgressionRules(prev => ({
                      ...prev,
                      weightProgression: Number.isNaN(valueNumber) ? 2.5 : valueNumber,
                    }))
                  }
                  min={0.5}
                  max={10}
                  step={0.5}
                >
                  <NumberInputField placeholder="2.5" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Typical range: 1.25-5kg per week
                </Text>
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>
      )}
  
      {/* Double Progression Settings */}
      {progressionRules.type === 'double' && (
        <Card>
          <CardHeader>
            <Heading size="sm" color="teal.500">Double Progression Settings</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Rep Progression (per week)</FormLabel>
                <NumberInput
                  value={progressionRules.repProgression || ""}
                  onChange={(valueString, valueNumber) =>
                    setProgressionRules(prev => ({
                      ...prev,
                      repProgression: Number.isNaN(valueNumber) ? 1 : valueNumber,
                    }))
                  }
                  min={1}
                  max={5}
                >
                  <NumberInputField placeholder="1" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
  
              <FormControl>
                <FormLabel>Weight Increase (kg)</FormLabel>
                <NumberInput
                  value={progressionRules.weightProgression || ""}
                  onChange={(valueString, valueNumber) =>
                    setProgressionRules(prev => ({
                      ...prev,
                      weightProgression: Number.isNaN(valueNumber) ? 2.5 : valueNumber,
                    }))
                  }
                  min={0.5}
                  max={10}
                  step={0.5}
                >
                  <NumberInputField placeholder="2.5" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Weight added when rep target is reached
                </Text>
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>
      )}
  
      {/* Percentage-based Settings */}
      {progressionRules.type === 'percentage' && (
        <Card>
          <CardHeader>
            <Heading size="sm" color="teal.500">Percentage-based Progression</Heading>
          </CardHeader>
          <CardBody>
            <FormControl>
              <FormLabel>Weekly Percentage Increase (%)</FormLabel>
              <NumberInput
                value={progressionRules.percentageIncrease || ""}
                onChange={(valueString, valueNumber) =>
                  setProgressionRules(prev => ({
                    ...prev,
                    percentageIncrease: Number.isNaN(valueNumber) ? 2.5 : valueNumber,
                  }))
                }
                min={1}
                max={10}
                step={0.5}
              >
                <NumberInputField placeholder="2.5" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Percentage increase in training load per week
              </Text>
            </FormControl>
          </CardBody>
        </Card>
      )}
  
      {/* Block Periodization Settings */}
      {progressionRules.type === 'block' && (
        <Card>
          <CardHeader>
            <Heading size="sm" color="teal.500">Block Periodization Settings</Heading>
          </CardHeader>
          <CardBody>
            <FormControl>
              <FormLabel>Block Length (weeks)</FormLabel>
              <NumberInput
                value={progressionRules.blockLength || ""}
                onChange={(valueString, valueNumber) =>
                  setProgressionRules(prev => ({
                    ...prev,
                    blockLength: Number.isNaN(valueNumber) ? 4 : valueNumber,
                  }))
                }
                min={2}
                max={8}
              >
                <NumberInputField placeholder="4" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Length of each training block
              </Text>
            </FormControl>
          </CardBody>
        </Card>
      )}
  
      {/* Wave Loading Settings */}
      {progressionRules.type === 'wave' && (
        <Card>
          <CardHeader>
            <Heading size="sm" color="teal.500">Wave Loading Pattern</Heading>
          </CardHeader>
          <CardBody>
            <FormControl>
              <FormLabel>Intensity Pattern (% 1RM)</FormLabel>
              <HStack spacing={2}>
                {progressionRules.wavePattern.map((percentage, index) => (
                  <NumberInput
                    key={index}
                    value={percentage}
                    onChange={(valueString, valueNumber) => {
                      const newPattern = [...progressionRules.wavePattern];
                      newPattern[index] = Number.isNaN(valueNumber) ? 75 : valueNumber;
                      setProgressionRules(prev => ({
                        ...prev,
                        wavePattern: newPattern,
                      }));
                    }}
                    min={50}
                    max={100}
                    size="sm"
                    width="80px"
                  >
                    <NumberInputField />
                  </NumberInput>
                ))}
              </HStack>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Weekly intensity pattern (Week 1, 2, 3, 4)
              </Text>
            </FormControl>
          </CardBody>
        </Card>
      )}
  
      {/* Deload Settings */}
      <Card>
        <CardHeader>
          <Heading size="sm" color="orange.500">Deload & Recovery Settings</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel>Deload Frequency (weeks)</FormLabel>
              <NumberInput
                value={progressionRules.deloadFrequency || ""}
                onChange={(valueString, valueNumber) =>
                  setProgressionRules(prev => ({
                    ...prev,
                    deloadFrequency: Number.isNaN(valueNumber) ? 4 : valueNumber,
                  }))
                }
                min={3}
                max={8}
              >
                <NumberInputField placeholder="4" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text fontSize="sm" color="gray.500" mt={1}>
                How often to include a deload week
              </Text>
            </FormControl>
  
            <FormControl>
              <FormLabel>Deload Intensity (%)</FormLabel>
              <NumberInput
                value={progressionRules.deloadPercentage || ""}
                onChange={(valueString, valueNumber) =>
                  setProgressionRules(prev => ({
                    ...prev,
                    deloadPercentage: Number.isNaN(valueNumber) ? 80 : valueNumber,
                  }))
                }
                min={60}
                max={90}
              >
                <NumberInputField placeholder="80" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Percentage of normal training load during deload
              </Text>
            </FormControl>
          </SimpleGrid>
        </CardBody>
      </Card>
  
      {/* Progression Preview */}
      {progressionRules.type && (
        <Card>
          <CardHeader>
            <Heading size="sm" color="teal.500">Progression Preview</Heading>
          </CardHeader>
          <CardBody>
            <Text fontSize="sm" color="gray.600" mb={3}>
              Based on your settings, here's how progression might look:
            </Text>
            
            {progressionRules.type === 'linear' && (
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                {[1, 2, 3, 4].map(week => (
                  <Box key={week} p={3} bg="teal.50" borderRadius="md" textAlign="center">
                    <Text fontWeight="bold" fontSize="sm">Week {week}</Text>
                    <Text fontSize="xs" color="gray.600">
                      +{(week - 1) * (progressionRules.weightProgression || 2.5)}kg
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            )}
  
            {progressionRules.type === 'wave' && (
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                {progressionRules.wavePattern.map((intensity, index) => (
                  <Box key={index} p={3} bg="blue.50" borderRadius="md" textAlign="center">
                    <Text fontWeight="bold" fontSize="sm">Week {index + 1}</Text>
                    <Text fontSize="xs" color="gray.600">{intensity}% 1RM</Text>
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </CardBody>
        </Card>
      )}
    </VStack>
  );

  // Step 4: Week 1 Template Component - Fixed with stable keys and proper focus handling
 // Step 4: Week 1 Template Component - Fixed with proper focus handling
// Step 4: Week 1 Template Component - With stable props
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

// Week Template Editor Component - Fixed with focus-friendly inputs
// Week Template Editor Component - Memoized to prevent unnecessary re-renders
// Week Template Editor Component - Complete with focus-friendly NumberInputs
const WeekTemplateEditor = memo(({
  weekData,
  weekNumber,
  trainingStructure,
  onUpdate,
  selectedDay,
  onSelectedDayChange,
}) => {
  const [dayExercises, setDayExercises] = useState([]);

  console.log('WeekTemplateEditor called', Date.now());

  const addExercise = () => {
    const newExercise = {
      exercise: "",
      target_sets: 3,
      target_reps: 10,
      target_weight_kg: null,
      target_rpe: 7,
      target_rest: 60,
      load_prescription_p1RM: null,
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

  const updateExercise = (index, field, value) => {
    const updated = [...dayExercises];
    updated[index] = { ...updated[index], [field]: value };
    setDayExercises(updated);

    const updatedWeek = {
      ...weekData,
      [selectedDay]: updated,
    };
    onUpdate(updatedWeek);
  };

  const handleExerciseSelect = (index, exerciseData) => {
    const updated = [...dayExercises];
    updated[index] = {
      ...updated[index],
      exercise: exerciseData.Exercise,
      exerciseDetails: exerciseData,
      focus: exerciseData.Target_Muscle_Group || updated[index].focus,
    };
    setDayExercises(updated);

    const updatedWeek = {
      ...weekData,
      [selectedDay]: updated,
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
                  {/* Weight - Fixed with defaultValue + onBlur */}
                  <FormControl>
                    <FormLabel fontSize="sm">Weight (kg)</FormLabel>
                    <NumberInput
                      size="sm"
                      defaultValue={exercise.target_weight_kg || ""}
                      min={0}
                      precision={1}
                      step={0.5}
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

                  {/* Load % 1RM - Fixed with defaultValue + onBlur */}
                  <FormControl>
                    <FormLabel fontSize="sm">Load % 1RM</FormLabel>
                    <NumberInput
                      size="sm"
                      defaultValue={exercise.load_prescription_p1RM || ""}
                      min={30}
                      max={100}
                      precision={1}
                      step={2.5}
                    >
                      <NumberInputField
                        onBlur={(e) =>
                          updateExercise(
                            index,
                            "load_prescription_p1RM",
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
                          {exercise.exerciseDetails["1_RM_Alex"] && (
                            <Text>
                              <strong>1RM:</strong>{" "}
                              {exercise.exerciseDetails["1_RM_Alex"]}kg
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
      {Object.keys(generatedProgram).length > 0 && (
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
                <Text fontWeight="bold" mb={2}>Week-by-Week Overview</Text>
                <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={2}>
                  {Object.keys(generatedProgram.weeks || {}).map(weekNum => (
                    <Box
                      key={weekNum}
                      p={2}
                      bg={isDeloadWeek(weekNum) ? "orange.100" : "teal.50"}
                      borderRadius="md"
                      textAlign="center"
                    >
                      <Text fontWeight="bold" fontSize="sm">
                        Week {weekNum}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {isDeloadWeek(weekNum) ? "Deload" : "Training"}
                      </Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  );

  const renderStep6FineTune = () => (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="md" mb={4} color="teal.600">
          Fine-tune & Finalize Program
        </Heading>
        <Text color="gray.600" mb={6}>
          Review and make final adjustments to your generated program before saving it to your library.
        </Text>
      </Box>
  
      {/* Program Status */}
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="sm" color="teal.500">Program Status</Heading>
            <Badge 
              colorScheme={Object.keys(generatedProgram).length > 0 ? "green" : "yellow"}
              size="lg"
            >
              {Object.keys(generatedProgram).length > 0 ? "Ready to Save" : "Generate First"}
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody>
          {Object.keys(generatedProgram).length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Stat>
                <StatLabel>Program Name</StatLabel>
                <StatNumber fontSize="md">{programOverview.Program_Name}</StatNumber>
                <StatHelpText>Ready for final review</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Total Duration</StatLabel>
                <StatNumber>{Object.keys(generatedProgram.weeks || {}).length} weeks</StatNumber>
                <StatHelpText>Including deload weeks</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Modifications</StatLabel>
                <StatNumber>{Object.keys(fineTuning.modifiedWeeks || {}).length}</StatNumber>
                <StatHelpText>Custom adjustments made</StatHelpText>
              </Stat>
            </SimpleGrid>
          ) : (
            <Alert status="warning">
              <AlertIcon />
              <Text>Please generate your program in Step 5 before proceeding to fine-tuning.</Text>
            </Alert>
          )}
        </CardBody>
      </Card>
  
      {/* Fine-tuning Options */}
      {Object.keys(generatedProgram).length > 0 && (
        <>
          {/* Week Selection for Modification */}
          <Card>
            <CardHeader>
              <Heading size="sm" color="teal.500">Select Week to Modify</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Text fontSize="sm" color="gray.600">
                  Choose a week to make custom modifications to exercises, sets, reps, or weights.
                </Text>
                
                <SimpleGrid columns={{ base: 3, md: 6, lg: 8 }} spacing={2}>
                  {Object.keys(generatedProgram.weeks || {}).map(weekNum => (
                    <Button
                      key={weekNum}
                      size="sm"
                      variant={fineTuning.selectedWeek === weekNum ? "solid" : "outline"}
                      colorScheme={isDeloadWeek(weekNum) ? "orange" : "teal"}
                      onClick={() => setFineTuning(prev => ({
                        ...prev,
                        selectedWeek: weekNum,
                      }))}
                    >
                      Week {weekNum}
                      {isDeloadWeek(weekNum) && (
                        <Text fontSize="xs" ml={1}>(D)</Text>
                      )}
                    </Button>
                  ))}
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>
  
          {/* Week Modification Interface */}
          {fineTuning.selectedWeek && (
            <Card>
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="sm" color="teal.500">
                    Modify Week {fineTuning.selectedWeek}
                  </Heading>
                  <HStack>
                    {isDeloadWeek(fineTuning.selectedWeek) && (
                      <Badge colorScheme="orange">Deload Week</Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => resetWeekModifications(fineTuning.selectedWeek)}
                    >
                      Reset Week
                    </Button>
                  </HStack>
                </HStack>
              </CardHeader>
              <CardBody>
                <Tabs variant="enclosed" size="sm">
                  <TabList>
                    {Array.from({ length: trainingStructure.daysPerWeek || 3 }, (_, index) => (
                      <Tab key={index}>
                        Day {index + 1}
                      </Tab>
                    ))}
                  </TabList>
  
                  <TabPanels>
                    {Array.from({ length: trainingStructure.daysPerWeek || 3 }, (_, dayIndex) => (
                      <TabPanel key={dayIndex}>
                        <VStack spacing={3} align="stretch">
                          <Text fontWeight="bold" fontSize="sm">
                            Day {dayIndex + 1} - Week {fineTuning.selectedWeek}
                          </Text>
                          
                          {getExercisesForWeekDay(fineTuning.selectedWeek, dayIndex + 1).map((exercise, exerciseIndex) => (
                            <Card key={exerciseIndex} variant="outline" size="sm">
                              <CardBody>
                                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={3}>
                                  <FormControl>
                                    <FormLabel fontSize="xs">Exercise</FormLabel>
                                    <Text fontSize="sm" fontWeight="medium">
                                      {exercise.exercise}
                                    </Text>
                                  </FormControl>
  
                                  <FormControl>
                                    <FormLabel fontSize="xs">Sets</FormLabel>
                                    <NumberInput
                                      value={getModifiedValue(fineTuning.selectedWeek, dayIndex + 1, exerciseIndex, 'target_sets') || exercise.target_sets}
                                      onChange={(valueString, valueNumber) =>
                                        updateWeekModification(fineTuning.selectedWeek, dayIndex + 1, exerciseIndex, 'target_sets', valueNumber)
                                      }
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
                                    <FormLabel fontSize="xs">Reps</FormLabel>
                                    <Input
                                      value={getModifiedValue(fineTuning.selectedWeek, dayIndex + 1, exerciseIndex, 'target_reps') || exercise.target_reps}
                                      onChange={(e) =>
                                        updateWeekModification(fineTuning.selectedWeek, dayIndex + 1, exerciseIndex, 'target_reps', e.target.value)
                                      }
                                      size="sm"
                                    />
                                  </FormControl>
  
                                  <FormControl>
                                    <FormLabel fontSize="xs">Weight (kg)</FormLabel>
                                    <NumberInput
                                      value={getModifiedValue(fineTuning.selectedWeek, dayIndex + 1, exerciseIndex, 'target_weight_kg') || exercise.target_weight_kg || ''}
                                      onChange={(valueString, valueNumber) =>
                                        updateWeekModification(fineTuning.selectedWeek, dayIndex + 1, exerciseIndex, 'target_weight_kg', valueNumber)
                                      }
                                      min={0}
                                      step={2.5}
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
  
                                {/* Exercise Notes */}
                                <FormControl mt={3}>
                                  <FormLabel fontSize="xs">Custom Notes for This Week</FormLabel>
                                  <Textarea
                                    value={getModifiedValue(fineTuning.selectedWeek, dayIndex + 1, exerciseIndex, 'week_note') || ''}
                                    onChange={(e) =>
                                      updateWeekModification(fineTuning.selectedWeek, dayIndex + 1, exerciseIndex, 'week_note', e.target.value)
                                    }
                                    placeholder="Add specific notes for this week..."
                                    size="sm"
                                    rows={2}
                                  />
                                </FormControl>
                              </CardBody>
                            </Card>
                          ))}
                        </VStack>
                      </TabPanel>
                    ))}
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          )}
  
          {/* Final Program Actions */}
          <Card>
            <CardHeader>
              <Heading size="sm" color="teal.500">Save Program</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Text fontSize="sm" color="gray.600">
                  Your program is ready to be saved to your library. You can make further modifications after saving.
                </Text>
  
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Final Program Name</FormLabel>
                    <Input
                      value={programOverview.Program_Name}
                      onChange={(e) =>
                        setProgramOverview(prev => ({
                          ...prev,
                          Program_Name: e.target.value,
                        }))
                      }
                      placeholder="Enter final program name"
                    />
                  </FormControl>
  
                  <FormControl>
                    <FormLabel>Program Tags</FormLabel>
                    <Input
                      value={fineTuning.programTags || ''}
                      onChange={(e) =>
                        setFineTuning(prev => ({
                          ...prev,
                          programTags: e.target.value,
                        }))
                      }
                      placeholder="strength, hypertrophy, beginner"
                    />
                  </FormControl>
                </SimpleGrid>
  
                <FormControl>
                  <FormLabel>Final Program Notes</FormLabel>
                  <Textarea
                    value={fineTuning.finalNotes || ''}
                    onChange={(e) =>
                      setFineTuning(prev => ({
                        ...prev,
                        finalNotes: e.target.value,
                      }))
                    }
                    placeholder="Add any final notes about this program..."
                    rows={3}
                  />
                </FormControl>
  
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
                    onClick={handleSaveProgram}
                    isLoading={loading}
                    loadingText="Saving..."
                  >
                    Save to Library
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </>
      )}
    </VStack>
  );

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
  const saveCompleteProgram = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("You must be logged in to save programs");
        return;
      }

      const programId = editingProgram?.Program_ID || `program_${Date.now()}`;
      const userId = session.user.id;

      // Step 1: Save program overview
      const overviewData = {
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
        Deload_Week: progressionRules.deloadFrequency.toString(),
        Progression: JSON.stringify(progressionRules),
        user_id: userId,
      };

      const { error: overviewError } = await supabase
        .from("program_overview")
        .upsert(overviewData);

      if (overviewError) throw overviewError;

      // Step 2: Delete existing exercises if updating
      if (editingProgram) {
        const { error: deleteError } = await supabase
          .from("program_library")
          .delete()
          .eq("program_id", programId);

        if (deleteError) throw deleteError;
      }

      // Step 3: Save all exercises
      const allExercises = [];

      Object.keys(generatedProgram).forEach((week) => {
        Object.keys(generatedProgram[week]).forEach((day) => {
          generatedProgram[week][day].forEach((exercise) => {
            allExercises.push({
              program_name: programOverview.Program_Name,
              program_macro_cycle: programOverview.Program_Macro_Cycle || "",
              week: parseInt(week),
              day: parseInt(day),
              focus: exercise.focus || programOverview.Focus,
              exercise: exercise.exercise,
              exercise_program_note: exercise.exercise_program_note || "",
              superset: exercise.superset || "",
              target_sets: exercise.target_sets,
              target_reps: exercise.target_reps,
              target_rpe: exercise.target_rpe,
              target_rest: exercise.target_rest,
              target_tempo: exercise.target_tempo || "",
              target_time_distance: exercise.target_time_distance || "",
              program_id: programId,
              target_weight_kg: exercise.target_weight_kg,
              load_prescription_p1RM: exercise.load_prescription_p1RM,
              user_id: userId,
            });
          });
        });
      });

      if (allExercises.length > 0) {
        const { error: exerciseError } = await supabase
          .from("program_library")
          .insert(allExercises);

        if (exerciseError) throw exerciseError;
      }

      setSuccessMessage(
        `Program "${programOverview.Program_Name}" saved successfully with ${allExercises.length} exercises!`
      );

      // Reset and refresh
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
      Load_1RM: exercise.load_prescription_p1RM,
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
                        <Text
                          fontSize="sm"
                          color="gray.700"
                          noOfLines={3}
                          mb={3}
                        >
                          {program.Program_Description}
                        </Text>
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
                                                {exercise.load_prescription_p1RM ||
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
                                                  {exercise.load_prescription_p1RM ||
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
