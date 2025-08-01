import { useState } from 'react';
import { Box, Heading, Input, Button, Flex, Alert, AlertIcon, Text, VStack } from '@chakra-ui/react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Basic validation
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match.');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (data.user) {
        setSuccessMessage('Sign up successful! Please check your email for a confirmation link.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        // Optionally redirect after a delay
        setTimeout(() => navigate('/login'), 3000);
      } else {
        throw new Error('Sign up failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <Box p={4} maxW="400px" mx="auto" mt="10%">
      <Heading mb={6} textAlign="center">Sign Up</Heading>
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert status="success" mb={4}>
          <AlertIcon />
          {successMessage}
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
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
        />
        <Button
          colorScheme="teal"
          onClick={handleSignup}
          isLoading={loading}
          width="full"
        >
          Sign Up
        </Button>
        <Text fontSize="sm" color="gray.500">
          Already have an account? <Button variant="link" color="teal.500" onClick={handleLoginRedirect}>Log In</Button>
        </Text>
      </VStack>
    </Box>
  );
}

export default Signup;