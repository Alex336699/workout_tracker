import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import Dashboard from './pages/Dashboard';
import Workout from './pages/Workout';
import ProgramBuilder from './pages/ProgramBuilder';

function App() {
  return (
    <ChakraProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/program-builder" element={<ProgramBuilder />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;