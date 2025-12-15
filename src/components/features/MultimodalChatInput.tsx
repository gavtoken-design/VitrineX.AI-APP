
import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { PaperAirplaneIcon, MicrophoneIcon, StopCircleIcon } from '@heroicons/react/24/solid';
import SlashCommandPopover from './SlashCommandPopover';

interface Command {
  key: string;
  text: string;
  desc: string;
}

interface MultimodalChatInputProps {
  onSendText: (message: string) => void;
  onStartVoice: () => void;
  onStopVoice: () => void;
  isTextLoading: boolean;
  isVoiceActive: boolean;
  isListening: boolean;
  disabled?: boolean;
  commands?: Command[];
}

const MultimodalChatInput: React.FC<MultimodalChatInputProps> = ({
  onSendText,
  onStartVoice,
  onStopVoice,
  isTextLoading,
  isVoiceActive,
  isListening,
  disabled,
  commands = [],
}) => {
  const [textValue, setTextValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- FASE 2: Slash Command State ---
  const [showCommands, setShowCommands] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState<Command[]>([]);
  const [commandIndex, setCommandIndex] = useState(0);
  const commandPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [textValue]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTextValue(value);

    if (value.startsWith('/') && value.length > 0) {
      const searchTerm = value.substring(1).toLowerCase();
      const matchingCommands = commands.filter(cmd => cmd.key.substring(1).toLowerCase().startsWith(searchTerm));
      setFilteredCommands(matchingCommands);
      setShowCommands(matchingCommands.length > 0);
      setCommandIndex(0);
    } else {
      setShowCommands(false);
    }
  };

  const handleSelectCommand = useCallback((command: Command) => {
    setTextValue(command.text);
    setShowCommands(false);
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommands && filteredCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCommandIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCommandIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSelectCommand(filteredCommands[commandIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowCommands(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!textValue.trim() || isTextLoading || disabled) return;
    onSendText(textValue);
    setTextValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      onStopVoice();
    } else {
      onStartVoice();
    }
  };

  return (
    <div className="relative flex-1">
      {showCommands && (
        <div ref={commandPopoverRef}>
          <SlashCommandPopover
            commands={filteredCommands}
            onSelect={handleSelectCommand}
            selectedIndex={commandIndex}
          />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 bg-surface border border-border rounded-2xl p-2 shadow-soft transition-shadow duration-200 focus-within:shadow-md focus-within:border-gray-300 dark:focus-within:border-primary/50"
      >
        <textarea
          ref={textareaRef}
          value={textValue}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Ouvindo..." : "Digite uma mensagem ou '/' para comandos..."}
          className="w-full bg-transparent text-body placeholder-muted text-base px-3 py-2.5 max-h-[160px] resize-none focus:outline-none"
          rows={1}
          disabled={isTextLoading || disabled || isListening}
        />

        {!isListening && (
          <button
            type="submit"
            disabled={!textValue.trim() || isTextLoading || disabled}
            className={`p-2.5 rounded-xl mb-0.5 transition-all duration-200 flex-shrink-0 ${!textValue.trim() || isTextLoading || disabled
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary/90 shadow-sm'
              }`}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        )}

        <button
          type="button"
          onClick={handleVoiceToggle}
          disabled={disabled && !isListening}
          className={`p-2.5 rounded-xl mb-0.5 transition-all duration-200 flex-shrink-0 ${isListening
              ? 'bg-red-500 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-primary hover:text-white'
            }`}
        >
          {isListening ? (
            <StopCircleIcon className="w-5 h-5" />
          ) : (
            <MicrophoneIcon className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
};

export default MultimodalChatInput;
