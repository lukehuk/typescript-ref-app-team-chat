import React, { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Breakpoint } from "features/layout/layoutModel";
import { getPanelStates, getBreakpoint } from "features/layout/selectors";
import { MyUserDetails } from "features/currentUser/MyUserDetails/MyUserDetails";
import { MyConversations } from "features/joinedConversations/MyConversations/MyConversations";
import {
  Wrapper,
  AnimatedWrapper,
  Logo,
  BrushButton,
  BrushContainer
} from "./Menu.style";
import { setLayoutThemeOverlay } from "features/layout/actions";
import { Brush } from "foundations/components/icons/Brush";

const Menu = () => {
  const panel = useRef<HTMLElement>(null);
  const panels = useSelector(getPanelStates);
  const breakpoint = useSelector(getBreakpoint);
  const Panel = breakpoint === Breakpoint.Small ? Wrapper : AnimatedWrapper;
  const dispatch = useDispatch();
  const openThemeOverlay = () => {
    dispatch(setLayoutThemeOverlay());
  };
  return (
    <Panel ref={panel} pose={panels.Left ? "open" : "closed"}>
      <Logo id="logo" alt="Company logo" />
      <MyUserDetails />
      <MyConversations />
      <BrushContainer>
        <BrushButton onClick={openThemeOverlay}>
          <Brush />
        </BrushButton>
      </BrushContainer>
    </Panel>
  );
};

export { Menu };
