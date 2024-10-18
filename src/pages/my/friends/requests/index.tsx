import { View, Text, Button, Image } from "@tarojs/components";
import { gql } from "@apollo/client";
import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";
import "./index.less";
import client from "../../../../client";

const QUERY_REQUEST = gql(`query queryRequest($contact_user_id: String!) {
  requests(where: {contact_user_id: {_eq: $contact_user_id}}) {
    contact_request {
      avatar
      name
      openid
    }
    status
  }
}
`);
const INSERT_NEW_FRIEND =
  gql(`mutation insertNewFriend($contact_user_id: String!, $user_id: String!) {
  insert_contacts_one(object: {contact_user_id: $contact_user_id, user_id: $user_id}) {
    contact_user_id
  }
}
`);
const UPDATE_REQUEST =
  gql(`mutation updateRequest($contact_user_id: String!, $user_id: String!, $status: String!) {
  update_requests(where: {contact_user_id: {_eq: $contact_user_id}, user_id: {_eq: $user_id}}, _set: {status: $status}) {
    returning {
      user_id
    }
  }
}

`);
interface ItemType {
  contact_request: { avatar: string; name: string; openid: string };
  status: string;
}
const Requests = () => {
  const [requestItems, setRequestItems] = useState<ItemType[]>();
  const user_id = Taro.getStorageSync("openid");
  useEffect(() => {
    void client
      .query({
        query: QUERY_REQUEST,
        variables: { contact_user_id: user_id },
        fetchPolicy: "network-only",
      })
      .then((res) => {
        setRequestItems(res.data.requests);
      });
  }, [user_id]);
  const handleAccept = (contactId: string) => {
    void client.mutate({
      mutation: INSERT_NEW_FRIEND,
      variables: { user_id: user_id, contact_user_id: contactId },
    }).then(()=>{void client.mutate({
      mutation:INSERT_NEW_FRIEND,
      variables:{user_id:contactId,contact_user_id:user_id}
    })});
    void client.mutate({
      mutation:UPDATE_REQUEST,
      variables:{user_id:contactId,contact_user_id:user_id,status:"成功"}
    })
    Taro.navigateBack({delta:1})
  };
  const handleCancel = (contactId: string) => {
    void client.mutate({
      mutation:UPDATE_REQUEST,
      variables:{user_id:contactId,contact_user_id:user_id,status:"被拒绝"}
    })
    Taro.navigateBack({delta:1})
  };
  return (
    <View>
      {requestItems?.map((item, i) => (
        <View className='request-item' key={i}>
          <View className='request-info'>
            <Image src={item.contact_request.avatar} />
            <Text>{item.contact_request.name}</Text>
          </View>
          {item.status == "pending" ? (
            <View className='request-actions'>
              <Button
                className='accept'
                onClick={() => {
                  handleAccept(item.contact_request.openid);
                }}
              >
                同意
              </Button>
              <Button
                className='reject'
                onClick={() => {
                  handleCancel(item.contact_request.openid);
                }}
              >
                拒绝
              </Button>
            </View>
          ):<Text>{`添加${item.status}`}</Text>}
        </View>
      ))}
      <View>{requestItems?.length ? "" : <Text>无添加记录</Text>}</View>
    </View>
  );
};
export default Requests;
