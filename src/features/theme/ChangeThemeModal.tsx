import React from "react";
import { getBreakpoint, getPanelStates } from "features/layout/selectors";
import { useDispatch, useSelector } from "react-redux";
import { setLayoutDefault } from "features/layout/actions";
import { Cross as CrossIcon } from "foundations/components/icons/Cross";
import {
  CloseButton,
  Header,
  ScrollView,
  Title
} from "./ChangeThemeModal.style";
import { AnimatedModal, Modal, Overlay } from "foundations/components/Modal";
import { Breakpoint } from "features/layout/layoutModel";
import ColorPicker from "./ColorPicker";
import LogoPicker from "./LogoPicker";

const ChangeThemeModal = () => {
  const panels = useSelector(getPanelStates);
  const dispatch = useDispatch();
  const breakpoint = useSelector(getBreakpoint);
  const Panel = breakpoint === Breakpoint.Small ? Modal : AnimatedModal;

  return (
    <Overlay displayed={panels.ThemeOverlay}>
      <Panel pose={panels.ThemeOverlay ? "open" : "closed"}>
        <Header>
          <Title>Modify Theme</Title>
          <CloseButton
            onClick={() => {
              dispatch(setLayoutDefault());
            }}
          >
            <CrossIcon />
          </CloseButton>
        </Header>
        <ScrollView>
          <ColorPicker
            propertyName="Accent color 1"
            property="--accent-color-1"
          />
          <ColorPicker
            propertyName="Accent color 2"
            property="--accent-color-2"
          />
          <ColorPicker
            propertyName="Accent color 3"
            property="--accent-color-3"
          />
          <ColorPicker
            propertyName="Accent color 4"
            property="--accent-color-4"
          />
          <ColorPicker
            propertyName="Accent color 5"
            property="--accent-color-5"
          />
          <LogoPicker propertyName="Logo URL" property="--logo-content" />
        </ScrollView>
      </Panel>
    </Overlay>
  );
};

export { ChangeThemeModal };
