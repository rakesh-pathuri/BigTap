export interface WallpaperOption {
  id: string;
  name: string;
  subtitle: string;
  source: any;
  thumbSource: any;
  previewColor: string;
}

export const WALLPAPER_OPTIONS: WallpaperOption[] = [
  {
    id: 'mountain_sunrise',
    name: 'Mountain Sunrise',
    subtitle: 'Misty Dawn',
    source: require('../../assets/wallpapers/mountain_sunrise.jpg'),
    thumbSource: require('../../assets/wallpapers/thumbs/mountain_sunrise_thumb.jpg'),
    previewColor: '#E8DED2',
  },
  {
    id: 'lake_sunset',
    name: 'Tranquil Lake',
    subtitle: 'Golden Shore',
    source: require('../../assets/wallpapers/lake_sunset.jpg'),
    thumbSource: require('../../assets/wallpapers/thumbs/lake_sunset_thumb.jpg'),
    previewColor: '#DFBD9E',
  },
  {
    id: 'forest_mist',
    name: 'Forest Mist',
    subtitle: 'Sunlit Woods',
    source: require('../../assets/wallpapers/forest_mist.jpg'),
    thumbSource: require('../../assets/wallpapers/thumbs/forest_mist_thumb.jpg'),
    previewColor: '#CADBB7',
  },
  {
    id: 'lavender_field',
    name: 'Lavender Sunset',
    subtitle: 'Golden Field',
    source: require('../../assets/wallpapers/lavender_field.jpg'),
    thumbSource: require('../../assets/wallpapers/thumbs/lavender_field_thumb.jpg'),
    previewColor: '#C4B5D4',
  },
  {
    id: 'none',
    name: 'Solid Clean',
    subtitle: 'Classic Plain',
    source: null,
    thumbSource: null,
    previewColor: '#F4F7FB',
  },
];
