# Crawler + server for providing SSR to make dynamic JS applications crawlable 

## Settings in config.js
~~~~
{
    // the port number this server runs at
    port: 3012,
    // add your own config here and access it through .getSettings() inside the app
}
~~~~

## Nginx virtual host example for the client application

~~~~
######################################
# render-server user agent will always get 0 (avoid loops)
map $http_user_agent $is_crawler_by_ua {
    default 0;
    "~render-server" 0;
    "~baiduspider" 1;
    "~twitterbot" 1;
    "~baiduspider" 1;
    "~facebookexternalhit" 1;
    "~rogerbot" 1;
    "~linkedinbot" 1;
    "~embedly" 1;
    "~quora link preview" 1;
    "~showyoubot" 1;
    "~outbrain" 1;
    "~pinterest" 1;
    "~slackbot" 1;
    "~vkShare" 1;
    "~Slack-ImgProxy" 1;
    "~Slackbot-LinkExpanding" 1;
    "~Site Analyzer" 1;
    "~SiteAnalyzerBot" 1;
    "~Viber" 1;
    "~Whatsapp" 1;
    "~Telegram" 1;
    "~W3C_Validator" 1;
}
map $args $is_crawler {
    default $is_crawler_by_ua;
    "~(^|&)_escaped_fragment_=" 1;
}

server {
    listen 80;
    server_name foreign-sky.ru foreignsky.ru;

    ######################################
    # HTTP -> HTTPS
    # redirect all domains to the canonical one: foreignsky.ru
    rewrite     ^   https://foreignsky.ru$request_uri? permanent;
}

server {
    listen 443 ssl;
    server_name foreignsky.ru;

    ######################################
    # SSL config

     ssl_certificate /etc/letsencrypt/live/foreignsky.ru/fullchain.pem;
     ssl_certificate_key /etc/letsencrypt/live/foreignsky.ru/privkey.pem;

    # performance enhancement for SSL
    ssl_stapling on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 5m;

    # safety enhancement to SSL: make sure we actually use a safe cipher
    ssl_prefer_server_ciphers on;
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:AES128-GCM-SHA256:AES256-GCM-SHA384:ECDHE-RSA-RC4-SHA:ECDHE-ECDSA-RC4-SHA:RC4-SHA:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!3DES:!MD5:!PSK';

    # config to enable HSTS
    add_header Strict-Transport-Security "max-age=31536000;";

    ######################################
    # Verifications
    # letsencrypt certbot
    location /.well-known {
        alias /home/nginx/ssl/foreignsky/.well-known;
    }
    # google
    location /google0121083c43e8dc53.html {
        rewrite ^/(.*)  $1;
        return 200 "google-site-verification: $uri";
    }
    # yandex verification

    # try_files $uri $uri/ @main;
    location ~ /\. {
        deny all;
    }

    ######################################
    # location @main {
    location / {
        # this setting allows the browser to cache the application in a way compatible with Meteor
        # on every applicaiton update the name of CSS and JS file is different, so they can be cache infinitely (here: 30 days)
        # the root path (/) MUST NOT be cached
        if ($uri != '/') {
           expires 30d;
        }

        if ($is_crawler = 1) {
            rewrite .* /cache break;
            proxy_set_header X-Url $scheme://$host$request_uri?;
            proxy_pass http://localhost:11004; # to the render server
        }

        if ($is_crawler = 0) {
            set $proxy_host $host;
        }

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade; #for websockets
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $proxy_host;
        proxy_set_header X-Forwarded-For $remote_addr; # preserve client IP

        if ($is_crawler = 0) {
            proxy_pass http://localhost:11001; # to the project 
            break;
        }
    }
}
~~~~

Nginx virtual host file behaviour checker code:
~~~~
default_type text/plain;
return 200 "is crawler: $is_crawler, user agent: $http_user_agent, $uri";
~~~~

## Other
~~~~
http://localhost:11004/http%3A%2F%2Fforeignsky.ru%3Fasdfafads%3D1
~~~~

## Copyright

`awesome1888@gmail.com`, MIT License
