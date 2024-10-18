import { View, Text } from "@tarojs/components";
import { gql } from "@apollo/client";
import Taro, { useDidShow } from "@tarojs/taro";
import { useEffect, useState } from "react";
import {
  AtAvatar,
  AtButton,
  AtMessage,
  AtModal,
  AtSwipeAction,
} from "taro-ui";
import client from "../../../client";
import "./index.less";

const QUERY_FRIENDS = gql(`query queryFriends($user_id: String!) {
  contacts(where: {user_id: {_eq: $user_id}}) {
    contact_user {
      name
      avatar
      openid
    }
  }
}
`);

const MUTATE_LOCATION =
  gql(`mutation insertLocation($my_latitude: numeric!, $my_longitude: numeric!, $user_id: String!, $contact_user_id: String!) {
  insert_location_one(object: {my_latitude: $my_latitude, my_longitude: $my_longitude, user_id: $user_id, contact_user_id: $contact_user_id}) {
    id
  }
}
`);
const INSERT_LOCATION =
  gql(`mutation insertLocations($contact_latitude: numeric!, $contact_longitude: numeric!, $user_id: String!, $contact_user_id: String!) {
  insert_location_one(object: {contact_latitude: $contact_latitude, contact_longitude: $contact_longitude, user_id: $user_id, contact_user_id: $contact_user_id}) {
    id
  }
}
`);
const UPDATE_LOCATION =
  gql(`mutation updateLocation($user_id: String!, $contact_user_id: String!, $contact_latitude: numeric!, $contact_longitude: numeric!) {
  update_location(where: {user_id: {_eq: $user_id}, contact_user_id: {_eq: $contact_user_id}}, _set: {contact_latitude: $contact_latitude, contact_longitude: $contact_longitude}) {
    returning {
      id
    }
  }
}
`);
const QUERY_LOCATION =
  gql(`query queryLocation($user_id: String!, $contact_user_id: String!) {
  location(where: {user_id: {_eq: $user_id}, contact_user_id: {_eq: $contact_user_id}}) {
    id
  }
}
`);
const INSERT_NEW_INVITATION =
  gql(`mutation insertNewInvitation($invitee: String!, $inviter: String!, $status: String!) {
  insert_invitations_one(object: {invitee: $invitee, inviter: $inviter, status: $status}) {
    id
  }
}`);
const QUERY_STATUS =
  gql(`query queryStatus($inviter: String!, $invitee: String!) {
  invitations(where: {inviter: {_eq: $inviter}, invitee: {_eq: $invitee}}) {
    status
  }
}
`);
const DELETE_INVITATION =
  gql(`mutation deleteInvitation($inviter: String!, $invitee: String!) {
  delete_invitations(where: {inviter: {_eq: $inviter}, invitee: {_eq: $invitee}}) {
    returning {
      id
    }
  }
}
`);
const DELETE_FRIEND = gql(`
  mutation deleteFriend($user_id: String!, $contact_user_id: String!) {
    delete_contacts(where: {
      _or: [
        { _and: [{user_id: {_eq: $user_id}}, {contact_user_id: {_eq: $contact_user_id}}] },
        { _and: [{user_id: {_eq: $contact_user_id}}, {contact_user_id: {_eq: $user_id}}] }
      ]
    }) {
      affected_rows
    }
  }
`);
interface contactType {
  contact_user: { avatar: string; name: string; openid: string };
}
const Friends = () => {
  const [contactInfo, setContactInfo] = useState<contactType[]>();
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isPolling, setIsPolling] = useState(false);
  const [loginStatus, setLoginStatus] = useState(false);
  const user_id = Taro.getStorageSync("openid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [friendToDelete, setFriendToDelete] = useState(null);

  const handleDeleteClick = (contact) => {
    setFriendToDelete(contact);
    setIsModalOpen(true);
  };
  const pollStatus = async (contactId) => {
    const interval = setInterval(async () => {
      try {
        const statusResponse = await client.query({
          query: QUERY_STATUS,
          variables: { inviter: user_id, invitee: contactId },
          fetchPolicy: "network-only",
        });
        const status = statusResponse.data.invitations[0].status;
        console.log(statusResponse.data.invitations[0].status);
        if (status == "success") {
          Taro.setStorageSync("ifShare", true);
          setModalMessage("对方已同意，正在跳转到共享页面");
          clearInterval(interval);
          setTimeout(() => setShowModal(false), 2000);
          await performLocationUpdates(contactId);
        }
      } catch (error) {
        console.error("发生错误", error);
      }
    }, 2000);
  };
  const performLocationUpdates = async (contactId) => {
    const response = await client.query({
      query: QUERY_LOCATION,
      variables: { user_id: user_id, contact_user_id: contactId },
    });

    if (response.data.location.length) {
      void Taro.getLocation({
        success(res1) {
          client.mutate({
            mutation: UPDATE_LOCATION,
            variables: {
              user_id: contactId,
              contact_user_id: user_id,
              contact_latitude: res1.latitude,
              contact_longitude: res1.longitude,
            },
          });
        },
      });
    } else {
      void Taro.getLocation({
        success(res) {
          client.mutate({
            mutation: MUTATE_LOCATION,
            variables: {
              my_latitude: res.latitude,
              my_longitude: res.longitude,
              user_id: user_id,
              contact_user_id: contactId,
            },
          });
          client.mutate({
            mutation: INSERT_LOCATION,
            variables: {
              contact_latitude: res.latitude,
              contact_longitude: res.longitude,
              user_id: contactId,
              contact_user_id: user_id,
            },
          });
          Taro.setStorageSync("contactId", contactId);
        },
      });
    }

    void Taro.navigateTo({
      url: "/pages/index/route/index?route=walk",
    });
  };
  useDidShow(() => {
    if (Taro.getStorageSync("login")) {
      setLoginStatus(true);
    }
  });
  useEffect(() => {
    const fetchData = async () => {
      if (Taro.getStorageSync("login")) {
        const res = await client.query({
          query: QUERY_FRIENDS,
          variables: { user_id: Taro.getStorageSync("openid") },
          fetchPolicy: "network-only",
        });
        setContactInfo(res.data.contacts);
      } else {
        Taro.atMessage({
          message: "请先返回上个页面进行登录",
          type: "warning",
        });
      }
    };
    void fetchData();
  }, []);

  const handleShare = async (contactId: string) => {
    setShowModal(true);
    setModalMessage("等待对方同意中...");
    Taro.setStorageSync("contactId", contactId);
    try {
      await client.mutate({
        mutation: INSERT_NEW_INVITATION,
        variables: { inviter: user_id, invitee: contactId, status: "pending" },
      });
      setIsPolling(true);
      await pollStatus(contactId);
    } catch (error) {
      setModalMessage("发生错误");
      setTimeout(() => setShowModal(false), 2000);
      console.error(error);
    }
  };
  const handleCancel = () => {
    setShowModal(false);
    const contactId = Taro.getStorageSync("contactId");
    void client.mutate({
      mutation: DELETE_INVITATION,
      variables: { inviter: user_id, invitee: contactId },
    });
  };

  useEffect(() => {
    if (!isPolling) return;

    return () => setIsPolling(false);
  }, [isPolling]);
  const handleConfirmDelete = async () => {
    if (friendToDelete) {
      try {
        await client.mutate({
          mutation: DELETE_FRIEND,
          variables: {
            user_id: Taro.getStorageSync("openid"),
            contact_user_id: friendToDelete.contact_user.openid,
          },
        });
        Taro.showToast({ title: "好友删除成功", icon: "success" });
        // 在这里更新好友列表状态
      } catch (error) {
        console.error("删除好友时发生错误:", error);
        Taro.showToast({ title: "删除失败，请重试", icon: "none" });
      }
    }
    setIsModalOpen(false);
    setFriendToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsModalOpen(false);
    setFriendToDelete(null);
  };
  return (
    <View className='friends-page'>
      <AtMessage />
      <AtModal
        isOpened={showModal}
        onCancel={handleCancel}
        title={modalMessage}
        cancelText='取消'
        closeOnClickOverlay={false}
      />
      <AtModal isOpened={isModalOpen} />
      <View className='header'>
        <View className='header-buttons'>
          <AtButton
            type='secondary'
            size='small'
            onClick={() =>
              Taro.navigateTo({ url: "/pages/my/friends/addfriend/index" })
            }
          >
            添加好友
          </AtButton>
          <AtButton
            type='secondary'
            size='small'
            onClick={() =>
              Taro.navigateTo({ url: "/pages/my/friends/requests/index" })
            }
          >
            查看请求
          </AtButton>
        </View>
      </View>

      <View className='friends-list'>
        {contactInfo?.map((contact, i) => (
          <AtSwipeAction
            onClick={() => {
              client.mutate({
                mutation: DELETE_FRIEND,
                variables: {
                  user_id: Taro.getStorageSync("openid"),
                  contact_user_id: contact.contact_user.openid,
                },
              });
            }}
            key={i}
            options={[
              {
                text: "删除",
                style: {
                  backgroundColor: "#FF4949",
                },
              },
            ]}
          >
            <View className='friend-item'>
              <View className='friend-info'>
                <AtAvatar
                  image={contact.contact_user.avatar}
                  size='small'
                  circle
                />
                <Text className='nickname'>{contact.contact_user.name}</Text>
              </View>
              <View className='action-button'>
                {Taro.getStorageSync("contactId") ==
                  contact.contact_user.openid &&
                Taro.getStorageSync("ifShare") ? (
                  <AtButton
                    type='primary'
                    size='small'
                    onClick={() =>
                      Taro.navigateTo({
                        url: "/pages/index/route/index?route=walk",
                      })
                    }
                  >
                    返回共享
                  </AtButton>
                ) : (
                  <AtButton
                    type='secondary'
                    size='small'
                    onClick={() => {
                      if (Taro.getStorageSync("ifShare")) {
                        Taro.atMessage({
                          message: "已与其他用户共享，请先结束当前共享",
                          type: "error",
                        });
                      } else {
                        handleShare(contact.contact_user.openid);
                      }
                    }}
                  >
                    发起共享
                  </AtButton>
                )}
              </View>
            </View>
          </AtSwipeAction>
        ))}
      </View>
    </View>
  );
};
export default Friends;
