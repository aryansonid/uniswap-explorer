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
  Avatar,
} from '@chakra-ui/react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import useFetchTokenData from '../hooks/useFetchTokenData';
import { LineChart, Line } from 'recharts';
import TableSkeleton from './TableSkeleton';

const headers = [
  { key: 'index', label: '#' },
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

  console.log("Token Data:- ",tokenData)

  return (
    <Box px={16}>
      <Text fontSize="2xl" mb={4}>
        Tokens
      </Text>
      {loading ? (
        <HStack justify="center" mt={4}>
          <TableSkeleton />
        </HStack>
      ) : (
        <Box
          mt={4}
          borderRadius="3xl"
          overflow="hidden"
          border="1px"
          borderColor="gray.100"
        >
          <Table variant="simple" borderRadius="xl">
            <Thead>
              <Tr>
                {headers.map(header => (
                  <Th
                    key={header.key}
                    textTransform="none"
                    height="48px"
                    bg={'#f9f9f9'}
                    color={'#7d7d7d'}
                  >
                    <HStack>
                      <Text
                        fontSize={'16px'}
                        onClick={() =>
                          header.key !== 'index' && requestSort(header.key)
                        }
                        cursor={header.key !== 'index' ? 'pointer' : 'default'}
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
                        onClick={() =>
                          header.key !== 'index' && requestSort(header.key)
                        }
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
                    <Td key={header.key} height="64px" verticalAlign="middle">
                      {header.key === 'index' ? (
                        <Text fontSize="16px">{index + 1}</Text>
                      ) : header.key === 'token' ? (
                        <HStack spacing={2}>
                          <Avatar
                            size="sm"
                            src={`/logo/${token.symbol.toLowerCase()}.png`}
                            alt={token.symbol}
                          />
                          <Text fontSize="16px">{token.symbol}</Text>
                        </HStack>
                      ) : header.key === '1d_change' ? (
                        <Text fontSize="16px">{`${token.percentageChange}%`}</Text>
                      ): header.key === 'volume' ? (
                        <Text fontSize="16px">{`${Number(token.volume).toFixed(2)}`}</Text>
                      ) : header.key === 'volumeChart' ? (
                        <Box width={200} overflow="hidden">
                          <LineChart
                            width={200}
                            height={32}
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
                        <Text fontSize="16px">
                          {(token[header.key] || 0).toString()}
                        </Text>
                      )}
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default TokenTable;
