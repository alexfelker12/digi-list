// components/ImageGalleryView.tsx
import { getDisplayUri } from "@/lib/utils";
import { Image } from "expo-image";
import { Button, cn } from "heroui-native";
import { XIcon } from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
import { View } from "react-native";
import Gallery, { GalleryRef } from "react-native-awesome-gallery";
import { Icon } from "../icon";


export interface ImageViewerProps {
  uris: string[]
  initialIndex?: number
  onClose?: () => void
  headerComponent?: React.ReactNode
  footerComponent?: React.ReactNode
  containerDimensions?: {
    width: number
    height: number
  }
}
export function ImageViewer({
  uris,
  initialIndex = 0,
  onClose,
  headerComponent,
  footerComponent,
  containerDimensions
}: ImageViewerProps) {
  const galleryRef = useRef<GalleryRef>(null)
  const [activeIndex, setActiveIndex] = useState(initialIndex)

  const renderItem = useCallback(({
    item,
    setImageDimensions
  }: {
    item: string;
    setImageDimensions: (d: { width: number; height: number }) => void
  }) => (
    <Image
      source={{ uri: getDisplayUri(item) }}
      style={{ flex: 1 }} // expo image does not properly propagate flex through className
      className="absolute inset-0 py-safe-offset-2"
      contentFit="contain"
      onLoad={(e) => setImageDimensions({ width: e.source.width, height: e.source.height })}
    />
  ), [])

  return (
    <View className="flex-1 bg-black">
      {/* header */}
      <View className="absolute top-safe-offset-8 left-0 right-0 z-10 px-4 items-end">
        {headerComponent ?? (onClose && (
          <Button onPress={onClose} hitSlop={16} size="sm" variant="ghost" className="bg-white/25" isIconOnly>
            <Icon icon={XIcon} className="text-white" />
          </Button>
        ))}
      </View>

      <Gallery
        ref={galleryRef}
        data={uris}
        initialIndex={initialIndex}
        renderItem={renderItem}
        keyExtractor={(item, i) => `${item}-${i}`}
        onSwipeToClose={onClose}
        onIndexChange={setActiveIndex}
        loop={false}
        containerDimensions={containerDimensions}
      />

      {/* pagination */}
      {uris.length > 1 && (
        <View className="absolute bottom-12 w-full flex-row justify-center gap-1.5" pointerEvents="none">
          {uris.map((_, i) => (
            <View
              key={i}
              className={cn(
                "size-2 rounded-full",
                i === activeIndex ? "bg-white" : "bg-white/35"
              )}
            />
          ))}
        </View>
      )}

      {/* footer */}
      {footerComponent && (
        <View className="absolute bottom-0 left-0 right-0 px-5 pb-4">{footerComponent}</View>
      )}
    </View>
  );
}
