import { View, Text, Input, Button } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";
import { AtAvatar, AtIcon } from "taro-ui";
import "./index.less";

const Edit = () => {
  const [avatarUrl, setAvatarUrl] = useState(
    Taro.getStorageSync("avatarUrl") ||
      "https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132"
  );
  const [nickName, setNickName] = useState(
    Taro.getStorageSync("nickName") || "微信用户"
  );
  const onChooseAvatar = (e: { detail: { avatarUrl: string } }) => {
    Taro.setStorageSync("avatarUrl", e.detail.avatarUrl);
    setAvatarUrl(e.detail.avatarUrl);
  };
  useEffect(() => {
    Taro.setStorageSync("nickName", nickName);
  }, [nickName]);
  return (
    <View className='container'>
      <Button
        className='avatar-item'
        onClick={onChooseAvatar}
        open-type='chooseAvatar'
      >
        <Text style={{ paddingLeft: "6px" }}>头像</Text>
        <View className='item-right'>
          <AtAvatar circle image={avatarUrl}></AtAvatar>
          <AtIcon value='chevron-right'></AtIcon>
        </View>
      </Button>
      <View className='avatar-item'>
        <Text style={{ paddingLeft: "6px" }}>昵称</Text>
        <View className='item-right'>
          <Input
            type='nickname'
            style={{ width: "80px" }}
            value={nickName}
            onInput={(e) => {
              setNickName(e.detail.value);
            }}
          />
          <AtIcon value='chevron-right'></AtIcon>
        </View>
      </View>
    </View>
  );
};
export default Edit;
