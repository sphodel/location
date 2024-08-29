import { useState } from "react";
import Taro from "@tarojs/taro";
import { AtList, AtListItem } from "taro-ui";
import { View } from "@tarojs/components";
import { gql } from "@apollo/client";
import "./index.less";
import client from "../../client";

const INSERT_USER =
  gql(`mutation insertUser($openid: String!,$avatar:String!,$name:String!) {
  insert_users_one(object: {openid: $openid,avatar:$avatar,name:$name}) {
    openid
  }
}
`);

const My = () => {
  const [avatarUrl] = useState(
    Taro.getStorageSync("avatarUrl") ||
      "https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132"
  );
  const [name] = useState(Taro.getStorageSync("nickName") || "微信用户");
  const navigateToPage = (url: string) => {
    void Taro.navigateTo({
      url: `/pages/my/${url}/index`,
    });
  };
  console.log(Taro.getStorageSync('openid'))
  const handleLogin = () => {
    if (Taro.getStorageSync("openid") == "") {
      Taro.login().then((res) => {
        if(res.code){
          Taro.request({
            url: "https://local-share-gql.lighthx.xyz/api/getOpenId",
            method:"POST",
            data:{
              code:res.code
            },
            success(res1) {
              void client.mutate({
                mutation: INSERT_USER,
                variables: {
                  openid: res1.data.openid,
                  avatar:
                    "https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132",
                  name:"微信用户"
                },
              });
              Taro.setStorageSync('openid',res1.data.openid)
              navigateToPage("edit");
            },fail(res1){
              console.log(res1)
            }
          })
        }
      });
    } else {
      navigateToPage("edit");
    }
  };
  return (
    <View className='box'>
      <AtList>
        <AtListItem
          title={name}
          thumb={avatarUrl}
          className='user'
          onClick={handleLogin}
        />
      </AtList>
      <AtList>
        <AtListItem
          title='我的收藏'
          arrow='right'
          iconInfo={{ size: 25, color: "#78A4FA", value: "star" }}
          onClick={() => navigateToPage("collection")}
        />
        <AtListItem
          title='历史记录'
          arrow='right'
          iconInfo={{ size: 25, color: "#FF4949", value: "calendar" }}
          onClick={() => navigateToPage("use")}
        />
        <AtListItem
          title='我的反馈'
          arrow='right'
          iconInfo={{ size: 25, color: "#78A4FA", value: "message" }}
          onClick={() => navigateToPage("feedback")}
        />
        <AtListItem
          title='我的好友'
          arrow='right'
          iconInfo={{ size: 25, color: "#8ad36f", value: "user" }}
          onClick={() => navigateToPage("friends")}
        />
      </AtList>
    </View>
  );
};
export default My;
