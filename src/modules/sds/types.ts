export type SdsSignalWord = 'Fare' | 'Advarsel';

export interface SdsDocument {
  id: string;
  name: string;
  supplier: string;
  productNumber: string;
  signalWord: SdsSignalWord;
  hazardCodes: string[];
  hazardLabels: string[];
  location: string;
  emergencyPhone: string;
  ppe: string[];
  firstAid: {
    eyes: string;
    skin: string;
    inhalation: string;
  };
  pdfFileName: string;
  qrCode: string;
  revisionDate: string;
}

export interface SdsPreferences {
  favoriteIds: string[];
  recentIds: string[];
}
