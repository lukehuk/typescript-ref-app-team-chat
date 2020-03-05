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
} from "./MessageDetailsModal.style";
import { AnimatedModal, Modal, Overlay } from "foundations/components/Modal";
import { Breakpoint } from "features/layout/layoutModel";
import { getSelectedMessage } from "./selectors";

const MessageDetailsModal = () => {
  const panels = useSelector(getPanelStates);
  const dispatch = useDispatch();
  const breakpoint = useSelector(getBreakpoint);
  const selectedMessage = useSelector(getSelectedMessage);
  const Panel = breakpoint === Breakpoint.Small ? Modal : AnimatedModal;

  const getDocumentSentiment = (googleNaturalLanguage: any) => {
    if (
      googleNaturalLanguage &&
      googleNaturalLanguage.output &&
      googleNaturalLanguage.output.documentSentiment
    ) {
      return googleNaturalLanguage.output.documentSentiment.score;
    }
    return "No sentiment information available.";
  };

  const getEntityDetails = (googleNaturalLanguage: any): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    if (
      googleNaturalLanguage &&
      googleNaturalLanguage.output &&
      googleNaturalLanguage.output.entities
    ) {
      const entities = googleNaturalLanguage.output.entities;
      entities.forEach((entity: any) => {
        if (entity.metadata && entity.metadata.wikipedia_url) {
          elements.push(
            <li>
              {entity.type}:{" "}
              <a
                title={entity.metadata.wikipedia_url}
                href={entity.metadata.wikipedia_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {entity.name}
              </a>
            </li>
          );
        } else {
          elements.push(
            <li>
              <span>
                {entity.type}: {entity.name}
              </span>
            </li>
          );
        }
      });
    }
    if (elements.length > 0) {
      return elements;
    } else {
      return [<span>No entity information available.</span>];
    }
  };

  return (
    <Overlay displayed={panels.MessageDetailsOverlay}>
      <Panel pose={panels.MessageDetailsOverlay ? "open" : "closed"}>
        <Header>
          <Title>Message Details</Title>
          <CloseButton
            onClick={() => {
              dispatch(setLayoutDefault());
            }}
          >
            <CrossIcon />
          </CloseButton>
        </Header>
        <ScrollView>
          <p>
            <b>Sender</b>: {selectedMessage.sender.name}
          </p>
          <p>
            <b>Timetoken:</b> {selectedMessage.timetoken}
          </p>
          <p>
            <b>Message:</b> {selectedMessage.message.content}
          </p>
          <p>
            <b>Document Sentiment: </b>
            {getDocumentSentiment(
              selectedMessage.message.googleNaturalLanguageV1
            )}
          </p>
          <p>
            <b>Entities extracted: </b>
            <ul>
              {getEntityDetails(
                selectedMessage.message.googleNaturalLanguageV1
              )}
            </ul>
          </p>
        </ScrollView>
      </Panel>
    </Overlay>
  );
};

export { MessageDetailsModal };
