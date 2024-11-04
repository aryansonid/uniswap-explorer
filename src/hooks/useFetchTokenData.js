import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const query = `
query MyQuery {
  tokens(where: {
    symbol_in: ["USDC", "DAI", "WETH"]
  }) {
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

const useFetchTokenData = apiUrl => {
  const [tokenData, setTokenData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSubgraphData(apiUrl, query);
        const processedData = data.map(token => {
          const { tokenDayData } = token;
          const lastDayData = tokenDayData[tokenDayData.length - 1];

          if (lastDayData) {
            const open = parseFloat(lastDayData.open);
            const close = parseFloat(lastDayData.close);

            let percentageChange = 0;
            if (open !== 0 && close !== 0) {
              percentageChange = ((close - open) / open) * 100;
            }

            console.log(
              'Open:- ',
              open,
              'Close:- ',
              close,
              'Percentage Change:- ',
              percentageChange
            );

            return {
              ...token,
              percentageChange:
                open === 0 || close === 0
                  ? '0.00'
                  : percentageChange.toFixed(2),
              tokenDayData: tokenDayData.map(day => ({
                date: format(new Date(day.date * 1000), 'yyyy-MM-dd'),
                priceUSD: parseFloat(day.priceUSD) || 0,
                volume: parseFloat(day.volume) || 0,
              })),
            };
          }
          return {
            ...token,
            percentageChange: '0.00',
          };
        });
        setTokenData(processedData);
      } catch (error) {
        setError('Failed to fetch token data.');
        console.error('Error in fetchAndProcessData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessData();
  }, [apiUrl]);

  return { tokenData, loading, error };
};

export default useFetchTokenData;
