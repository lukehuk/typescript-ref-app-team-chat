import { ThunkAction } from "main/storeTypes";
import { leaveSpaces } from "pubnub-redux";
import {
  DEFAULT_CONVERSATION,
  focusOnConversation
} from "features/currentConversation/currentConversationModel";

export const leaveConversation = (
  userId: string,
  conversationId: string
): ThunkAction<Promise<void>> => {
  return (dispatch, getState, context) => {
    if (conversationId === DEFAULT_CONVERSATION) {
      return Promise.resolve();
    }
    return dispatch(
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
  };
};
