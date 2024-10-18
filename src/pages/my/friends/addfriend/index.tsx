import { Button, Image, Text, View } from "@tarojs/components";
import { AtAvatar, AtButton, AtMessage, AtSearchBar } from "taro-ui";
import { useState } from "react";
import { gql } from "@apollo/client";
import Taro from "@tarojs/taro";
import client from "../../../../client";
import "./index.less";

const QUERY_FRIEND = gql(`query queryFriend($name: String!) {
  users(where: {name: {_ilike: $name}}) {
    avatar
    name
    openid
  }
}
`);
const QUERY_CONTACTS = gql(`query queryContacts($user_id: String!) {
  contacts(where: {user_id: {_eq: $user_id}}) {
    contact_user_id
  }
}
`);
const ADD_NEW_FRIEND =
  gql(`mutation insertNewRequest($user_id: String!, $contact_user_id: String!) {
  insert_requests_one(object: {user_id: $user_id, contact_user_id: $contact_user_id, status: "pending"}) {
    status
  }
}
`);
const QUERY_REQUEST_EXIST =
  gql(`query queryRequestExist($user_id: String!, $contact_user_id: String!) {
  requests(where: {user_id: {_eq: $user_id}, contact_user_id: {_eq: $contact_user_id}, status: {_eq: "pending"}}) {
    id
  }
}`);
interface friendType {
  avatar: string;
  name: string;
  openid: string;
  ifContact?: boolean;
  ifRequest?: boolean;
}
const Addfriend = () => {
  const [search, setSearch] = useState("");
  const [friendList, setFriendList] = useState<friendType[]>();
  const [result, setResult] = useState(false);
  const [requestStatuses, setRequestStatuses] = useState<Record<string, string>>({})
  const handleSearch = async () => {
    if (search === "") {
      Taro.atMessage({
        message: "输入不能为空",
        type: "error",
      });
      return;
    }
    try {
      const { data: { users } } = await client.query({
        query: QUERY_FRIEND,
        variables: { name: `%${search}%` }
      })

      if (users.length === 0) {
        setResult(true)
        setFriendList([])
        return
      }

      setResult(false)

      const { data: { contacts } } = await client.query({
        query: QUERY_CONTACTS,
        variables: { user_id: Taro.getStorageSync('openid') }
      })

      const contactIds = contacts.map(item => item.contact_user_id)

      const updatedFriendList = users.map(user => ({
        ...user,
        ifContact: contactIds.includes(user.openid)
      }))

      setFriendList(updatedFriendList)

      const statuses = {}
      for (const friend of updatedFriendList) {
        if (!friend.ifContact) {
          const { data } = await client.query({
            query: QUERY_REQUEST_EXIST,
            variables: { user_id: Taro.getStorageSync('openid'), contact_user_id: friend.openid }
          })
          statuses[friend.openid] = data.requests.length > 0 ? 'sent' : 'none'
        }
      }
      setRequestStatuses(statuses)
    }catch (error){
      Taro.atMessage({
        'message': '搜索失败，请重试',
        'type': "error",
      })
    }
  };
  const addNewFriend = (contactId: string) => {
    void client.mutate({
      mutation: ADD_NEW_FRIEND,
      variables: {
        user_id: Taro.getStorageSync("openid"),
        contact_user_id: contactId,
      },
    });
    void Taro.navigateBack({delta:1})
  };
  return (
    <View className='add-friend-page'>
      <AtMessage />
      <View className='search-container'>
        <AtSearchBar
          showActionButton
          value={search}
          onChange={setSearch}
          onActionClick={handleSearch}
          placeholder='请输入用户昵称'
        />
      </View>
      <View className='friend-list'>
        {friendList?.map((friend, i) => (
          <View key={i} className='friend-item'>
            <View className='friend-info'>
              <AtAvatar image={friend.avatar} size='small' circle />
              <Text className='nickname'>{friend.name}</Text>
            </View>
            <View className='action-button'>
              {friend.ifContact ? (
                <Text className='status-text added'>已添加</Text>
              ) : requestStatuses[friend.openid] === 'sent' ? (
                <Text className='status-text sent'>请求已发送</Text>
              ) : (
                <AtButton type='secondary' size='small' onClick={() => addNewFriend(friend.openid)}>
                  添加好友
                </AtButton>
              )}
            </View>
          </View>
        ))}
      </View>
      {result && <View className='no-result'>未找到该昵称用户</View>}
    </View>
  );
};
export default Addfriend;
