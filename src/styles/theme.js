import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  initialColorMode: 'light',
  useSystemColorMode: false,
  components: {
    Table: {
      variants: {
        custom: {
          td: {
            border: '1px solid',
            borderColor: 'gray.300',
          },
        },
      },
    },
  },
});

export default theme;
