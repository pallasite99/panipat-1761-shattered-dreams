import React, { useEffect, useState } from 'react';

type FallbackImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc: string;
};

export const FallbackImage: React.FC<FallbackImageProps> = ({
  src,
  fallbackSrc,
  onError,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <img
      {...props}
      src={currentSrc}
      onError={(event) => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
          return;
        }

        onError?.(event);
      }}
    />
  );
};
