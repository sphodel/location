import { View, Text, Input, Button } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import { AtAvatar, AtIcon, AtMessage } from "taro-ui";
import { gql } from "@apollo/client";
import client from "../../../client";
import "./index.less";

const UPDATE_NAME=gql(`mutation updateInfo($openid: String!, $name: String!) {
  update_users(where: {openid: {_eq: $openid}}, _set: {name: $name}) {
    returning {
      openid
    }
  }
}
`)
const UPDATE_AVATAR=gql(`mutation updateAVA($openid: String!, $avatar: String!) {
  update_users(where: {openid: {_eq: $openid}}, _set: {avatar: $avatar}) {
    returning {
      openid
    }
  }
}
`)
const Edit = () => {
  const [avatarUrl, setAvatarUrl] = useState(
    Taro.getStorageSync("avatarUrl") ||
      "https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132"
  );
  const [nickName, setNickName] = useState(
    Taro.getStorageSync("nickName") || "微信用户"
  );
  const onChooseAvatar = (e: { detail: { avatarUrl: string } }) => {
    const fs=Taro.getFileSystemManager()
    const base64Str=fs.readFileSync(e.detail.avatarUrl,'base64')
    const imgBase64=`data:image/png;base64,${base64Str}`
    Taro.setStorageSync('avatarUrl',imgBase64)
    setAvatarUrl(imgBase64);
    void client.mutate({
      mutation:UPDATE_AVATAR,
      variables:{openid:Taro.getStorageSync('openid'),avatar:imgBase64}
    })
  };
  return (
    <View className='container'>
      <AtMessage />
      <Button
        className='avatar-item'
        onChooseAvatar={onChooseAvatar}
        open-type='chooseAvatar'
      >
        <Text style={{ paddingLeft: "6px" }}>头像</Text>
        <View className='item-right'>
          <AtAvatar circle image={avatarUrl}></AtAvatar>
          <AtIcon value='chevron-right'></AtIcon>
        </View>
      </Button>
      <View className='avatar-item'>
        <Text style={{ paddingLeft: "16px" }}>昵称</Text>
        <View className='item-right'>
          <Input
            type='nickname'
            style={{ width: "80px", textAlign: "right",marginRight:"16px" }}
            value={nickName}
            onInput={(e) => {
              void client.mutate({
                mutation:UPDATE_NAME,
                variables:{openid:Taro.getStorageSync('openid'),name:e.detail.value}
              })
              Taro.setStorageSync('nickName',e.detail.value)
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
