import React from 'react';
import { CircularGallery, GalleryItem } from '@/components/ui/circular-gallery';

const galleryData: GalleryItem[] = [
  {
    common: 'Tričká',
    binomial: 'novinky',
    photo: {
      url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85',
      text: 'oversized t-shirt editorial',
      pos: '50% 38%',
      by: 'Dotyk Slov / demo',
    },
  },
  {
    common: 'Mikiny',
    binomial: 'novinky',
    photo: {
      url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85',
      text: 'hoodie editorial',
      pos: '50% 35%',
      by: 'Dotyk Slov / demo',
    },
  },
  {
    common: 'Cropy',
    binomial: 'novinky',
    photo: {
      url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85',
      text: 'fashion editorial model',
      pos: '50% 35%',
      by: 'Dotyk Slov / demo',
    },
  },
  {
    common: 'Doplnky',
    binomial: 'novinky',
    photo: {
      url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85',
      text: 'fashion accessories editorial',
      pos: '50% 35%',
      by: 'Dotyk Slov / demo',
    },
  },
  {
    common: 'Novinky',
    binomial: 'fresh drop',
    photo: {
      url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=85',
      text: 'fashion campaign model',
      pos: '50% 30%',
      by: 'Dotyk Slov / demo',
    },
  },
  {
    common: 'Limitky',
    binomial: 'limited',
    photo: {
      url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=85',
      text: 'limited fashion editorial',
      pos: '50% 30%',
      by: 'Dotyk Slov / demo',
    },
  },
];

const CircularGalleryDemo = () => {
  return (
    <div className="w-full bg-background text-foreground" style={{ height: '500vh' }}>
      <div className="w-full h-screen sticky top-0 flex flex-col items-center justify-center overflow-hidden">
        <div className="text-center mb-8 absolute top-16 z-10">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">DOTYK SLOV / NOVINKY</p>
          <h1 className="text-4xl font-light tracking-tight">nové veci. rovnaký chaos.</h1>
          <p className="text-muted-foreground">Scroll to rotate the gallery</p>
        </div>
        <div className="w-full h-full">
          <CircularGallery items={galleryData} />
        </div>
      </div>
    </div>
  );
};

export default CircularGalleryDemo;
