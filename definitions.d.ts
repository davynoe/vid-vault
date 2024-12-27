interface DownloadingModalProps {
  isOpen: boolean;
}

interface GetLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string) => void;
}