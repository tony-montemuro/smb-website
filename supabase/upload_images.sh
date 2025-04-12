#!/bin/bash
set -e

if [ "$#" -lt 2 ]; then
    supabase start
    status=$(supabase status -o env)
    api_url=$(echo "$status" | grep "API_URL" | cut -d "=" -f2 | tr -d '"')
    service_role=$(echo "$status" | grep "SERVICE_ROLE_KEY" | cut -d "=" -f2 | tr -d '"')
else
    api_url="$1"
    service_role="$2"
fi

npm i
node upload_images.js $api_url $service_role
