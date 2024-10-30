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
} from '@chakra-ui/react';
import { FaEthereum, FaBitcoin, FaCloudMeatball } from 'react-icons/fa';
import axios from 'axios';

const headers = [
  { key: '', label: '#' },
  { key: 'token', label: 'Token name' },
  { key: 'price', label: 'Price' },
  { key: '1h_change', label: '1 hour' },
  { key: '1d_change', label: '1 day' },
  { key: 'fdv', label: 'FDV' },
  { key: 'volume', label: 'Volume' },
];

const tokenIcons = {
  Ether: <FaEthereum />,
  Bitcoin: <FaBitcoin />,
  Litecoin: <FaCloudMeatball />,
};

const query = `
query MyQuery {
  tokens {
    symbol
    totalSupply
    totalValueLocked
    txCount
  }
}
`;

const fetchSubgraphData = async (api, query) => {
  try {
    const response = await axios.post(api, { query });
    if (!response) {
      console.log('error in fetching data');
    }
    return response.data.data.tokens;
  } catch (error) {
    console.error('Error fetching data from subgraph:', error);
    throw error;
  }
};

const TokenTable = () => {
  const [tokenData, setTokenData] = useState([]);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        const data = await fetchSubgraphData(
          'https://api.studio.thegraph.com/query/91165/uniswap-v3/version/latest',
          query
        );
        setTokenData(data);
      } catch (error) {
        console.error('Error in fetchAndProcessData:', error);
      }
    };

    fetchAndProcessData();
  }, []);

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
                {header.label}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {tokenData.map((token, index) => (
            <Tr key={index}>
              {headers.map(header => (
                <Td key={header.key}>
                  {header.key === 'token' ? (
                    <HStack spacing={2}>
                      {tokenIcons[token.symbol] || <Text>{token.symbol}</Text>}
                      <Text>{token.symbol}</Text>
                    </HStack>
                  ) : header.label === '#' ? (
                    index + 1
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
