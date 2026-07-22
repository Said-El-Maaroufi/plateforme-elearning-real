#!/bin/bash
set -e

# Créer le lien symbolique public/storage si ce n'est pas déjà fait
php artisan storage:link --force

# 1. Exécuter les migrations Laravel sur Aiven
echo "Lancement des migrations..."
php artisan migrate --force --seed

# 2. Lancer la commande par défaut du Dockerfile (Apache)
echo "Démarrage d'Apache..."
exec "$@"