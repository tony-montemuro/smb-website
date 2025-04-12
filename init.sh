#!/bin/bash
set -e

echo "BEFORE RUNNING THIS SCRIPT, ENSURE THE FOLLOWING DEPENDENCIES ARE INSTALLED:"
printf "\t- Supabase CLI - https://supabase.com/docs/guides/local-development/cli/getting-started\n"
printf "\t- Docker - https://docs.docker.com/get-started/get-docker/ (and Docker Daemon must be running)\n"
printf "\t- Node.js - https://nodejs.org/en\n"
echo "Any errors are likely due to a missing dependency!"
printf "=========================\n\n"

# SERVER SETUP
echo "SETTING UP BACKEND (supabase) 1/2..."
printf "=========================\n\n"

## Comment out deprecated SQL statement from initial migration
echo "a.) Fix initial migration -- remove deprecated extension..."
initial_migration="./supabase/migrations/20230905161842_remote_schema.sql"
sed -i 's/CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";/-- &/g' $initial_migration
git update-index --skip-worktree $initial_migration

## Extract keys for environment variables & images
echo "b.) Extract relevant environment variables from supabase..."
supabase start
status=$(supabase status -o env)
api_url=$(echo "$status" | grep "API_URL" | cut -d "=" -f2 | tr -d '"')
service_role=$(echo "$status" | grep "SERVICE_ROLE_KEY" | cut -d "=" -f2 | tr -d '"')
anon_key=$(echo "$status" | grep "ANON_KEY" | cut -d "=" -f2 | tr -d '"')

## Create development environment variables
env_file="./client/.env.development.local"
echo "c.) Creating $env_file..."
if [[ -s "$env_file" ]]; then
    echo "$env_file already exists. Continuing..."
else
    touch $env_file
    exec 3<> $env_file
    echo "REACT_APP_SUPABASE_URL=$api_url" >&3
    echo "REACT_APP_SUPABASE_ANON_KEY=$anon_key" >&3
    exec 3>&-
fi

## Upload images to local storage
echo "d.) Uploading images to supabase storage..."
cd ./supabase
./upload_images.sh "$api_url" "$service_role"
cd ..

# CLIENT SETUP
printf "\n=========================\n"
echo "SETTING UP FRONTEND (React) (2/2)..."
printf "=========================\n\n"

## Install npm packages
echo "a.) Installing client-side npm packages..."
cd client
npm i
cd ..

## End
printf "\n=========================\n"
echo "DEVELOPMENT SETUP COMPLETE!"
printf "\tImages do not persist permanently -- run \`cd supabase | ./upload_images.sh\` to re-upload images.\n"
printf "\tRun \`cd client | npm start\` to start client server...\n"
printf "\tDatabase already running\n"
