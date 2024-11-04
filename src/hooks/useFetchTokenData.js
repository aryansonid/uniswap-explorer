import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const query = `
query MyQuery {
  topTokens: tokens(
    first: 10
    orderBy: volumeUSD
    orderDirection: desc
  ) {
    id
    name
    symbol
    volumeUSD
    tokenDayData(
      orderBy: volumeUSD
      orderDirection: desc
    ) {
      priceUSD
      volume
      volumeUSD
      date
      open
      close
    }
  }
}
`;

const fetchSubgraphData = async (api, query) => {
  try {
    const response = await axios.post(api, { query });
    return response.data.data.topTokens;
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
          const lastDayData = tokenDayData[0];

          if (lastDayData) {
            const open = parseFloat(lastDayData.open);
            const close = parseFloat(lastDayData.close);
            const percentageChange =
              close && open ? ((close - open) / open) * 100 : 0;
            const percentageChangeString = percentageChange.toFixed(2);

            return {
              ...token,
              percentageChange: percentageChangeString,
              tokenDayData: tokenDayData.map(data => ({
                date: format(new Date(data.date * 1000), 'yyyy-MM-dd'),
                volume: parseFloat(data.volume) || 0,
                price: parseFloat(data.priceUSD) || 0,
              })),
            };
          }
          return {
            ...token,
            percentageChange: '0',
            tokenDayData: [],
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
