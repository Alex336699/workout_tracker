import { useState } from "react";
import {
  Box,
  Heading,
  Input,
  Button,
  Flex,
  Alert,
  AlertIcon,
  Text,
  VStack,
} from "@chakra-ui/react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data.session) {
        navigate("/workout-programs"); // Redirect to programs page after login
      } else {
        throw new Error("Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Failed to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupRedirect = () => {
    navigate("/signup");
  };

  return (
    <Box p={4} maxW="400px" mx="auto" mt="10%">
      <Heading mb={6} textAlign="center">
        Login
      </Heading>
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      <VStack spacing={4}>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <Button
          colorScheme="teal"
          onClick={handleLogin}
          isLoading={loading}
          width="full"
        >
          Log In
        </Button>
        <Text fontSize="sm" color="gray.500">
          Don't have an account?{" "}
          <Button
            variant="link"
            color="teal.500"
            onClick={handleSignupRedirect}
          >
            Sign Up
          </Button>
        </Text>
      </VStack>
    </Box>
  );
}

export default Login;
