FROM nginx:alpine

# Copy the game files to the nginx html directory
COPY index.html /usr/share/nginx/html/
COPY sprites/ /usr/share/nginx/html/sprites/

# Configure nginx to listen on port 8080
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
