import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronRightIcon,
  SearchIcon,
  CalendarIcon,
  InfoIcon,
  StarIcon,
} from "@chakra-ui/icons";

function BottomNavigation() {
  const location = useLocation(); // To highlight active page

  const navItems = [
    { label: "Home", icon: <ChevronRightIcon />, path: "/" },
    { label: "Exercises", icon: <SearchIcon />, path: "/exercise-library" },
    { label: "Programs", icon: <StarIcon />, path: "/workout-programs" },
    { label: "History", icon: <CalendarIcon />, path: "/workout-history" },
    { label: "Info", icon: <InfoIcon />, path: "/info" },
  ];

  return (
    <Box
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      bg="white"
      boxShadow="0 -2px 10px rgba(0, 0, 0, 0.1)"
      zIndex="1000"
      p={2}
      display={{ base: "block", md: "none" }} // Show only on mobile by default
    >
      <Flex justify="space-around" align="center">
        {navItems.map((item) => (
          <Flex
            key={item.path}
            direction="column"
            align="center"
            as={Link}
            to={item.path}
            role="navigation"
            aria-label={`Navigate to ${item.label}`}
          >
            <IconButton
              icon={item.icon}
              variant="ghost"
              size="md"
              color={location.pathname === item.path ? "teal.500" : "gray.500"}
              aria-label={item.label}
            />
            <Text
              fontSize="xs"
              color={location.pathname === item.path ? "teal.500" : "gray.500"}
            >
              {item.label}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
}

export default BottomNavigation;
