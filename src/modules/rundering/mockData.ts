import type { RoundCheck, RoundPoint, RoundSession } from './types';

export const roundPoints: RoundPoint[] = [
  {
    id: 'vestavej-gm1-visuel',
    title: 'GM 1 visuel kontrol',
    location: 'Vestavej',
    group: 'Motorhal',
    instruction: 'Kontroller lækage, lyd, temperatur og alarmer på lokalt panel.',
    qrCode: 'round:vestavej-gm1-visuel',
    required: true,
  },
  {
    id: 'vestavej-ahp-pumpe',
    title: 'AHP pumper',
    location: 'Vestavej',
    group: 'Varmepumpe',
    instruction: 'Tjek driftstilstand, tryk og unormale vibrationer.',
    qrCode: 'round:vestavej-ahp-pumpe',
    required: true,
  },
  {
    id: 'industrivej-kedelrum',
    title: 'Kedelrum',
    location: 'Industrivej',
    group: 'Produktion',
    instruction: 'Kontroller adgang, orden, temperatur og synlige fejl.',
    qrCode: 'round:industrivej-kedelrum',
    required: true,
  },
  {
    id: 'klinkby-veksler',
    title: 'Vekslerstation',
    location: 'Klinkby',
    group: 'Station',
    instruction: 'Tjek differenstryk, lækage og alarmindikatorer.',
    qrCode: 'round:klinkby-veksler',
    required: true,
  },
  {
    id: 'nr-nissum-brond',
    title: 'Brønd og adgang',
    location: 'Nr. Nissum',
    group: 'Net',
    instruction: 'Kontroller låg, vand, adgangsforhold og synlige skader.',
    qrCode: 'round:nr-nissum-brond',
    required: false,
  },
];

export const roundSessions: RoundSession[] = [
  {
    id: 'morgenrunde-vestavej',
    title: 'Morgenrunde Vestavej',
    area: 'Vestavej',
    dueAt: '2026-06-25T10:00:00.000Z',
    assignedTo: 'Driften',
    status: 'in_progress',
    pointIds: ['vestavej-gm1-visuel', 'vestavej-ahp-pumpe'],
  },
  {
    id: 'stationer-formiddag',
    title: 'Stationer formiddag',
    area: 'Udeområder',
    dueAt: '2026-06-25T12:00:00.000Z',
    assignedTo: 'Vagt',
    status: 'attention',
    pointIds: ['industrivej-kedelrum', 'klinkby-veksler', 'nr-nissum-brond'],
  },
];

export const roundChecks: RoundCheck[] = [
  {
    id: 'check-1',
    sessionId: 'morgenrunde-vestavej',
    pointId: 'vestavej-gm1-visuel',
    status: 'ok',
    checkedAt: '2026-06-25T07:48:00.000Z',
    checkedBy: 'Stefan',
  },
];
