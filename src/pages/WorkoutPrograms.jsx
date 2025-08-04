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

  // Step 2: Training Structure
  const [trainingStructure, setTrainingStructure] = useState({
    type: "",
    daysPerWeek: 3,
    sessionsPerDay: 1,
    customStructure: {},
  });

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
    { title: "Goals", description: "Define program goals and overview" },
    { title: "Structure", description: "Set up training structure" },
    { title: "Progression", description: "Define progression rules" },
    { title: "Week 1", description: "Create Week 1 template" },
    { title: "Generate", description: "Auto-generate program" },
    { title: "Fine-tune", description: "Adjust and finalize" },
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

    const handleInputFocus = () => {
      setShowResults(true);
      if (searchTerm.trim() && localFilteredExercises.length === 0) {
        performLocalSearch(searchTerm);
      }
    };

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
          onFocus={handleInputFocus}
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
  const renderStep1Goals = () => (
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
            value={programOverview.Program_Name}
            onChange={(e) =>
              setProgramOverview((prev) => ({
                ...prev,
                Program_Name: e.target.value,
              }))
            }
            placeholder="e.g., Strength Building Phase 1"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Training Level</FormLabel>
          <Select
            value={programOverview.Level}
            onChange={(e) =>
              setProgramOverview((prev) => ({ ...prev, Level: e.target.value }))
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
              setProgramOverview((prev) => ({ ...prev, Focus: e.target.value }))
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
            value={programOverview.Program_Length_in_Weeks || ""}
            onChange={(value) =>
              setProgramOverview((prev) => ({
                ...prev,
                Program_Length_in_Weeks: parseInt(value) || null,
                Weeks: value,
              }))
            }
            min={1}
            max={52}
          >
            <NumberInputField placeholder="Enter weeks" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
      </SimpleGrid>

      <FormControl>
        <FormLabel>Program Description</FormLabel>
        <Textarea
          value={programOverview.Program_Description}
          onChange={(e) =>
            setProgramOverview((prev) => ({
              ...prev,
              Program_Description: e.target.value,
            }))
          }
          placeholder="Describe the program's objectives, methodology, and target outcomes..."
          rows={4}
        />
      </FormControl>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <FormControl>
          <FormLabel>Days Per Week</FormLabel>
          <NumberInput
            value={programOverview.Days_Per_Week || ""}
            onChange={(value) =>
              setProgramOverview((prev) => ({ ...prev, Days_Per_Week: value }))
            }
            min={1}
            max={7}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel>Time Per Workout</FormLabel>
          <Input
            value={programOverview.Time_Per_Workout}
            onChange={(e) =>
              setProgramOverview((prev) => ({
                ...prev,
                Time_Per_Workout: e.target.value,
              }))
            }
            placeholder="e.g., 60-90 minutes"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Equipment Needed</FormLabel>
          <Input
            value={programOverview.Equipment}
            onChange={(e) =>
              setProgramOverview((prev) => ({
                ...prev,
                Equipment: e.target.value,
              }))
            }
            placeholder="e.g., Barbell, Dumbbells, Gym"
          />
        </FormControl>
      </SimpleGrid>

      <Accordion allowToggle>
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <Text fontWeight="semibold">Advanced Options</Text>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Key Training Focus</FormLabel>
                <Textarea
                  value={programOverview.Key_Training_Focus}
                  onChange={(e) =>
                    setProgramOverview((prev) => ({
                      ...prev,
                      Key_Training_Focus: e.target.value,
                    }))
                  }
                  placeholder="Specific training emphases..."
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Key Adaptations</FormLabel>
                <Textarea
                  value={programOverview.Key_Adaptations}
                  onChange={(e) =>
                    setProgramOverview((prev) => ({
                      ...prev,
                      Key_Adaptations: e.target.value,
                    }))
                  }
                  placeholder="Expected physiological adaptations..."
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Muscle Engagement</FormLabel>
                <Input
                  value={programOverview.MUSCLE_ENGAGEMENT}
                  onChange={(e) =>
                    setProgramOverview((prev) => ({
                      ...prev,
                      MUSCLE_ENGAGEMENT: e.target.value,
                    }))
                  }
                  placeholder="Primary muscle groups targeted"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Preferred Season</FormLabel>
                <Select
                  value={programOverview.Prefered_Season}
                  onChange={(e) =>
                    setProgramOverview((prev) => ({
                      ...prev,
                      Prefered_Season: e.target.value,
                    }))
                  }
                  placeholder="Select season"
                >
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                  <option value="Fall">Fall</option>
                  <option value="Winter">Winter</option>
                  <option value="Year-round">Year-round</option>
                </Select>
              </FormControl>
            </SimpleGrid>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </VStack>
  );

  // Step 2: Training Structure Component
  const renderStep2Structure = () => (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="md" mb={4} color="teal.600">
          Set Up Training Structure
        </Heading>
        <Text color="gray.600" mb={6}>
          Choose how you want to organize your training sessions throughout the
          week.
        </Text>
      </Box>

      <FormControl isRequired>
        <FormLabel>Training Structure Type</FormLabel>
        <RadioGroup
          value={trainingStructure.type}
          onChange={(value) =>
            setTrainingStructure((prev) => ({ ...prev, type: value }))
          }
        >
          <VStack align="start" spacing={3}>
            {TRAINING_STRUCTURES.map((structure) => (
              <Box
                key={structure.value}
                p={4}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                width="100%"
              >
                <Radio value={structure.value} mb={2}>
                  <Text fontWeight="semibold">{structure.label}</Text>
                </Radio>
                <Text fontSize="sm" color="gray.600" ml={6}>
                  {structure.description}
                </Text>
              </Box>
            ))}
          </VStack>
        </RadioGroup>
      </FormControl>

      {trainingStructure.type && (
        <Box p={4} bg="blue.50" borderRadius="md">
          <Text fontWeight="semibold" mb={2}>
            Structure Preview:
          </Text>
          {trainingStructure.type === "push_pull_legs" && (
            <VStack align="start" spacing={1}>
              <Text fontSize="sm">
                • Day 1: Push (Chest, Shoulders, Triceps)
              </Text>
              <Text fontSize="sm">• Day 2: Pull (Back, Biceps)</Text>
              <Text fontSize="sm">
                • Day 3: Legs (Quads, Hamstrings, Glutes, Calves)
              </Text>
            </VStack>
          )}
          {trainingStructure.type === "upper_lower" && (
            <VStack align="start" spacing={1}>
              <Text fontSize="sm">
                • Day 1: Upper Body (Chest, Back, Shoulders, Arms)
              </Text>
              <Text fontSize="sm">• Day 2: Lower Body (Legs, Glutes)</Text>
            </VStack>
          )}
          {trainingStructure.type === "full_body" && (
            <Text fontSize="sm">
              Each session targets all major muscle groups
            </Text>
          )}
        </Box>
      )}

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <FormControl>
          <FormLabel>Training Days Per Week</FormLabel>
          <NumberInput
            value={trainingStructure.daysPerWeek}
            onChange={(value) =>
              setTrainingStructure((prev) => ({
                ...prev,
                daysPerWeek: parseInt(value) || 3,
              }))
            }
            min={1}
            max={7}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel>Sessions Per Day</FormLabel>
          <NumberInput
            value={trainingStructure.sessionsPerDay}
            onChange={(value) =>
              setTrainingStructure((prev) => ({
                ...prev,
                sessionsPerDay: parseInt(value) || 1,
              }))
            }
            min={1}
            max={3}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
      </SimpleGrid>
    </VStack>
  );

  // Step 3: Progression Rules Component
  const renderStep3Progression = () => (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="md" mb={4} color="teal.600">
          Define Progression Rules
        </Heading>
        <Text color="gray.600" mb={6}>
          Set how your program will progress over time to ensure continuous
          adaptation.
        </Text>
      </Box>

      <FormControl isRequired>
        <FormLabel>Progression Type</FormLabel>
        <RadioGroup
          value={progressionRules.type}
          onChange={(value) =>
            setProgressionRules((prev) => ({ ...prev, type: value }))
          }
        >
          <VStack align="start" spacing={3}>
            {PROGRESSION_TYPES.map((progression) => (
              <Box
                key={progression.value}
                p={4}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                width="100%"
              >
                <Radio value={progression.value} mb={2}>
                  <Text fontWeight="semibold">{progression.label}</Text>
                </Radio>
                <Text fontSize="sm" color="gray.600" ml={6}>
                  {progression.description}
                </Text>
              </Box>
            ))}
          </VStack>
        </RadioGroup>
      </FormControl>

      {progressionRules.type && (
        <Box p={4} bg="green.50" borderRadius="md">
          <Text fontWeight="semibold" mb={4}>
            Progression Settings
          </Text>

          {progressionRules.type === "linear" && (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Weight Increase Per Week (kg)</FormLabel>
                <NumberInput
                  value={progressionRules.weightProgression}
                  onChange={(value) =>
                    setProgressionRules((prev) => ({
                      ...prev,
                      weightProgression: parseFloat(value) || 2.5,
                    }))
                  }
                  step={0.5}
                  min={0.5}
                  max={10}
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
          )}

          {progressionRules.type === "double" && (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Rep Increase Per Week</FormLabel>
                <NumberInput
                  value={progressionRules.repProgression}
                  onChange={(value) =>
                    setProgressionRules((prev) => ({
                      ...prev,
                      repProgression: parseInt(value) || 1,
                    }))
                  }
                  min={1}
                  max={5}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Weight Increase When Rep Target Hit (kg)</FormLabel>
                <NumberInput
                  value={progressionRules.weightProgression}
                  onChange={(value) =>
                    setProgressionRules((prev) => ({
                      ...prev,
                      weightProgression: parseFloat(value) || 2.5,
                    }))
                  }
                  step={0.5}
                  min={0.5}
                  max={10}
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
          )}

          {progressionRules.type === "percentage" && (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Percentage Increase Per Week (%)</FormLabel>
                <NumberInput
                  value={progressionRules.percentageIncrease}
                  onChange={(value) =>
                    setProgressionRules((prev) => ({
                      ...prev,
                      percentageIncrease: parseFloat(value) || 2.5,
                    }))
                  }
                  step={0.5}
                  min={0.5}
                  max={10}
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
          )}

          {progressionRules.type === "block" && (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Block Length (Weeks)</FormLabel>
                <NumberInput
                  value={progressionRules.blockLength}
                  onChange={(value) =>
                    setProgressionRules((prev) => ({
                      ...prev,
                      blockLength: parseInt(value) || 4,
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
            </SimpleGrid>
          )}

          {progressionRules.type === "wave" && (
            <FormControl>
              <FormLabel>Wave Pattern (% 1RM)</FormLabel>
              <HStack>
                {progressionRules.wavePattern.map((percentage, index) => (
                  <NumberInput
                    key={index}
                    value={percentage}
                    onChange={(value) => {
                      const newPattern = [...progressionRules.wavePattern];
                      newPattern[index] = parseInt(value) || 75;
                      setProgressionRules((prev) => ({
                        ...prev,
                        wavePattern: newPattern,
                      }));
                    }}
                    min={50}
                    max={100}
                    width="80px"
                  >
                    <NumberInputField />
                  </NumberInput>
                ))}
              </HStack>
              <Text fontSize="sm" color="gray.600" mt={2}>
                Week 1: {progressionRules.wavePattern[0]}%, Week 2:{" "}
                {progressionRules.wavePattern[1]}%, Week 3:{" "}
                {progressionRules.wavePattern[2]}%, Week 4:{" "}
                {progressionRules.wavePattern[3]}%
              </Text>
            </FormControl>
          )}

          <Divider my={4} />

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel>Deload Frequency (Every X Weeks)</FormLabel>
              <NumberInput
                value={progressionRules.deloadFrequency}
                onChange={(value) =>
                  setProgressionRules((prev) => ({
                    ...prev,
                    deloadFrequency: parseInt(value) || 4,
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
              <FormLabel>Deload Percentage (%)</FormLabel>
              <NumberInput
                value={progressionRules.deloadPercentage}
                onChange={(value) =>
                  setProgressionRules((prev) => ({
                    ...prev,
                    deloadPercentage: parseInt(value) || 80,
                  }))
                }
                min={60}
                max={90}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </SimpleGrid>

          <FormControl mt={4}>
            <HStack>
              <Switch
                isChecked={progressionRules.autoGenerate}
                onChange={(e) =>
                  setProgressionRules((prev) => ({
                    ...prev,
                    autoGenerate: e.target.checked,
                  }))
                }
              />
              <FormLabel mb={0}>
                Auto-generate progression for all weeks
              </FormLabel>
            </HStack>
            <Text fontSize="sm" color="gray.600" mt={1}>
              Automatically apply progression rules to generate the complete
              program
            </Text>
          </FormControl>
        </Box>
      )}
    </VStack>
  );

  // Step 4: Week 1 Template Component
  const renderStep4WeekOne = () => (
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
        weekData={weekOneTemplate}
        weekNumber={1}
        trainingStructure={trainingStructure}
        onUpdate={setWeekOneTemplate}
      />
    </VStack>
  );

  // Week Template Editor Component
  const WeekTemplateEditor = ({
    weekData,
    weekNumber,
    trainingStructure,
    onUpdate,
  }) => {
    const [selectedDay, setSelectedDay] = useState(1);
    const [dayExercises, setDayExercises] = useState([]);

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

      // Update parent state immediately
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

      // Update parent state
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
        // Auto-populate some fields based on exercise data
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
              onClick={() => setSelectedDay(day)}
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
                  key={index}
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
                        currentValue={exercise.exercise}
                        onSelectExercise={(exerciseData) =>
                          handleExerciseSelect(index, exerciseData)
                        }
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm">Sets</FormLabel>
                      <NumberInput
                        size="sm"
                        value={exercise.target_sets}
                        onChange={(value) =>
                          updateExercise(
                            index,
                            "target_sets",
                            parseInt(value) || 3
                          )
                        }
                        min={1}
                        max={10}
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
                        size="sm"
                        value={exercise.target_reps}
                        onChange={(value) =>
                          updateExercise(
                            index,
                            "target_reps",
                            parseInt(value) || 10
                          )
                        }
                        min={1}
                        max={50}
                      >
                        <NumberInputField />
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
                    <FormControl>
                      <FormLabel fontSize="sm">Weight (kg)</FormLabel>
                      <NumberInput
                        size="sm"
                        value={exercise.target_weight_kg || ""}
                        onChange={(value) =>
                          updateExercise(
                            index,
                            "target_weight_kg",
                            parseInt(value) || null
                          )
                        }
                        min={0}
                        precision={1}
                        step={0.5}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm">RPE</FormLabel>
                      <NumberInput
                        size="sm"
                        value={exercise.target_rpe}
                        onChange={(value) =>
                          updateExercise(
                            index,
                            "target_rpe",
                            parseInt(value) || 7
                          )
                        }
                        min={1}
                        max={10}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm">Rest (seconds)</FormLabel>
                      <NumberInput
                        size="sm"
                        value={exercise.target_rest}
                        onChange={(value) =>
                          updateExercise(
                            index,
                            "target_rest",
                            parseInt(value) || 60
                          )
                        }
                        min={30}
                        max={300}
                        step={15}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm">Load % 1RM</FormLabel>
                      <NumberInput
                        size="sm"
                        value={exercise.load_prescription_p1RM || ""}
                        onChange={(value) =>
                          updateExercise(
                            index,
                            "load_prescription_p1RM",
                            parseFloat(value) || null
                          )
                        }
                        min={30}
                        max={100}
                        precision={1}
                        step={2.5}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </Grid>

                  {/* Exercise Details Preview */}
                  {/* Exercise Details Preview - Enhanced with Video */}
                  {/* Exercise Details Preview - Enhanced with Video and Exercise_Notes */}
                  {/* Exercise Details Preview - Collapsible with Video and Exercise_Notes */}
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
                          {/* Video Demonstration - Show prominently if available */}
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

                          {/* Exercise Notes - Prioritize Exercise_Notes, fallback to In-Depth_Explanation */}
                          {(exercise.exerciseDetails.Exercise_Notes ||
                            exercise.exerciseDetails[
                              "In-Depth_Explanation"
                            ]) && (
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
                                    exercise.exerciseDetails[
                                      "In-Depth_Explanation"
                                    ]
                                )}
                              </Text>
                            </Box>
                          )}
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  )}

                  <Flex justify="space-between" align="center">
                    <FormControl width="200px">
                      <FormLabel fontSize="sm">
                        Exercise Notes (Program)
                      </FormLabel>
                      <Input
                        size="sm"
                        value={exercise.exercise_program_note || ""}
                        onChange={(e) =>
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
  };

  // Step 5: Auto-Generate Program Component
  const renderStep5Generate = () => {
    const generateProgram = () => {
      if (!weekOneTemplate || Object.keys(weekOneTemplate).length === 0) {
        setError(
          "Please create a Week 1 template before generating the program"
        );
        return;
      }

      const totalWeeks = programOverview.Program_Length_in_Weeks || 4;
      const generated = {};

      for (let week = 1; week <= totalWeeks; week++) {
        generated[week] = {};

        // Check if it's a deload week
        const isDeloadWeek = week % progressionRules.deloadFrequency === 0;

        Object.keys(weekOneTemplate).forEach((day) => {
          const dayNumber = parseInt(day);
          generated[week][dayNumber] = weekOneTemplate[day].map((exercise) => {
            const generatedExercise = { ...exercise };

            if (isDeloadWeek) {
              // Apply deload
              generatedExercise.target_weight_kg = exercise.target_weight_kg
                ? Math.round(
                    exercise.target_weight_kg *
                      (progressionRules.deloadPercentage / 100)
                  )
                : exercise.target_weight_kg;
              generatedExercise.target_rpe = Math.max(
                1,
                exercise.target_rpe - 2
              );
              generatedExercise.load_prescription_p1RM =
                exercise.load_prescription_p1RM
                  ? exercise.load_prescription_p1RM *
                    (progressionRules.deloadPercentage / 100)
                  : exercise.load_prescription_p1RM;
            } else {
              // Apply progression based on type
              switch (progressionRules.type) {
                case "linear":
                  generatedExercise.target_weight_kg = exercise.target_weight_kg
                    ? exercise.target_weight_kg +
                      progressionRules.weightProgression * (week - 1)
                    : exercise.target_weight_kg;
                  break;

                case "double":
                  // For double progression, increase reps first, then weight
                  const repIncrease = Math.min(
                    progressionRules.repProgression * (week - 1),
                    5
                  );
                  generatedExercise.target_reps =
                    exercise.target_reps + repIncrease;

                  if (repIncrease >= 5) {
                    generatedExercise.target_weight_kg =
                      exercise.target_weight_kg
                        ? exercise.target_weight_kg +
                          progressionRules.weightProgression
                        : exercise.target_weight_kg;
                    generatedExercise.target_reps = exercise.target_reps; // Reset reps
                  }
                  break;

                case "percentage":
                  const percentageMultiplier =
                    1 +
                    (progressionRules.percentageIncrease / 100) * (week - 1);
                  generatedExercise.target_weight_kg = exercise.target_weight_kg
                    ? Math.round(
                        exercise.target_weight_kg * percentageMultiplier
                      )
                    : exercise.target_weight_kg;
                  generatedExercise.load_prescription_p1RM =
                    exercise.load_prescription_p1RM
                      ? Math.min(
                          100,
                          exercise.load_prescription_p1RM * percentageMultiplier
                        )
                      : exercise.load_prescription_p1RM;
                  break;

                case "wave":
                  const waveIndex =
                    (week - 1) % progressionRules.wavePattern.length;
                  const wavePercentage =
                    progressionRules.wavePattern[waveIndex];
                  generatedExercise.load_prescription_p1RM = wavePercentage;
                  break;

                case "block":
                  const blockNumber = Math.ceil(
                    week / progressionRules.blockLength
                  );
                  const blockMultiplier = 1 + 0.05 * (blockNumber - 1); // 5% increase per block
                  generatedExercise.target_weight_kg = exercise.target_weight_kg
                    ? Math.round(exercise.target_weight_kg * blockMultiplier)
                    : exercise.target_weight_kg;
                  break;

                default:
                  break;
              }
            }

            return generatedExercise;
          });
        });
      }

      setGeneratedProgram(generated);
      setSuccessMessage("Program generated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    };

    return (
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="md" mb={4} color="teal.600">
            Auto-Generate Complete Program
          </Heading>
          <Text color="gray.600" mb={6}>
            Generate the complete program based on your Week 1 template and
            progression rules.
          </Text>
        </Box>

        <Box p={4} bg="blue.50" borderRadius="md">
          <Text fontWeight="semibold" mb={2}>
            Generation Preview:
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm">
                <strong>Total Weeks:</strong>{" "}
                {programOverview.Program_Length_in_Weeks}
              </Text>
              <Text fontSize="sm">
                <strong>Progression Type:</strong> {progressionRules.type}
              </Text>
              <Text fontSize="sm">
                <strong>Training Days:</strong> {trainingStructure.daysPerWeek}{" "}
                per week
              </Text>
            </VStack>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm">
                <strong>Deload Every:</strong>{" "}
                {progressionRules.deloadFrequency} weeks
              </Text>
              <Text fontSize="sm">
                <strong>Week 1 Exercises:</strong>{" "}
                {Object.values(weekOneTemplate).flat().length}
              </Text>
              <Text fontSize="sm">
                <strong>Total Exercises:</strong>{" "}
                {Object.values(weekOneTemplate).flat().length *
                  programOverview.Program_Length_in_Weeks}
              </Text>
            </VStack>
          </SimpleGrid>
        </Box>

        <Button
          colorScheme="teal"
          size="lg"
          onClick={generateProgram}
          isDisabled={
            !weekOneTemplate || Object.keys(weekOneTemplate).length === 0
          }
        >
          Generate Complete Program
        </Button>

        {Object.keys(generatedProgram).length > 0 && (
          <Box>
            <Text fontWeight="semibold" mb={4}>
              Generated Program Preview:
            </Text>
            <Accordion allowMultiple>
              {Object.entries(generatedProgram)
                .slice(0, 3)
                .map(([week, weekData]) => (
                  <AccordionItem key={week}>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        <Text fontWeight="semibold">Week {week}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {week % progressionRules.deloadFrequency === 0
                            ? "Deload Week"
                            : "Training Week"}
                        </Text>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      {Object.entries(weekData).map(([day, exercises]) => (
                        <Box key={day} mb={4}>
                          <Text fontWeight="semibold" mb={2}>
                            Day {day}:
                          </Text>
                          <VStack align="start" spacing={1}>
                            {exercises.map((exercise, idx) => (
                              <Text key={idx} fontSize="sm">
                                • {exercise.exercise || "Exercise"} -{" "}
                                {exercise.target_sets}x{exercise.target_reps}
                                {exercise.target_weight_kg &&
                                  ` @ ${exercise.target_weight_kg}kg`}
                                {exercise.target_rpe &&
                                  ` RPE ${exercise.target_rpe}`}
                              </Text>
                            ))}
                          </VStack>
                        </Box>
                      ))}
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              {Object.keys(generatedProgram).length > 3 && (
                <Text fontSize="sm" color="gray.600" textAlign="center" mt={2}>
                  ... and {Object.keys(generatedProgram).length - 3} more weeks
                </Text>
              )}
            </Accordion>
          </Box>
        )}
      </VStack>
    );
  };

  // Step 6: Fine-tuning Component
  const renderStep6FineTune = () => {
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [selectedDay, setSelectedDay] = useState(1);

    const updateGeneratedExercise = (
      week,
      day,
      exerciseIndex,
      field,
      value
    ) => {
      const updated = { ...generatedProgram };
      if (!updated[week]) updated[week] = {};
      if (!updated[week][day]) updated[week][day] = [];

      updated[week][day][exerciseIndex] = {
        ...updated[week][day][exerciseIndex],
        [field]: value,
      };

      setGeneratedProgram(updated);
    };

    const addCustomExercise = (week, day) => {
      const updated = { ...generatedProgram };
      if (!updated[week]) updated[week] = {};
      if (!updated[week][day]) updated[week][day] = [];

      updated[week][day].push({
        exercise: "",
        target_sets: 3,
        target_reps: 10,
        target_weight_kg: null,
        target_rpe: 7,
        target_rest: 60,
        load_prescription_p1RM: null,
        focus: programOverview.Focus,
      });

      setGeneratedProgram(updated);
    };

    return (
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="md" mb={4} color="teal.600">
            Fine-tune Your Program
          </Heading>
          <Text color="gray.600" mb={6}>
            Make final adjustments to individual weeks and exercises before
            saving.
          </Text>
        </Box>

        <HStack spacing={4} wrap="wrap">
          <FormControl width="150px">
            <FormLabel>Week</FormLabel>
            <Select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
            >
              {Object.keys(generatedProgram).map((week) => (
                <option key={week} value={week}>
                  Week {week}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl width="150px">
            <FormLabel>Day</FormLabel>
            <Select
              value={selectedDay}
              onChange={(e) => setSelectedDay(parseInt(e.target.value))}
            >
              {generatedProgram[selectedWeek] &&
                Object.keys(generatedProgram[selectedWeek]).map((day) => (
                  <option key={day} value={day}>
                    Day {day}
                  </option>
                ))}
            </Select>
          </FormControl>
        </HStack>

        {generatedProgram[selectedWeek] &&
          generatedProgram[selectedWeek][selectedDay] && (
            <Box
              p={4}
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
            >
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontWeight="semibold">
                  Week {selectedWeek}, Day {selectedDay} Exercises
                </Text>
                <Button
                  leftIcon={<AddIcon />}
                  size="sm"
                  colorScheme="teal"
                  onClick={() => addCustomExercise(selectedWeek, selectedDay)}
                >
                  Add Exercise
                </Button>
              </Flex>

              <VStack spacing={4} align="stretch">
                {generatedProgram[selectedWeek][selectedDay].map(
                  (exercise, index) => (
                    <Box key={index} p={4} bg="gray.50" borderRadius="md">
                      <Grid
                        templateColumns="repeat(auto-fit, minmax(150px, 1fr))"
                        gap={3}
                      >
                        <FormControl>
                          <FormLabel fontSize="sm">Exercise</FormLabel>
                          <Input
                            size="sm"
                            value={exercise.exercise}
                            onChange={(e) =>
                              updateGeneratedExercise(
                                selectedWeek,
                                selectedDay,
                                index,
                                "exercise",
                                e.target.value
                              )
                            }
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="sm">Sets</FormLabel>
                          <NumberInput
                            size="sm"
                            value={exercise.target_sets}
                            onChange={(value) =>
                              updateGeneratedExercise(
                                selectedWeek,
                                selectedDay,
                                index,
                                "target_sets",
                                parseInt(value) || 3
                              )
                            }
                            min={1}
                            max={10}
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
                            size="sm"
                            value={exercise.target_reps}
                            onChange={(value) =>
                              updateGeneratedExercise(
                                selectedWeek,
                                selectedDay,
                                index,
                                "target_reps",
                                parseInt(value) || 10
                              )
                            }
                            min={1}
                            max={50}
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
                            size="sm"
                            value={exercise.target_weight_kg || ""}
                            onChange={(value) =>
                              updateGeneratedExercise(
                                selectedWeek,
                                selectedDay,
                                index,
                                "target_weight_kg",
                                parseInt(value) || null
                              )
                            }
                            min={0}
                            precision={1}
                            step={0.5}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="sm">RPE</FormLabel>
                          <NumberInput
                            size="sm"
                            value={exercise.target_rpe}
                            onChange={(value) =>
                              updateGeneratedExercise(
                                selectedWeek,
                                selectedDay,
                                index,
                                "target_rpe",
                                parseInt(value) || 7
                              )
                            }
                            min={1}
                            max={10}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="sm">Load % 1RM</FormLabel>
                          <NumberInput
                            size="sm"
                            value={exercise.load_prescription_p1RM || ""}
                            onChange={(value) =>
                              updateGeneratedExercise(
                                selectedWeek,
                                selectedDay,
                                index,
                                "load_prescription_p1RM",
                                parseFloat(value) || null
                              )
                            }
                            min={30}
                            max={100}
                            precision={1}
                            step={2.5}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                      </Grid>
                    </Box>
                  )
                )}
              </VStack>
            </Box>
          )}
      </VStack>
    );
  };

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
            programOverview.Program_Length_in_Weeks
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
        <Stepper index={activeStep} mb={8} colorScheme="teal">
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
        isOpen={isProgramModalOpen}
        onClose={onProgramModalClose}
        size="6xl"
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent maxH="90vh" overflowY="auto">
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
