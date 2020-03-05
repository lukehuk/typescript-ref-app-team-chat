import { AppActions } from "main/AppActions";
import { MessageFragment } from "../currentConversation/Message";

export const SET_SELECTED_MESSAGE = "SET_SELECTED_MESSAGE";

export interface setSelectedMessageAction {
  type: typeof SET_SELECTED_MESSAGE;
  payload: MessageFragment;
}

export const setSelectedMessage = (
  target: MessageFragment
): setSelectedMessageAction => {
  return {
    type: SET_SELECTED_MESSAGE,
    payload: target
  };
};

interface SelectedMessageState {
  selectedMessage: MessageFragment;
}

const initialState: SelectedMessageState = {
  selectedMessage: {
    sender: {
      id: "",
      name: ""
    },
    timetoken: "",
    message: {
      type: "",
      content: ""
    }
  }
};

const SelectedMessageStateReducer = (
  state: SelectedMessageState = initialState,
  action: AppActions
): SelectedMessageState => {
  if (action.type === SET_SELECTED_MESSAGE) {
    return { ...state, selectedMessage: action.payload };
  }
  return state;
};

export { SelectedMessageStateReducer };
