import { Button, View, Text } from "@tarojs/components";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import Taro from "@tarojs/taro";

const Index = () => {
  const searchResults = useSelector((state) => state.result.searchResult.searchResults);
  useEffect(() => {

  }, [searchResults]);
  const handleSearch=(longitude,latitude)=>{
    Taro.setStorageSync('searchLocation',{longitude,latitude})
    void Taro.navigateBack({
      delta:2
    })
  }
  return (
    <View className='search-results'>
      <Text className='search-title'>搜索结果</Text>

      {searchResults.length > 0 ? (
        searchResults.map((result, index) => (
          <Button key={index} className='result-item' onClick={()=>handleSearch(result.longitude,result.latitude)}>
            <View className='result-info'>
              <Text className='result-name'>{result.name}</Text>
              <Text className='result-address'>{result.location}</Text>
            </View>
          </Button>
        ))
      ) : (
        <Text className='no-results'>暂无搜索结果</Text>
      )}
    </View>
  );
};
export default Index;
