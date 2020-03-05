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
import { useDispatch } from "react-redux";
import { setLayoutMessageDetailsOverlay } from "../../layout/actions";
import { setSelectedMessage } from "../../messageDetails/selectedMessageModel";

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
  const dispatch = useDispatch();
  const openMessageDetailsOverlay = (message: MessageFragment) => {
    dispatch(setSelectedMessage(message));
    dispatch(setLayoutMessageDetailsOverlay());
  };

  return (
    <Wrapper>
      <Avatar>
        {avatar ? (
          avatar
        ) : (
          <UserInitialsAvatar
            size={36}
            name={message.sender.name}
            uuid={message.sender.id}
          />
        )}
      </Avatar>
      <Body>
        <Header>
          <SenderName>{message.sender.name}</SenderName>
          <TimeSent>{convertTimestampToTime(message.timetoken)}</TimeSent>
        </Header>
        <Content
          title="Click for more information!"
          onClick={() => openMessageDetailsOverlay(message)}
        >
          {message.message.content}
        </Content>
      </Body>
    </Wrapper>
  );
};

export { Message };
