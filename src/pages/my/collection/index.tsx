import { Button, View } from "@tarojs/components";
import Taro from "@tarojs/taro";

const Collection=()=>{
  return(
    <View>
      <Button onClick={()=>{
        void Taro.navigateTo({
          url:"/pages/index/route/index?route=walk"
        })
      }}>
        test
      </Button>
    </View>
  )
}
export default Collection
