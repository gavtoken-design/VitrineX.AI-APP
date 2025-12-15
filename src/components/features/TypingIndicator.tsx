import * as React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-1 p-3 bg-surface rounded-2xl rounded-tl-none border border-gray-100 shadow-sm w-fit jelly-on-hover">
      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s] glow-pulse"></div>
      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s] glow-pulse"></div>
      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce glow-pulse"></div>
    </div>
  );
};

export default TypingIndicator;