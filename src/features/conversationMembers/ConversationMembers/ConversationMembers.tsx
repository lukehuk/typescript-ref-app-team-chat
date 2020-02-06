import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { getBreakpoint, getPanelStates } from "features/layout/selectors";
import { Breakpoint } from "features/layout/layoutModel";
import { getUsersById, UsersIndexedById } from "features/users/userModel";
import {
  getUsersByConversationId,
  MembershipHash
} from "../conversationMemberModel";
import {
  ConversationPresence,
  getPresenceByConversationId
} from "features/memberPresence/memberPresenceModel";
import { MemberDescription, UserFragment } from "../MemberDescription";
import { getCurrentConversationId } from "features/currentConversation/currentConversationModel";
import { setLayoutDefault } from "features/layout/actions";
import { Cross as CrossIcon } from "foundations/components/icons/Cross";
import { Back as BackIcon } from "foundations/components/icons/Back";
import {
  AnimatedWrapper,
  BackIconWrapper,
  CloseIcon,
  Header,
  ScrollableView,
  Title,
  Wrapper
} from "./ConversationMembers.style";
import { fetchHereNow, fetchMembers } from "pubnub-redux";
import { usePubNub } from "pubnub-react";

export const getCurrentConversationMembers = createSelector(
  [
    getUsersById,
    getCurrentConversationId,
    getUsersByConversationId,
    getPresenceByConversationId
  ],
  (
    users: UsersIndexedById,
    conversationId: string,
    conversationMemberships: MembershipHash,
    conversationPresence: ConversationPresence
  ): UserFragment[] => {
    let presence = conversationPresence[conversationId];
    return conversationMemberships[conversationId]
      ? conversationMemberships[conversationId].map(user => {
          return {
            ...users[user.id],
            presence: presence
              ? presence.occupants.filter(occupant => {
                  return occupant.uuid === user.id;
                }).length > 0
              : false
          };
        })
      : [];
  }
);

const orderByPresence = (members: UserFragment[]) => {
  return members.sort((userA, userB) =>
    userA.presence === userB.presence ? 0 : userA.presence ? -1 : 1
  );
};
const ConversationMembers = () => {
  const members: UserFragment[] = useSelector(getCurrentConversationMembers);
  const currentConversationId = useSelector(getCurrentConversationId);
  const dispatch = useDispatch();
  const pubnub = usePubNub();
  const panels = useSelector(getPanelStates);
  const breakpoint = useSelector(getBreakpoint);
  const Panel = breakpoint === Breakpoint.Small ? Wrapper : AnimatedWrapper;

  useEffect(() => {
    if (members.length === 0) {
      dispatch(
        fetchMembers({
          spaceId: currentConversationId,
          include: {
            userFields: true,
            customUserFields: true,
            totalCount: false
          }
        })
      );

      dispatch(
        fetchHereNow({
          channels: [currentConversationId]
        })
      );
    }
  }, [members, currentConversationId, pubnub, dispatch]);

  return (
    <Panel pose={panels.Right ? "open" : "closed"}>
      <Header>
        <Title>
          <BackIconWrapper
            onClick={() => {
              dispatch(setLayoutDefault());
            }}
          >
            <BackIcon />
          </BackIconWrapper>
          Members
        </Title>
        <CloseIcon
          onClick={() => {
            dispatch(setLayoutDefault());
          }}
        >
          <CrossIcon />
        </CloseIcon>
      </Header>
      <ScrollableView>
        {orderByPresence(members).map(user => (
          <MemberDescription user={user} key={user.id} />
        ))}
      </ScrollableView>
    </Panel>
  );
};

export { ConversationMembers };
