import { Button, Form, Input, Textarea, View } from "@tarojs/components";
import { useState } from "react";
import './index.less'

const Feedback = () => {
  const [content,setContent]=useState("")
  const [contact,setContact]=useState("")
  return (
    <View class='opinion_wrap'>
      <Form bindsubmit='formSubmit'>
        <View class='content_wrap'>
          <View class='content'>
            <Textarea
              name='opinion'
              maxlength={50}
              value={content}
              auto-height
              placeholder-class='placeholder'
              placeholder='期待您的反馈，我们将会不断改进（50字以内）'
              onInput={(e)=>setContent(e.detail.value)}
            />
          </View>
        </View>
        <Button
          formType='submit'
          hover-class='button_active'
        >
          提交
        </Button>
      </Form>
    </View>
  );
};
export default Feedback;
