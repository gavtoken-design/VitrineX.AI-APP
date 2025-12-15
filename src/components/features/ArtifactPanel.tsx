
import * as React from 'react';
import { XMarkIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import { useToast } from '../../contexts/ToastContext';

interface ArtifactPanelProps {
  isOpen: boolean;
  onClose: () => void;
  artifact: { title: string; content: string } | null;
}

const ArtifactPanel: React.FC<ArtifactPanelProps> = ({ isOpen, onClose, artifact }) => {
  const { addToast } = useToast();

  const handleCopy = () => {
    if (artifact?.content) {
      navigator.clipboard.writeText(artifact.content);
      addToast({ type: 'success', message: 'Conteúdo do artefato copiado!' });
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-surface border-l border-border z-50 transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        w-full md:w-2/5 lg:w-1/3 shadow-2xl`}
    >
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <h3 className="text-lg font-semibold text-title truncate">
          {artifact?.title || 'Artefato'}
        </h3>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-background">
          <XMarkIcon className="w-5 h-5 text-muted" />
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-background/50">
        <pre className="text-sm text-body whitespace-pre-wrap font-sans">
          {artifact?.content}
        </pre>
      </div>

      <div className="p-4 bg-surface border-t border-border flex-shrink-0">
        <Button onClick={handleCopy} variant="primary" className="w-full">
          <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
          Copiar Conteúdo
        </Button>
      </div>
    </div>
  );
};

export default ArtifactPanel;
