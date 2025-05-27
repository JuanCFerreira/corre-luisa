FROM nginx:alpine

# Copy the game files to the nginx html directory
COPY src/ /usr/share/nginx/html/
COPY sprites/ /usr/share/nginx/html/sprites/
COPY songs/ /usr/share/nginx/html/songs/

# Configure nginx to listen on port 8080
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
