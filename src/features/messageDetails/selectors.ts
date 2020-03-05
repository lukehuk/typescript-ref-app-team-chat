import { createSelector } from "reselect";
import { AppState } from "main/storeTypes";

const getSelectedMessageSlice = (state: AppState) => state.selectedMessage;

export const getSelectedMessage = createSelector(
  [getSelectedMessageSlice],
  (app: ReturnType<typeof getSelectedMessageSlice>) => {
    return app.selectedMessage;
  }
);
