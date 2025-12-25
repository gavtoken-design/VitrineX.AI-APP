import * as React from 'react';
import { useMediaActions } from '../../hooks/useMediaActions';
import Button from '../ui/Button';
import { ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline';

interface MediaActionsToolbarProps {
  mediaUrl: string | null;
  fileName: string;
  shareTitle?: string;
  shareText?: string;
}

const MediaActionsToolbar: React.FC<MediaActionsToolbarProps> = ({
  mediaUrl,
  fileName,
  shareTitle = "Criativo da VitrineX AI",
  shareText = "Confira este criativo que gerei com a VitrineX AI!",
}) => {
  const { handleDownload, handleShare, handleSaveToDrive, isProcessing } = useMediaActions();

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={() => mediaUrl && handleDownload(mediaUrl, fileName)}
        variant="primary"
        className="w-full sm:w-auto"
        disabled={!mediaUrl || isProcessing}
        isLoading={isProcessing}
      >
        <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
        Baixar
      </Button>
      <Button
        onClick={() => mediaUrl && handleShare(mediaUrl, shareTitle, shareText)}
        variant="secondary"
        className="w-full sm:w-auto"
        disabled={!mediaUrl || isProcessing}
        isLoading={isProcessing}
      >
        <ShareIcon className="w-4 h-4 mr-2" />
        Compartilhar
      </Button>
      <Button
        onClick={() => mediaUrl && handleSaveToDrive(mediaUrl, fileName)}
        variant="outline"
        className="w-full sm:w-auto border-white/10 text-white/70 hover:text-white"
        disabled={!mediaUrl || isProcessing}
        isLoading={isProcessing}
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
        </svg>
        Salvar no Drive
      </Button>
    </div>
  );
};

export default MediaActionsToolbar;