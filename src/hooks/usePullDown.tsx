import {
  usePullDownRefresh,
  getCurrentPages,
  reLaunch,
  redirectTo,
} from '@tarojs/taro';

const usePullDown = () => {
  usePullDownRefresh(() => {
    const urlLength = getCurrentPages().length - 1;
    const currentUrl = String(getCurrentPages()[urlLength].$taroPath);
    if (currentUrl.startsWith('pages/my')) {
      redirectTo({
        url: `/${currentUrl}`,
      });
    } else {
      reLaunch({
        url: `/${currentUrl}`,
      });
    }
  });
};

export default usePullDown;
