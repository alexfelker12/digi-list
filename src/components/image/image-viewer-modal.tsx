import { Modal, useWindowDimensions } from 'react-native';
import { ImageViewer, ImageViewerProps } from './image-viewer';


interface ImageViewerModalProps extends ImageViewerProps {
  visible: boolean
}
export function ImageViewerModal({ visible, onClose, ...props }: ImageViewerModalProps) {
  const { width, height } = useWindowDimensions()

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <ImageViewer
        onClose={onClose}
        containerDimensions={{ width, height }}
        {...props}
      />
    </Modal>
  );
}
