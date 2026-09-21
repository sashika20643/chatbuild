FROM nginx:alpine

# Remove default nginx site config and static files
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Our custom server config (replicates the old Netlify _redirects rules)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# All the static site files
COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
