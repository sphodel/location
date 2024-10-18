import Taro from '@tarojs/taro';

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

export const initializeAuth = async () => {
  if (isInitialized) return;

  if (initializationPromise) {
    await initializationPromise;
    return;
  }

  initializationPromise = new Promise<void>(async (resolve) => {
    try {
      const loginRes = await Taro.login();
      if (loginRes.code) {
        const openIdRes = await Taro.request({
          url: "https://local-share-api.lighthx.xyz/api/getOpenId",
          method: "GET",
          data: { code: loginRes.code },
        });

        const openid = openIdRes.data.openid;
        if (Taro.getStorageSync("openid") === "" || openid !== Taro.getStorageSync("openid")) {
          Taro.setStorageSync("openid", openid);
        }

        const tokenRes = await Taro.request({
          url: "https://local-share-api.lighthx.xyz/login",
          method: "POST",
          data: { openid },
        });

        Taro.setStorageSync("token", tokenRes.data.token);
      }
    } catch (error) {
      console.error('Authentication initialization failed:', error);
    } finally {
      isInitialized = true;
      resolve();
    }
  });

  await initializationPromise;
};
