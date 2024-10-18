import { useState } from "react";
import Taro, { useDidShow } from "@tarojs/taro";
import { AtList, AtListItem } from "taro-ui";
import { Button, View } from "@tarojs/components";
import ShortUniqueId from "short-unique-id";
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
const QUERY_USER_EXIST = gql(`query queryUserExist($openid: String!) {
  users(where: {openid: {_eq: $openid}}) {
    openid
  }
}`);
const My = () => {
  const [avatarUrl, setAvatarUrl] = useState(
    Taro.getStorageSync("avatarUrl") ||
      "https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132"
  );
  const [name, setName] = useState("登录");
  useDidShow(() => {
    setName(Taro.getStorageSync("nickName") || "登录");
    setAvatarUrl(
      Taro.getStorageSync("avatarUrl") ||
        "https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132"
    );
  });
  const navigateToPage = (url: string) => {
    void Taro.navigateTo({
      url: `/pages/my/${url}/index`,
    });
  };
  const handleLogin = () => {
    client
      .query({
        query: QUERY_USER_EXIST,
        variables: { openid: Taro.getStorageSync("openid") },
      })
      .then((r) => {
        if (!r.data.users.length) {
          const uid = new ShortUniqueId({ length: 10 });

          void client.mutate({
            mutation: INSERT_USER,
            variables: {
              openid: Taro.getStorageSync("openid"),
              name: `微信用户${uid.rnd()}`,
              avatar: avatarUrl,
            },
          });
        }
        navigateToPage("edit");
        Taro.setStorageSync("login", true);
      });
  };
  return (
    <View className='box'>
      <AtList>
        <Button onClick={handleLogin}>
          <AtListItem title={name} thumb={avatarUrl} className='user' />
        </Button>
      </AtList>
      <AtList>
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
