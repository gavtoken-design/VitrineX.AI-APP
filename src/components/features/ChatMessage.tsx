
import * as React from 'react';
import { useState } from 'react';
import { ChatMessage as ChatMessageType } from '../../types';
import { SparklesIcon, UserIcon, ClipboardDocumentIcon, WrenchScrewdriverIcon, SpeakerWaveIcon, ArrowDownTrayIcon, ShareIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface ChatMessageProps {
  message: ChatMessageType;
  onSpeak?: (text: string) => void;
  onDownload?: (text: string) => void;
  onShare?: (text: string) => void;
  onViewArtifact?: (index: number) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSpeak, onDownload, onShare, onViewArtifact }) => {
  const isUser = message.role === 'user';
  const isTool = message.role === 'tool';
  const [isPlaying, setIsPlaying] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    if (onShare) onShare(message.text); // Trigger toast externally if needed
  };

  const handleSpeak = () => {
    if (onSpeak) {
      setIsPlaying(!isPlaying); // Simple toggle visual state, actual audio logic in parent
      onSpeak(message.text);
    }
  };

  const renderMessageContent = () => {
    if (isUser || !onViewArtifact) {
      return message.text;
    }

    const artifactRegex = /\[ARTIFACT\|(\d+)\|([^\]]+)\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = artifactRegex.exec(message.text)) !== null) {
      const [fullMatch, indexStr, title] = match;
      const index = parseInt(indexStr, 10);
      const startIndex = match.index;

      // Add text before artifact
      if (startIndex > lastIndex) {
        parts.push(message.text.substring(lastIndex, startIndex));
      }

      // Add artifact button
      parts.push(
        <button
          key={`artifact-${index}`}
          onClick={() => onViewArtifact(index)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 mx-1 my-1 bg-surface border border-primary/30 rounded-lg text-primary text-xs font-semibold hover:bg-primary/5 transition-all shadow-sm group/btn align-middle"
        >
          <DocumentTextIcon className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
          <span>{title}</span>
        </button>
      );

      lastIndex = startIndex + fullMatch.length;
    }

    // Add remaining text
    if (lastIndex < message.text.length) {
      parts.push(message.text.substring(lastIndex));
    }

    if (parts.length === 0) return message.text;

    return <>{parts}</>;
  };

  if (isTool) {
    return (
      <div className="flex w-full justify-center mb-4">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full text-xs text-muted border border-gray-200 dark:border-gray-700 animate-pulse">
          <WrenchScrewdriverIcon className="w-3.5 h-3.5" />
          <span className="font-mono">{message.text}</span>
          {message.toolCall && (
            <span className="text-[10px] opacity-70 hidden sm:inline">
              ({JSON.stringify(message.toolCall.args).substring(0, 30)}...)
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 group message-fade-in`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border ${isUser
          ? 'bg-primary text-white border-primary'
          : 'bg-white text-primary border-gray-200 shadow-sm'
          }`}>
          {isUser ? (
            <UserIcon className="w-4 h-4" />
          ) : (
            <SparklesIcon className="w-4 h-4" />
          )}
        </div>

        {/* Message Bubble */}
        <div className="flex flex-col max-w-full">
          <div
            className={`relative px-5 py-4 rounded-2xl shadow-sm text-[15px] leading-relaxed border ${isUser
              ? 'bg-primary text-white border-primary rounded-tr-sm'
              : 'bg-surface text-body border-gray-100 rounded-tl-sm'
              }`}
          >
            {message.attachment && (
              <div className="mb-3 rounded-lg overflow-hidden border border-white/20">
                <img
                  src={message.attachment.data}
                  alt={message.attachment.name}
                  className="max-w-full h-auto object-cover max-h-[300px]"
                />
              </div>
            )}
            <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 whitespace-pre-wrap" style={{ color: isUser ? 'white' : 'inherit' }}>
              {renderMessageContent()}
            </div>
          </div>

          {/* Action Toolbar for AI Messages */}
          {!isUser && (
            <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleSpeak}
                className={`p-1.5 rounded-md transition-colors ${isPlaying ? 'text-primary bg-primary/10' : 'text-muted hover:text-primary hover:bg-gray-100'}`}
                title="Ouvir (TTS)"
              >
                <SpeakerWaveIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDownload && onDownload(message.text)}
                className="p-1.5 text-muted hover:text-primary hover:bg-gray-100 rounded-md transition-colors"
                title="Baixar Texto (.txt)"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopy}
                className="p-1.5 text-muted hover:text-primary hover:bg-gray-100 rounded-md transition-colors"
                title="Copiar/Compartilhar"
              >
                <ClipboardDocumentIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Timestamp */}
          <span className={`text-[10px] text-muted mt-1 font-medium ${isUser ? 'text-right' : 'text-left'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;