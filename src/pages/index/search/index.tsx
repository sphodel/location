import { Button, Input, View } from "@tarojs/components";
import { AtIcon } from "taro-ui";
import { useState } from "react";

const Search = () => {
  const [search, setSearch] = useState("");
  return (
    <View className='searchDom'>
      <AtIcon value='search'></AtIcon>
      <Input
        value={search}
        onInput={(e) => setSearch(e.detail.value)}
        className='inputDom'
        placeholder='搜索地点'
      />
      <Button style={{background:"#24578a"}}>搜索</Button>
    </View>
  );
};
export default Search;
