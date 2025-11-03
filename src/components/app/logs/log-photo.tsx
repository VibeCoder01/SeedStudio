
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getImage } from '@/lib/idb';
import { Skeleton } from '@/components/ui/skeleton';

interface LogPhotoProps {
  photoId: string;
}

export function LogPhoto({ photoId }: LogPhotoProps) {
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    
    getImage(photoId).then(dataUrl => {
      if (isMounted && dataUrl) {
        setPhotoUrl(dataUrl);
      }
    }).finally(() => {
        if (isMounted) {
            setIsLoading(false);
        }
    });

    return () => {
      isMounted = false;
    };
  }, [photoId]);

  if (isLoading) {
    return <Skeleton className="w-full aspect-video rounded-md" />;
  }
  
  if (photoUrl) {
    return (
      <div className="relative mt-4 w-full aspect-video">
        <Image src={photoUrl} alt="Log photo" fill className="rounded-md object-contain" />
      </div>
    );
  }

  return <p className="text-muted-foreground text-center py-8">Photo not found.</p>;
}
