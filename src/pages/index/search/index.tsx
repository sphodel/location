import { View } from "@tarojs/components";
import { AtSearchBar } from "taro-ui";
import { useState } from "react";
import "../index.less";

const Search = () => {
  const [search, setSearch] = useState("");
  return (
    <View>
      <View className='searchDom'>
        <AtSearchBar
          showActionButton
          value={search}
          onChange={(e)=>{setSearch(e)}}
        />
    </View>
    </View>
  );
};
export default Search;
