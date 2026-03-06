FROM devlikeapro/waha-plus

# Render uses the PORT env var, but devlikeapro/waha-plus usually defaults to 3000
# We ensure the container listens on 3000 as defined in your blueprint
EXPOSE 3000

CMD ["npm", "start"]