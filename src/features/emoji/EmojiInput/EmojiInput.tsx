import "emoji-mart/css/emoji-mart.css";
import React, { useCallback, useRef, useState } from "react";
import useClickOutside from "foundations/hooks/useClickOutside";
import { EmojiData, Picker } from "emoji-mart";
import { FunnyEmoji } from "foundations/components/icons/FunnyEmoji";
import { Dialog, EmojiButton } from "./EmojiInput.style";

interface EmojiInputProps {
  value: string;

  onSelection(contentWithEmoji: string): any;
}

const EmojiInput = ({ value, onSelection }: EmojiInputProps) => {
  const [showPicker, setPickerState] = useState(false);
  const picker = useRef<HTMLDivElement>(null);

  const dismissPicker = useCallback(() => {
    setPickerState(false);
  }, [setPickerState]);

  useClickOutside([picker], dismissPicker);

  const togglePicker = () => {
    setPickerState(!showPicker);
  };

  const addEmoji = (emoji: EmojiData) => {
    if ("native" in emoji) {
      onSelection(`${value}${emoji.native}`);
      dismissPicker();
    }
  };

  return (
    <div ref={picker}>
      <Dialog>
        {showPicker && (
          <Picker native={true} emoji="" title="" onSelect={addEmoji} />
        )}
      </Dialog>
      <EmojiButton onClick={togglePicker}>
        <FunnyEmoji />
      </EmojiButton>
    </div>
  );
};

export { EmojiInput };
