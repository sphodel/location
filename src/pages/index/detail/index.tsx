import { ScrollView, View,Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import './index.less'

const Detail=()=>{
  const routes=Taro.getStorageSync('route')
  return(
    <ScrollView className='route-list' scrollY>
      {routes?.map((route, index) => (
        <View key={index} className='route-item'>
          <View className='route-info'>
            <Text className='route-name'>{route}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  )
}
export default Detail
