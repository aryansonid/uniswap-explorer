import React from 'react';
import { ChakraProvider, Box, Grid } from '@chakra-ui/react';
import theme from './styles/theme';
import TokenTable from './components/TokenTable';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={3}>
          <TokenTable />
        </Grid>
      </Box>
    </ChakraProvider>
  );
}

export default App;
