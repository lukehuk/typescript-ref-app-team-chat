import React, { ReactNode } from "react";
import { UserInitialsAvatar } from "foundations/components/UserInitialsAvatar";
import convertTimestampToTime from "foundations/utilities/convertTimestampToTime";
import {
  Avatar,
  Body,
  Content,
  Header,
  SenderName,
  TimeSent,
  Wrapper
} from "./Message.style";

export interface MessageFragment {
  sender: {
    id: string;
    name: string;
  };
  timetoken: string;
  message: {
    type: string;
    content: string;
    [x: string]: any;
  };
}

interface MessageProps {
  message: MessageFragment;
  avatar?: ReactNode;
}

const Message = ({ message, avatar }: MessageProps) => {
  /*
    TODO: THere is a bug here.  The message sender may not be loaded here due to errors in timing.
    But, usually, it does get loaded when the members in the conversation get loaded.
  if (message.message.sender === undefined) {
    return null;
  }
  */

  function getNaturalLanguageOutput(message: MessageFragment) {
    if (
      message.message.googleNaturalLanguageV1 &&
      message.message.googleNaturalLanguageV1.output
    ) {
      return message.message.googleNaturalLanguageV1.output;
    }
  }

  function getTitle(message: MessageFragment) {
    const naturalLanguageOutput = getNaturalLanguageOutput(message);
    if (naturalLanguageOutput) {
      return JSON.stringify(naturalLanguageOutput);
    }
    return "";
  }

  return (
    <Wrapper>
      <Avatar>
        {avatar ? (
          avatar
        ) : (
          <UserInitialsAvatar
            size={36}
            name={(message.sender && message.sender.name) || "NA"}
            uuid={(message.sender && message.sender.id) || "NA"}
          />
        )}
      </Avatar>
      <Body>
        <Header>
          <SenderName>{message.sender.name}</SenderName>
          <TimeSent>{convertTimestampToTime(message.timetoken)}</TimeSent>
        </Header>
        <Content title={getTitle(message)}>{message.message.content}</Content>
      </Body>
    </Wrapper>
  );
};

export { Message };
