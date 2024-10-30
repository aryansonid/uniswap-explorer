import React, { useEffect, useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import {
  FaSort,
  FaSortUp,
  FaSortDown,
} from 'react-icons/fa';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { format } from 'date-fns'; // Import the format function

const headers = [
  { key: 'token', label: 'Token name' },
  { key: 'price', label: 'Price' },
  { key: '1d_change', label: '1 day' },
  { key: 'volume', label: 'Volume' },
  { key: 'volumeChart', label: 'Volume Chart' },
];

const query = `
query MyQuery {
  tokens {
    symbol
    volume
    name
    id
    tokenDayData {
      high
      close
      low
      open
      priceUSD
      volume
      volumeUSD
      date
    }
    volumeUSD
  }
}
`;

const fetchSubgraphData = async (api, query) => {
  try {
    const response = await axios.post(api, { query });
    return response.data.data.tokens;
  } catch (error) {
    console.error('Error fetching data from subgraph:', error);
    throw error;
  }
};

const TokenTable = () => {
  const [tokenData, setTokenData] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: 'token',
    direction: 'ascending',
  });

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        const data = await fetchSubgraphData(
          process.env.REACT_APP_SUBGRAPH_API_URL,
          query
        );
        const processedData = data.map(token => {
          const { tokenDayData } = token;
          const lastDayData = tokenDayData[tokenDayData.length - 1];

          if (lastDayData) {
            const open = parseFloat(lastDayData.open);
            const close = parseFloat(lastDayData.close);
            const percentageChange = !isNaN(open) && !isNaN(close)
              ? ((close - open) / open) * 100
              : 'N/A';

            return {
              ...token,
              percentageChange: percentageChange.toFixed(2),
              tokenDayData: tokenDayData.map(day => ({
                date: format(new Date(day.date * 1000), 'yyyy-MM-dd'), // Convert to readable format
                priceUSD: parseFloat(day.priceUSD) || 0,
                volume: parseFloat(day.volume) || 0,
              })),
            };
          }
          return {
            ...token,
            percentageChange: 'N/A',
          };
        });
        setTokenData(processedData);
      } catch (error) {
        console.error('Error in fetchAndProcessData:', error);
      }
    };

    fetchAndProcessData();
  }, []);

  const sortedTokenData = [...tokenData].sort((a, b) => {
    const aValue =
      sortConfig.key === '1d_change'
        ? parseFloat(a.percentageChange) || 0
        : a[sortConfig.key];
    const bValue =
      sortConfig.key === '1d_change'
        ? parseFloat(b.percentageChange) || 0
        : b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = key => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <Box p={2}>
      <Text fontSize="2xl" mb={4}>
        Tokens
      </Text>
      <Table>
        <Thead bg="#f9f9f9" color="#7d7d7d">
          <Tr>
            {headers.map(header => (
              <Th key={header.key} textTransform="none">
                <HStack>
                  <Text>{header.label}</Text>
                  <IconButton
                    icon={
                      sortConfig.key === header.key &&
                      sortConfig.direction === 'ascending' ? (
                        <FaSortUp />
                      ) : sortConfig.key === header.key &&
                        sortConfig.direction === 'descending' ? (
                        <FaSortDown />
                      ) : (
                        <FaSort />
                      )
                    }
                    variant="link"
                    onClick={() => requestSort(header.key)}
                    size="sm"
                    aria-label={`Sort by ${header.label}`}
                  />
                </HStack>
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {sortedTokenData.map((token, index) => (
            <Tr key={index}>
              {headers.map(header => (
                <Td key={header.key}>
                  {header.key === 'token' ? (
                    <HStack spacing={2}>
                      <Text>{token.symbol}</Text>
                    </HStack>
                  ) : header.key === '1d_change' ? (
                    `${token.percentageChange}%`
                  ) : header.key === 'volumeChart' ? (
                    <Box width={200} height={100}>
                      <LineChart width={200} height={100} data={token.tokenDayData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="volume" stroke="#82ca9d" />
                      </LineChart>
                    </Box>
                  ) : (
                    token[header.key] || 'N/A'
                  )}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default TokenTable;
