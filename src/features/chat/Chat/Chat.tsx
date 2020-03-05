import React from "react";
import { Wrapper } from "./ChatUI.style";
import { Menu } from "features/chat/Menu/Menu";
import { CurrentConversation } from "features/currentConversation/CurrentConversation/CurrentConversation";
import { ConversationMembers } from "features/conversationMembers/ConversationMembers/ConversationMembers";
import { JoinConversationModal } from "features/joinedConversations/JoinConversationModal/JoinConversationModal";
import { ChangeThemeModal } from "features/theme/ChangeThemeModal";
import { MessageDetailsModal } from "../../messageDetails/MessageDetailsModal";

const ChatUI = () => {
  return (
    <Wrapper>
      <Menu />
      <CurrentConversation />
      <ConversationMembers />
      <JoinConversationModal />
      <ChangeThemeModal />
      <MessageDetailsModal />
    </Wrapper>
  );
};

export { ChatUI };
