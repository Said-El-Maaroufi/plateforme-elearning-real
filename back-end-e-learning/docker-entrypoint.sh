#!/bin/bash
set -e

# 1. Exécuter les migrations Laravel sur Aiven
echo "Lancement des migrations..."
php artisan migrate --force

# 2. Lancer la commande par défaut du Dockerfile (Apache)
echo "Démarrage d'Apache..."
exec "$@"