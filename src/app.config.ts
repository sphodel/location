export default defineAppConfig({
  pages: [
    "pages/index/index",
    "pages/my/index",
    "pages/my/edit/index",
    "pages/my/use/index",
    "pages/my/feedback/index",
    "pages/my/collection/index",
    "pages/index/search/index",
    "pages/my/friends/index",
    "pages/index/route/index",
    "pages/index/detail/index"
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "WeChat",
    navigationBarTextStyle: "black",
  },
  requiredPrivateInfos:[
    "getLocation",
  ]
  ,
  tabBar: {
    list: [
      {
        pagePath: "pages/index/index",
        text: "首页",
        iconPath: "./assets/home/home.png",
        selectedIconPath: "./assets/home/selHome.png",
      },
      {
        pagePath: "pages/my/index",
        text: "我的",
        iconPath: "./assets/my/my.png",
        selectedIconPath: "./assets/my/selMy.png",
      },
    ],
  },
});
