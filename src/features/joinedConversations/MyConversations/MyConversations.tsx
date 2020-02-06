import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import {
  focusOnConversation,
  getCurrentConversationId
} from "features/currentConversation/currentConversationModel";
import { setLayoutDefault, setLayoutOverlay } from "features/layout/actions";
import {
  getConversationsByUserId,
  MembershipHash
} from "../joinedConversationModel";
import {
  ConversationsIndexedById,
  getConversationsById
} from "features/conversations/conversationModel";
import { getLoggedInUserId } from "features/authentication/authenticationModel";
import { Add } from "foundations/components/icons/Add";
import { ConversationItem } from "../ConversationItem";
import {
  AddButton,
  ConversationList,
  Title,
  Wrapper
} from "./MyConversations.style";
import { fetchMembers, fetchSpaces } from "pubnub-redux";
import { getCurrentConversationMembers } from "features/conversationMembers/ConversationMembers/ConversationMembers";
import { UserFragment } from "features/conversationMembers/MemberDescription/MemberDescription";
import { leaveConversation } from "../leaveConversationCommand";

export interface ConversationFragment {
  id: string;
  name: string;
}

export const getJoinedConversations = createSelector(
  [getConversationsById, getLoggedInUserId, getConversationsByUserId],
  (
    conversations: ConversationsIndexedById,
    userId: string,
    userConversations: MembershipHash
  ): ConversationFragment[] => {
    return userConversations[userId]
      ? userConversations[userId].map(conversation => {
          return {
            id: conversation.id,
            name: conversations[conversation.id].name
          };
        })
      : [];
  }
);

const MyConversations = () => {
  const currentUserId = useSelector(getLoggedInUserId);
  const conversationsById = useSelector(getConversationsById);
  const conversations: ConversationFragment[] = useSelector(
    getJoinedConversations
  );
  const currentConversationId: string = useSelector(getCurrentConversationId);
  const members: UserFragment[] = useSelector(getCurrentConversationMembers);

  const dispatch = useDispatch();
  const openOverlay = () => {
    dispatch(fetchSpaces());
    dispatch(setLayoutOverlay());
  };

  if (conversationsById === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <Wrapper>
      <Title>
        Conversations
        <AddButton onClick={openOverlay}>
          <Add />
        </AddButton>
      </Title>
      <ConversationList>
        {conversations.map(conversation => (
          <ConversationItem
            id={conversation.id}
            name={conversation.name}
            onLeave={() => {
              dispatch(leaveConversation(currentUserId, conversation.id));
            }}
            selected={conversation.id === currentConversationId}
            key={conversation.id}
            unreadMessageCount={0}
            onClick={() => {
              dispatch(focusOnConversation(conversation.id));
              dispatch(setLayoutDefault());

              if (members.length === 0) {
                dispatch(
                  fetchMembers({
                    spaceId: conversation.id,
                    include: {
                      userFields: true,
                      customUserFields: true,
                      totalCount: false
                    }
                  })
                );
              }
            }}
          ></ConversationItem>
        ))}
      </ConversationList>
    </Wrapper>
  );
};

export { MyConversations };
