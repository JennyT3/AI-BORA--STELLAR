#!/bin/bash

SOURCE="/Users/jennytejedor/Desktop"
DEST="/Users/jennytejedor/Desktop/AI BORA/public"

echo "🔄 Optimizando imágenes a 1000x1000px (1:1)..."

# Convertir PNG a WebP optimizado 1000x1000
# Nota: Instala cwebp o usa sips (nativo Mac)

# Opción A: Con sips (nativo Mac, sin instalar nada)
sips -Z 1000 "$SOURCE/1.png" --out "$DEST/antes.webp"
sips -Z 1000 "$SOURCE/2.png" --out "$DEST/depois.webp"
sips -Z 1000 "$SOURCE/3.png" --out "$DEST/estudio.webp"
sips -Z 1000 "$SOURCE/4.png" --out "$DEST/foto-criativa.webp"
sips -Z 1000 "$SOURCE/5.png" --out "$DEST/mopack.webp"
sips -Z 1000 "$SOURCE/6.png" --out "$DEST/branding.webp"

echo "✅ Imágenes optimizadas en public/"
ls -lh "$DEST"/*.webp
