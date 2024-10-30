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

const headers = [
  { key: 'token', label: 'Token name' },
  { key: 'price', label: 'Price' },
  { key: '1d_change', label: '1 day' },
  { key: 'volume', label: 'Volume' },
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
            console.log(
              token.symbol,
              'Open:- ',
              open,
              'Close:- ',
              close,
              ((close - open) / open) * 100
            );

            if (!isNaN(open) && !isNaN(close)) {
              const percentageChange = ((close - open) / open) * 100;
              return {
                ...token,
                percentageChange: percentageChange.toFixed(2),
              };
            }
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
