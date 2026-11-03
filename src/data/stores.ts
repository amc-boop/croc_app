import type { PartnerStore } from './types';

/**
 * Magasins partenaires FICTIFS pour le MVP. En production, ces données
 * viendront des API catalogues/prix des enseignes (ou d'un agrégateur).
 */
export const PARTNER_STORES: PartnerStore[] = [
  {
    id: 'marche_express',
    name: 'Marché Express',
    logo: '🛒',
    color: '#E63946',
    priceFactor: 1.0,
    deliveryFee: 3.99,
    freeDeliveryFrom: 50,
    deliveryEta: 'Livré en 2 h',
    unavailable: ['guanciale', 'tahini'],
  },
  {
    id: 'bio_panier',
    name: 'Bio & Panier',
    logo: '🌱',
    color: '#2A9D8F',
    priceFactor: 1.25,
    deliveryFee: 4.9,
    freeDeliveryFrom: 60,
    deliveryEta: 'Demain matin',
    unavailable: ['boeuf_hache', 'rhum'],
  },
  {
    id: 'hyper_eco',
    name: 'HyperÉco Drive',
    logo: '🏷️',
    color: '#F4A261',
    priceFactor: 0.88,
    deliveryFee: 0,
    freeDeliveryFrom: 0,
    deliveryEta: 'Retrait en 1 h',
    unavailable: ['guanciale', 'mozzarella', 'coriandre'],
  },
];
