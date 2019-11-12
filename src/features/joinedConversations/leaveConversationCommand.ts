import { ThunkAction } from "main/storeTypes";
import { leaveSpaces } from "pubnub-redux";
import {
  focusOnConversation,
  DEFAULT_CONVERSATION
} from "features/currentConversation/currentConversationStore";

export const leaveConversation = (
  userId: string,
  conversationId: string
): ThunkAction<Promise<void>> => {
  return (dispatch, getState, context) => {
    if (conversationId === DEFAULT_CONVERSATION) {
      return Promise.resolve();
    }
    const done = dispatch(
      leaveSpaces({
        userId: userId,
        spaces: [{ id: conversationId }]
      })
    ).then(() => {
      context.pubnub.api.unsubscribe({
        channels: [conversationId]
      });
      dispatch(focusOnConversation(DEFAULT_CONVERSATION));
    });

    return done;
  };
};