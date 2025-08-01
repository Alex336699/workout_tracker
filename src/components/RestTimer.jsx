import { useState, useEffect } from "react";
import { Box, Text, Button, Input, Flex } from "@chakra-ui/react";

function RestTimer() {
  // State for timer duration (in seconds), current time left, and timer status
  const [duration, setDuration] = useState(60); // Default rest time: 60 seconds
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);

  // Effect to handle countdown logic
  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Play a sound or vibrate (simulated with alert for now)
      alert("Rest time is up!");
      setIsRunning(false);
      setTimeLeft(duration); // Reset to original duration
    }
    return () => clearInterval(timer); // Cleanup interval on unmount or state change
  }, [isRunning, timeLeft, duration]);

  // Handlers for timer controls
  const startTimer = () => setIsRunning(true);
  const stopTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration);
  };
  const handleDurationChange = (e) => {
    const newDuration = parseInt(e.target.value) || 60;
    setDuration(newDuration);
    setTimeLeft(newDuration);
  };

  return (
    <Box p={4} bg="gray.100" borderRadius="md" maxW="100%" textAlign="center">
      <Text fontSize="2xl" fontWeight="bold" mb={2}>
        Rest Timer: {timeLeft}s
      </Text>
      <Flex justify="center" gap={2} mb={4}>
        <Button
          colorScheme="teal"
          size="lg"
          onClick={startTimer}
          isDisabled={isRunning}
        >
          Start
        </Button>
        <Button
          colorScheme="red"
          size="lg"
          onClick={stopTimer}
          isDisabled={!isRunning}
        >
          Stop
        </Button>
        <Button
          colorScheme="gray"
          size="lg"
          onClick={resetTimer}
          isDisabled={timeLeft === duration && !isRunning}
        >
          Reset
        </Button>
      </Flex>
      <Box>
        <Text fontSize="md" mb={2}>
          Set Duration (seconds):
        </Text>
        <Input
          type="number"
          value={duration}
          onChange={handleDurationChange}
          width="120px"
          textAlign="center"
          isDisabled={isRunning}
        />
      </Box>
    </Box>
  );
}

export default RestTimer;
