

import React from 'react';

interface Command {
  key: string;
  text: string;
  desc: string;
}

interface SlashCommandPopoverProps {
  commands: Command[];
  onSelect: (command: Command) => void;
  selectedIndex: number;
}

const SlashCommandPopover: React.FC<SlashCommandPopoverProps> = ({ commands, onSelect, selectedIndex }) => {
  if (commands.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-surface border border-border rounded-xl shadow-lg p-2 max-h-60 overflow-y-auto z-10 animate-slide-in-from-bottom duration-200">
      <p className="text-xs font-semibold text-muted px-2 pb-1.5 border-b border-border">COMANDOS RÁPIDOS</p>
      <ul className="mt-1">
        {commands.map((cmd, index) => (
          <li key={cmd.key}>
            <button
              onClick={() => onSelect(cmd)}
              className={`w-full text-left p-2 rounded-md flex items-center justify-between transition-colors ${
                index === selectedIndex ? 'bg-primary/10' : 'hover:bg-background'
              }`}
            >
              <div>
                <span className="font-semibold text-sm text-title">{cmd.key}</span>
                <span className="text-xs text-muted ml-2">{cmd.desc}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SlashCommandPopover;
