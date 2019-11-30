import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EmojiInput } from "features/emoji/EmojiInput/EmojiInput";
import { EmojiSuggestion } from "features/emoji/EmojiSuggestion/EmojiSuggestion";
import { Wrapper, Container, TextArea } from "./MessageInput.style";
import { sendMessageAction } from "features/messages/sendMessageCommand";
import {
  getCurrentConversationId,
  getConversationMessageInputValue
} from "../currentConversationModel";
import { updateConversationMessageInputValueAction } from "features/currentConversation/currentConversationModel";
import ReactFlagsSelect from "react-flags-select";
import "react-flags-select/css/react-flags-select.css";
import "./flagsselect.css";

//Set to false to hide translation
const translateEnabled = true;

const emptyMessage = "";
const emptyTranslationModel = "";

const autoExpand = (el: HTMLTextAreaElement) => {
  setTimeout(function() {
    el.style.cssText = "height:auto; padding:0";
    el.style.cssText = "height:" + el.scrollHeight + "px";
  }, 0);
};

const cleanMessage = (message: string) => message.trim();

type MessageFragment<message = string> = [message, (setTo: message) => void];
type TranslationFragment<translationModel = string> = [
  translationModel,
  (setTo: translationModel) => void
];

const MessageInput = () => {
  const [message, setMessage]: MessageFragment = useState(emptyMessage);
  const [translationModel, setTranslationModel]: TranslationFragment = useState(
    emptyTranslationModel
  );
  const conversationId: string = useSelector(getCurrentConversationId);
  const textareaRef = useRef<HTMLTextAreaElement>(
    document.createElement("textarea")
  );
  const conversationMessageInputValue: string = useSelector(
    getConversationMessageInputValue
  );

  const dispatch = useDispatch();

  const changed = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    dispatch(
      updateConversationMessageInputValueAction(conversationId, e.target.value)
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && cleanMessage(message) !== "") {
      send();
      e.preventDefault();
    }
    autoExpand(e.target as HTMLTextAreaElement);
  };

  const send = () => {
    dispatch(
      sendMessageAction({
        type: "text",
        body: cleanMessage(translationModel + message)
      })
    );
    dispatch(
      updateConversationMessageInputValueAction(conversationId, emptyMessage)
    );
    setMessage(emptyMessage);
  };

  useEffect(() => {
    setMessage(conversationMessageInputValue);
    autoExpand(textareaRef.current);
  }, [conversationId, conversationMessageInputValue]);

  return (
    <Wrapper>
      <EmojiSuggestion
        value={message}
        onSelection={messageWithEmoji => {
          setMessage(messageWithEmoji);
        }}
      />
      <Container>
        <TextArea
          ref={textareaRef}
          rows={1}
          value={message}
          onChange={changed}
          onKeyPress={handleKeyPress}
          placeholder="Type Message"
        />
        <ReactFlagsSelect
          countries={["GB", "FR", "ES", "DE", "IT"]}
          placeholder="Translate"
          showOptionLabel={false}
          selectedSize={14}
          optionsSize={30}
          showSelectedLabel={false}
          defaultCountry={translateEnabled ? undefined : "GB"}
          disabled={!translateEnabled}
          onSelect={countryCode => {
            if (countryCode === "GB") {
              setTranslationModel("");
            } else {
              setTranslationModel("[EN-" + countryCode + "]");
            }
          }}
        />
        <EmojiInput
          value={message}
          onSelection={messageWithEmoji => {
            setMessage(messageWithEmoji);
          }}
        />
      </Container>
    </Wrapper>
  );
};

export { MessageInput };
