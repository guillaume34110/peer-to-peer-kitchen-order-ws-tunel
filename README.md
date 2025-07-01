# 🍳 Kitchen Tunnel Server

Serveur WebSocket local qui sert de **tunnel de communication** entre les clients d'un restaurant (interface de prise de commande, interface cuisine, etc.) connectés sur le même réseau local.

## 🎯 Fonctionnalités

- **Relai WebSocket pur** : Transfère les messages JSON entre tous les clients connectés
- **Zéro logique métier** : Le serveur ne traite pas le contenu, il relaye simplement
- **Connexions multiples** : Supporte plusieurs clients simultanément
- **Réseau local** : Optimisé pour fonctionner sur un LAN de restaurant
- **Léger et rapide** : Aucune dépendance superflue

## 🚀 Installation et lancement

### Prérequis
- Node.js 16+ 
- npm

### Installation
```bash
npm install
```

### Démarrage du serveur
```bash
npm start
```
ou
```bash
node server.js
```

Le serveur démarre sur le port **3000** et sera accessible via :
```
ws://localhost:3000
```

## 🔌 Utilisation

### Connexion depuis un client JavaScript
```javascript
const ws = new WebSocket('ws://localhost:3000');

// Écouter les messages reçus
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Message reçu:', data);
};

// Envoyer un message
const message = {
  type: 'order',
  content: 'Pizza Margherita',
  timestamp: Date.now()
};
ws.send(JSON.stringify(message));
```

### Connexion depuis un autre réseau local
Remplacez `localhost` par l'adresse IP de la machine qui héberge le serveur :
```
ws://192.168.1.100:3000
```

## 🏗️ Architecture

Le serveur est organisé en **fonctions pures et modulaires** :

- `startServer()` : Point d'entrée, démarre le serveur WebSocket
- `handleConnection(ws)` : Gère chaque nouvelle connexion client
- `handleMessage(message, ws)` : Traite les messages reçus
- `broadcast(message, exclude)` : Diffuse à tous les clients sauf l'émetteur
- `addClient(ws)` / `removeClient(ws)` : Gestion des connexions actives

## 📋 Comportement

1. **Réception** : Le serveur reçoit un message JSON d'un client
2. **Validation** : Vérifie que le message est un JSON valide
3. **Diffusion** : Relaye le message à tous les autres clients connectés
4. **Exclusion** : L'émetteur ne reçoit pas son propre message

## 🛠️ Développement

Le code respecte les principes de **clean code** :
- Fonctions petites et spécialisées
- Nommage explicite et métier
- Pas de classes, uniquement des fonctions
- Contextes bornés et séparés
- Imports ES6 modules

## 📦 Dépendances

- [`ws`](https://github.com/websockets/ws) : Librairie WebSocket pure pour Node.js

## 🔧 Configuration

Le port par défaut est **3000**. Pour le modifier, changez la constante `PORT` dans `server.js`.

## ⚠️ Notes importantes

- Ce serveur ne stocke aucune donnée
- Aucune authentification n'est implémentée
- Conçu pour un usage en réseau local sécurisé
- Les clients doivent gérer leur propre interface utilisateur
- Seuls les messages JSON valides sont relayés 