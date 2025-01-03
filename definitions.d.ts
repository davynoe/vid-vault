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

interface VideoAssetInfo {
  uri: string;
  id: string;
  duration: number;
}

interface PlayerParams {
  uri: string;
  duration: number;
  id: string;
  title: string;
  uploader: string;
  description: string;
};