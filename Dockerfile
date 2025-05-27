FROM nginx:alpine

# Copy the game files to the nginx html directory
COPY src/index.html /usr/share/nginx/html/
COPY src/sprites/ /usr/share/nginx/html/
COPY src/songs/ /usr/share/nginx/html/

# Configure nginx to listen on port 8080
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
