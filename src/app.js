import "taro-ui/dist/style/index.scss";
import { Provider } from 'react-redux';
import { Component } from "react";
import { initializeAuth } from "@/store/auth";
import store from "../src/store/store";
import "./app.less";

class App extends Component {
  componentDidMount() {
    initializeAuth().catch((error)=>{
      console.error('Authentication initialization failed:', error);
    })
  }

  render() {
    return <Provider store={store}>{this.props.children}</Provider>;
  }
}

export default App;
