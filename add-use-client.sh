#!/bin/bash

# Usage: ./add-use-client.sh path/to/file.tsx

FILE="$1"

if [[ ! -f "$FILE" ]]; then
  echo "❌ File not found: $FILE"
  exit 1
fi

# Check if 'use client' already exists
if grep -q "'use client'" "$FILE"; then
  echo "✅ Already has 'use client': $FILE"
else
  echo "⚡ Adding 'use client' to: $FILE"
  (echo "'use client'"; cat "$FILE") > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"
  echo "✅ Done"
fi

