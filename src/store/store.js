import { createStore, combineReducers } from 'redux';

const initialState = {
  searchResult: {
    name: '',
    longitude: 0,
    latitude: 0,
    location: '',
  },
};

// 定义 reducer，处理数据更新逻辑
function resultReducer(state = initialState, action) {
  switch (action.type) {
    case 'SET_SEARCH_INFO':
      return {
        ...state,
        searchResult: action.payload,
      };
    default:
      return state;
  }
}

// 创建 Redux store
const rootReducer = combineReducers({
  result: resultReducer,
});

const store = createStore(rootReducer);

export default store;
