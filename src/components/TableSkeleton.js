import React from 'react';
import { Box, Skeleton, SkeletonText, Stack } from '@chakra-ui/react';

const TableSkeleton = () => {
  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
      <Stack spacing={4} padding={4}>
        <Skeleton height="20px" width="full" />
        <SkeletonText mt="4" noOfLines={4} spacing="4" />
        <Box>
          {Array(5)
            .fill()
            .map((_, index) => (
              <Stack key={index} direction="row" spacing={4} paddingY={2}>
                <Skeleton height="10px" width="100px" />
                <Skeleton height="10px" width="100px" />
                <Skeleton height="10px" width="100px" />
              </Stack>
            ))}
        </Box>
      </Stack>
    </Box>
  );
};

export default TableSkeleton;
