#!/bin/bash
urls=(
  'https://images.unsplash.com/photo-1611085583191-a3b181a88401'
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a'
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908'
  'https://images.unsplash.com/photo-1599643478524-fb66f70a0066'
  'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed'
  'https://images.unsplash.com/photo-1573408301145-b98c4af30664'
  'https://images.unsplash.com/photo-1629224316810-9d8805b95e76'
  'https://images.unsplash.com/photo-1605100804763-247f66126e28'
  'https://images.unsplash.com/photo-1589139281691-6fa70f20d588'
  'https://images.unsplash.com/photo-1599643477877-530eb83abc8e'
)
for url in "${urls[@]}"; do
  status=$(curl -o /dev/null -s -w "%{http_code}\n" "$url")
  echo "$status $url"
done
