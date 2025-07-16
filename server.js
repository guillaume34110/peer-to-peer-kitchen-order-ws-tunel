import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 3000;
const connectedClients = new Set();

/**
 * Démarre le serveur WebSocket et configure les gestionnaires d'événements
 */
const startServer = () => {
  const wss = new WebSocketServer({ 
    port: PORT,
    host: '0.0.0.0'
  });
  
  wss.on('connection', handleConnection);
  
  wss.on('error', (error) => {
    console.error('Erreur serveur WebSocket:', error);
  });

  console.log(`🚀 Serveur tunnel WebSocket démarré sur ws://0.0.0.0:${PORT}`);
  console.log(`📡 Accessible depuis le réseau local sur ws://[votre-ip]:${PORT}`);
  
  return wss;
};

/**
 * Gère une nouvelle connexion client WebSocket
 * @param {WebSocket} ws - Instance WebSocket du client connecté
 */
const handleConnection = (ws) => {
  console.log('[CONNEXION] Nouveau client connecté.');
  addClient(ws);
  attachMessageHandler(ws);
  attachCloseHandler(ws);
};

/**
 * Ajoute un client à la liste des connexions actives
 * @param {WebSocket} ws - Instance WebSocket du client
 */
const addClient = (ws) => {
  connectedClients.add(ws);
  console.log(`[CLIENT_ADD] Client ajouté. Total: ${connectedClients.size}`);
};

/**
 * Attache le gestionnaire de messages pour un client
 * @param {WebSocket} ws - Instance WebSocket du client
 */
const attachMessageHandler = (ws) => {
  ws.on('message', (data) => {
    try {
      const message = data.toString();
      console.log(`[MESSAGE_RECU] Message: ${message}`);
      handleMessage(message, ws);
    } catch (error) {
      console.error('Erreur lors du traitement du message:', error);
    }
  });
};

/**
 * Attache le gestionnaire de fermeture de connexion
 * @param {WebSocket} ws - Instance WebSocket du client
 */
const attachCloseHandler = (ws) => {
  ws.on('close', () => {
    console.log('[DECONNEXION] Client déconnecté.');
    removeClient(ws);
  });
  
  ws.on('error', (error) => {
    console.error('Erreur connexion client:', error);
    removeClient(ws);
  });
};

/**
 * Retire un client de la liste des connexions actives
 * @param {WebSocket} ws - Instance WebSocket du client à retirer
 */
const removeClient = (ws) => {
  connectedClients.delete(ws);
  console.log(`[CLIENT_REMOVE] Client retiré. Total: ${connectedClients.size}`);
};

/**
 * Traite un message reçu d'un client
 * @param {string} message - Message JSON reçu
 * @param {WebSocket} senderWs - WebSocket du client émetteur
 */
const handleMessage = (message, senderWs) => {
  console.log(`[HANDLE_MESSAGE] Traitement du message.`);
  if (isValidJsonMessage(message)) {
    broadcast(message, senderWs);
  } else {
    console.log(`[INVALID_JSON] Message ignoré car non-JSON: ${message}`);
  }
};

/**
 * Vérifie si un message est du JSON valide
 * @param {string} message - Message à valider
 * @returns {boolean} True si le message est du JSON valide
 */
const isValidJsonMessage = (message) => {
  try {
    JSON.parse(message);
    console.log('[VALIDATION] Message JSON valide.');
    return true;
  } catch {
    console.log('[VALIDATION] Message JSON invalide.');
    return false;
  }
};

/**
 * Diffuse un message à tous les clients connectés sauf l'émetteur
 * @param {string} message - Message à diffuser
 * @param {WebSocket} excludeWs - WebSocket à exclure de la diffusion
 */
const broadcast = (message, excludeWs) => {
  const recipients = getActiveRecipients(excludeWs);
  console.log(`[BROADCAST] Diffusion du message à ${recipients.length} client(s).`);
  
  recipients.forEach(ws => {
    sendMessageToClient(ws, message);
  });
};

/**
 * Récupère la liste des destinataires actifs (excluant l'émetteur)
 * @param {WebSocket} excludeWs - WebSocket à exclure
 * @returns {WebSocket[]} Liste des WebSockets destinataires
 */
const getActiveRecipients = (excludeWs) => {
  return Array.from(connectedClients).filter(ws => 
    ws !== excludeWs && isClientReady(ws)
  );
};

/**
 * Vérifie si un client est prêt à recevoir des messages
 * @param {WebSocket} ws - Instance WebSocket à vérifier
 * @returns {boolean} True si le client est prêt
 */
const isClientReady = (ws) => {
  return ws.readyState === ws.OPEN;
};

/**
 * Envoie un message à un client spécifique
 * @param {WebSocket} ws - WebSocket destinataire
 * @param {string} message - Message à envoyer
 */
const sendMessageToClient = (ws, message) => {
  try {
    console.log(`[SEND] Envoi du message à un client.`);
    ws.send(message);
  } catch (error) {
    console.error('Erreur envoi message:', error);
    removeClient(ws);
  }
};

// Démarrage du serveur
startServer(); 