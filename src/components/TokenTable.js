'use client';
import React, { useState } from 'react';
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
  Spinner,
} from '@chakra-ui/react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import useFetchTokenData from '../hooks/useFetchTokenData';
import { LineChart, Line } from 'recharts';

const headers = [
  { key: 'token', label: 'Token name' },
  { key: 'price', label: 'Price' },
  { key: '1d_change', label: '1 day' },
  { key: 'volume', label: 'Volume' },
  { key: 'volumeChart', label: 'Volume Chart' },
];

const TokenTable = () => {
  const apiUrl = process.env.REACT_APP_SUBGRAPH_API_URL;
  const { tokenData, loading } = useFetchTokenData(apiUrl);
  const [sortConfig, setSortConfig] = useState({
    key: 'token',
    direction: 'ascending',
  });

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
      {loading ? (
        <HStack justify="center" mt={4}>
          <Spinner size="xl" />
        </HStack>
      ) : (
        <Table variant="simple">
          <Thead bg="#f9f9f9" color="#7d7d7d">
            <Tr>
              {headers.map(header => (
                <Th key={header.key} textTransform="none" width="64px">
                  <HStack>
                    <Text
                      onClick={() =>
                        header.key === 'token' && requestSort(header.key)
                      }
                      cursor="pointer"
                    >
                      {header.label}
                    </Text>
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
              <Tr key={index} height="64px">
                {headers.map(header => (
                  <Td
                    key={header.key}
                    width="64px"
                    height="64px"
                    verticalAlign="middle"
                  >
                    {header.key === 'token' ? (
                      <HStack spacing={2}>
                        <Text>{token.symbol}</Text>
                      </HStack>
                    ) : header.key === '1d_change' ? (
                      `${token.percentageChange}%`
                    ) : header.key === 'volumeChart' ? (
                      <Box width={200} height={100}>
                        <LineChart
                          width={200}
                          height={100}
                          data={token.tokenDayData}
                          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                        >
                          <Line
                            type="monotone"
                            dataKey="volume"
                            stroke="#82ca9d"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </Box>
                    ) : (
                      (token[header.key] || 0).toString()
                    )}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};

export default TokenTable;
