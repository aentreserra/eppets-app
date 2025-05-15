import * as FileSystem from 'expo-file-system';

export const PHOTOS_DIR = FileSystem.documentDirectory + 'dailyPhotos/';

export const speciesOptions = [
  { label: 'Canino', value: 'dog', icon: 'dog'},
  { label: 'Felino', value: 'cat', icon: 'cat'},
  { label: 'Ave', value: 'bird', icon: 'bird'},
  { label: 'Pez', value: 'fish', icon: 'fish'},
  { label: 'Conejo', value: 'rabbit', icon: 'rabbit'},
  { label: 'Roedor', value: 'rodent', icon: 'rodent'},
  { label: 'Hurón', value: 'ferret', icon: 'paw'},
  { label: 'Reptil', value: 'reptile', icon: 'snake'},
  { label: 'Anfibio', value: 'amphibian', icon: 'paw'},
  { label: 'Primates', value: 'primate', icon: 'paw'},
  { label: 'Otra', value: 'other', icon: 'paw'},
];

export const BASE_XP = 20;
export const XP_MULTIPLIER = 1.2;

export const markdownStyles = {
  body: { fontFamily: 'Lato-Regular', fontSize: 16, color: '#242222' },
  heading1: { fontFamily: 'Lato-Bold', fontSize: 24, color: '#191717' },
  heading2: { fontFamily: 'Lato-Bold', fontSize: 20, color: '#191717' },
  heading3: { fontFamily: 'Lato-Bold', fontSize: 18, color: '#191717' },
  strong: { fontFamily: 'Lato-Bold' },
  em: { fontFamily: 'Lato-Italic' },
  bullet_list_icon: { fontFamily: 'Lato-Regular', color: '#EF9B93', marginRight: 5 },
  ordered_list_icon: { fontFamily: 'Lato-Regular', color: '#EF9B93', marginRight: 5 },
  link: { fontFamily: 'Lato-Regular', color: '#458AC3', textDecorationLine: 'underline' },
  list_item: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: 5},
  textgroup: {fontFamily: 'Lato-Regular', color: '#191717'},
  paragraph: { fontFamily: 'Lato-Regular', marginTop: 5, marginBottom: 7, lineHeight: 22 },
};