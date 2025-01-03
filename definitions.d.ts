interface DownloadingModalProps {
  isOpen: boolean;
  progress: number;
}

interface GetLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string) => void;
}

interface VideoData {
  id: string;
  title: string;
  uploader: string;
  description: string;
}

interface PlayerParams {
  uri: string;
  duration: number;
  id: string;
  title: string;
  uploader: string;
  description: string;
};