import { AppState } from "main/storeTypes";
import { createSelector } from "reselect";
import { createMessageReducer, Message as PubNubMessage } from "pubnub-redux";

export interface MessageContent {
  type: string;
  content: string;
  [x: string]: any;
}

export interface MessageBody {
  sender: string;
  type: string;
  content: string;
}

export type Message = Required<
  Pick<PubNubMessage, "channel" | "message" | "timetoken">
> & {
  message: MessageBody;
};

const getMessagesSlice = (state: AppState) => state.messages;

export const getMessagesById = createSelector([getMessagesSlice], messages => {
  return messages.byId;
});

const MessageStateReducer = createMessageReducer<Message>();
export { MessageStateReducer };
