import { useState } from "react";
import Taro from "@tarojs/taro";
import { AtAvatar } from "taro-ui";
import { Button, View } from "@tarojs/components";
import "../../app.css";

const My = () => {
  const [avatarUrl, setAvatarUrl] = useState(
    Taro.getStorageSync("avatarUrl") ||
      "https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
  );
  const onChooseAvatar=(e:{detail:{avatarUrl:string}})=>{
    Taro.setStorageSync('avatarUrl',e.detail.avatarUrl)
    setAvatarUrl(e.detail.avatarUrl)
  }
  return (
    <View>
      <View className='h-screen flex flex-col items-center'>
        <Button className='' open-type='chooseAvatar' onChooseAvatar={onChooseAvatar}></Button>
        <AtAvatar circle className='' image={avatarUrl}></AtAvatar>
        <View className='text-[#acc855] text-[100px]'>Hello world!</View>
      </View>
    </View>
  );
};
export default My;
