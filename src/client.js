import Taro from '@tarojs/taro'
// eslint-disable-next-line import/no-named-as-default
import ApolloClient from 'apollo-boost';

const token=Taro.getStorageSync('token')
const client = new ApolloClient({
  uri: 'https://local-share-gql.lighthx.xyz/v1/graphql',
  fetch: (url, options) => Taro.request({
    url,
    method: options.method,
    data: options.body,
    header: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }).then(({data, statusCode}) => {
    return {
      ok: () => {
        return statusCode >= 200 && statusCode < 300;
      },
      text: () => {
        return Promise.resolve(JSON.stringify(data));
      }
    }
  })
});
export default client
