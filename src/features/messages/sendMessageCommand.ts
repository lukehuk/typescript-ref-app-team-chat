import { ThunkAction } from "main/storeTypes";
import { getCurrentConversationId } from "features/currentConversation/currentConversationModel";
import { sendMessage } from "pubnub-redux";
import { getLoggedInUserId } from "features/authentication/authenticationModel";
import { MessageContent } from "./messageModel";

export const sendMessageAction = (message: MessageContent): ThunkAction => {
  return (dispatch, getState) => {
    const state = getState();
    return dispatch(
      sendMessage({
        channel: getCurrentConversationId(state),
        message: {
          ...message,
          sender: getLoggedInUserId(state)
        }
      })
    );
  };
};
