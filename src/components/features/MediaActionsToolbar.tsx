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
  const { handleDownload, handleShare, isProcessing } = useMediaActions();

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
    </div>
  );
};

export default MediaActionsToolbar;