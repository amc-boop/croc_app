# Croc 🐊

Le réseau social de la cuisine : des vidéos courtes de recettes à scroller, la recette détaillée en un tap, et le panier d'ingrédients prêt à commander chez des magasins partenaires. Le feed s'adapte à ce qu'il y a dans ton frigo et à tes préférences (vegan, allergies, sans alcool…).

> **Statut : MVP de démonstration.** Les recettes, les magasins partenaires, les prix et la reconnaissance photo du frigo sont simulés (voir « Ce qui est simulé »).

## Lancer l'app

Prérequis : Node 20+ et l'app **Expo Go** sur ton téléphone (iOS ou Android).

```bash
npm install
npx expo start        # puis scanne le QR code avec Expo Go
npx expo start --web  # ou dans le navigateur
```

Autres commandes :

```bash
npm test              # tests de la logique métier (filtres, frigo, panier)
npm run typecheck     # vérification TypeScript
npm run build:web     # export web statique dans dist/
```

## Fonctionnalités du MVP

| Écran | Ce qu'on peut faire |
| --- | --- |
| **Feed** | Scroll vertical plein écran façon reels. Onglets « Pour toi » et « Mon frigo ». Like, enregistrer, partager, ajouter au panier, ouvrir la recette. Badge « 4/6 au frigo » sur chaque vidéo. |
| **Recette** | Ingrédients avec quantités recalculées selon le nombre de personnes, statut « au frigo / à acheter / placard », étapes, alerte si la recette ne respecte pas tes préférences. |
| **Panier** | Agrège les ingrédients de plusieurs recettes, déduit ce que tu as au frigo, calcule les conditionnements à acheter et compare le prix total entre 3 magasins partenaires (avec livraison et produits indisponibles). |
| **Mon frigo** | Saisie manuelle avec autocomplétion (accents et synonymes gérés), ajout rapide, scan photo du frigo, et suggestions « Tu peux cuisiner » classées par pourcentage d'ingrédients possédés. |
| **Profil** | Régimes (vegan, végétarien, sans porc, sans alcool) et 9 allergènes. Le feed masque automatiquement les recettes incompatibles. Liste des recettes enregistrées. |

Toutes les données utilisateur (frigo, panier, préférences, likes) sont sauvegardées sur l'appareil.

## Architecture

- **Expo SDK 58 / React Native / TypeScript**, navigation avec **Expo Router** (une seule base de code pour iOS, Android et web).
- `src/app/` : écrans (routes Expo Router).
- `src/lib/` : logique métier pure et testée (`preferences.ts`, `fridge.ts`, `feed.ts`, `basket.ts`).
- `src/data/` : catalogue d'ingrédients, recettes et magasins de démonstration.
- `src/state/` : état global (React context + AsyncStorage).
- `src/services/fridgeVision.ts` : point d'entrée de la reconnaissance photo.

Les régimes et allergènes d'une recette ne sont **jamais saisis à la main** : ils sont déduits de ses ingrédients. Un créateur ne peut donc pas étiqueter « vegan » une recette avec du beurre.

## Ce qui est simulé

- **Vidéos** : les recettes de démo n'ont pas encore de vidéo. Le feed anime la photo (zoom lent) et sait déjà lire une vidéo verticale dès qu'un `videoUrl` est fourni.
- **Magasins partenaires** : « Marché Express », « Bio & Panier » et « HyperÉco Drive » sont fictifs, avec des prix calculés à partir d'un prix de référence. La commande n'est pas réellement passée.
- **Photo du frigo** : sans configuration, une détection simulée est renvoyée. Pour la vraie reconnaissance, définir `EXPO_PUBLIC_FRIDGE_VISION_URL` (voir `.env.example`) vers un backend qui appelle un modèle de vision et répond `{ "labels": ["tomate", "oeufs", …] }`. La clé d'API du modèle doit rester côté serveur, jamais dans l'app.

## Prochaines étapes conseillées

1. **Backend** (Supabase ou Firebase) : comptes, upload et compression des vidéos des créateurs, likes et commentaires partagés.
2. **Reconnaissance du frigo** via un modèle de vision derrière une petite fonction serverless.
3. **Partenariats magasins** : brancher un premier partenaire réel (API drive ou affiliation) pour valider le modèle de commission sur le panier.
4. **Algorithme du feed** : passer du tri actuel (popularité + frigo) à un classement par l'engagement réel (temps de visionnage, ajouts au panier).
