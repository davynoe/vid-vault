interface DownloadingModalProps {
  isOpen: boolean;
  progress: number;
}

interface GetLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string) => void;
}