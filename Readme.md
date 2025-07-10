# Service Base de Données – RepAIr   -IBRAHIMI Yasmine

Ce service est le **cœur de stockage de RepAIr**. Il gère toutes les opérations liées aux utilisateurs, objets à réparer, requêtes IA et abonnements.

Il communique avec les autres microservices tels que :
-  **OAuth** (pour connecter/créer un utilisateur via Google et Facebook)
-  **IA** (pour stocker les résultats d’analyse)
-  **Paiement** (pour activer les abonnements)
-  **Notification** (pour l’envoi d’emails de confirmation)

---

##  Fonctionnalités principales

-  **Gestion des utilisateurs** (création, connexion, email, préférences)
- **Historique des requêtes IA** par utilisateur
-  **Gestion des objets à réparer** (statuts, mise à jour, suppression)
-  **Abonnements et profils premium**
- **Métriques Prometheus exposées sur `/metrics`**

---

##  Technologies utilisées

- **Node.js + Express**
- **MongoDB (via Mongoose)**
- **JWT** pour la protection des routes
- **Prometheus (`prom-client`)** pour les métriques
- **Axios** pour communiquer avec d’autres services

---

##  API exposée

Toutes les routes sont accessibles via `/api`.

###  Utilisateurs : `/api/users`

- `POST /` : Créer un utilisateur local
- `POST /oauth` : Créer/récupérer un utilisateur OAuth
- `GET /by-email?email=...` : Trouver un utilisateur par email
- `GET /:id` : Récupérer un utilisateur (protégé)
- `PATCH /:id/preferences` : Modifier les préférences (protégé)
- `PATCH /subscription/:userId` : Mise à jour abonnement (post-paiement)
- `PATCH /:id/verify-email` : Vérification email (depuis lien de confirmation)

###  Authentification : `/api/auth`

- `POST /signup` : Inscription locale ou OAuth
- `POST /login` : Connexion avec vérification du mot de passe ou OAuth

###  Requêtes IA : `/api/ia-requests`

- `POST /` : Créer une requête IA (protégé)
- `GET /user/:userId` : Requêtes par utilisateur (protégé)
- `GET /:id` : Détail d’une requête
- `PATCH /:id/result` : Mise à jour du résultat IA (protégé)

###  Objets à réparer : `/api/objects`

- `POST /` : Ajouter un objet (protégé)
- `GET /user/:userId` : Tous les objets d’un utilisateur (protégé)
- `GET /:id` : Détail d’un objet
- `PATCH /:id/status` : Changer le statut (protégé)
- `DELETE /:id` : Supprimer un objet (protégé)

---

## Sécurité

-  Les routes sensibles sont protégées par un middleware `verifyToken`
-  Les utilisateurs sont authentifiés via JWT généré à la connexion

---

##  Métriques Prometheus

Le service expose des métriques via :

- Port principal : `http://localhost:3001/metrics`
- Port dédié : `http://localhost:9101/metrics`

> Métrique personnalisée :
```txt
db_requests_total{method="GET", route="/api/users", status="200"} 1
