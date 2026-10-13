# AM Training

Application mobile de clarté mentale : Mind Dump, Time Matrix (Q1–Q4), Life Balance Wheel, objectifs et planification.

## Stack technique

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Supabase (auth, base de données, storage)
- Capacitor (iOS / Android)

## Démarrage

```sh
npm install
npm run dev
```

L'application démarre sur `http://localhost:8080`.

## Variables d'environnement

Créer un fichier `.env` à la racine :

```
VITE_SUPABASE_URL="https://<project>.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<anon-key>"
VITE_SUPABASE_PROJECT_ID="<project-id>"
```

## Build production

```sh
npm run build
npm run preview
```

## Applications natives (Capacitor)

```sh
npm run build
npx cap add ios        # macOS + Xcode requis
npx cap add android    # Android Studio requis
npx cap sync
npx cap open ios
npx cap open android
```

## Organisation du code

```
src/
  components/    Écrans et composants UI par domaine fonctionnel
  context/       État global de l'application
  hooks/         Hooks réutilisables (état, auth, haptique)
  data/          Données statiques (valeurs, domaines, questions)
  services/      Synchronisation cloud
  types/         Types TypeScript partagés
supabase/        Migrations et configuration backend
```
