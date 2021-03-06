# Crawler + server for providing SSR to make dynamic JS applications crawlable 
 
## Installation

(todo)

~~~~
sudo yum install libXcomposite
sudo yum install libXcursor
sudo yum install libXdamage
sudo yum install libXext
sudo yum install libXi
sudo yum install libXtst

// somethig of this helped:
yum -y install gcc gcc-c++ make rpm-build wget tar bzip2 gnutls-devel pam-devel dbus-devel avahi-devel systemd-devel system-config-printer-libs pygobject2 python-cups python-lxml foomatic-db-ppds ghostscript-cups cups-filesystem cups-filters cups-filters-libs cups-filters-libs cups-pdf cups-bjnp

sudo yum install libXScrnSaver-1.2.2-6.1.el7.x86_64
yum provides */libgconf-2.so.4

sudo yum install GConf2
sudo yum install at-spi2-atk
sudo yum install gtk3

export CHROME_DEVEL_SANDBOX=/home/renderserver/render-server/crawler/node_modules/puppeteer/.local-chromium/linux-515411/chrome-linux/chrome_sandbox
chown root:root /home/renderserver/render-server/crawler/node_modules/puppeteer/.local-chromium/linux-515411/chrome-linux/chrome_sandbox
chmod 4755 /home/renderserver/render-server/crawler/node_modules/puppeteer/.local-chromium/linux-515411/chrome-linux/chrome_sandbox

yum provider */libatk-bridge-2.0.so.0
~~~~

## Settings in config.js
~~~~
module.exports = {
    port: 11004,
    useCluster: true,

    crawlTimeout: 5000,
    cacheFolder: '/home/renderserver/crawled-pages/',
    mongodb: {
        connection: 'mongodb://renderserver:password@localhost:27017/renderserver',
        database: 'renderserver',
    },

    // todo: later move to the database
    targets: [
        'https://foreignsky.ru',
    ],
};
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

map $is_crawler $xxxurl {
    default "";
    1 "$scheme://$host$request_uri";
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
        proxy_set_header X-Crawled-Url $xxxurl;

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

## MongoDB setup

~~~~
use admin;
db.auth('administrator', 'yyyyyyyyyyyy');
use renderserver;
db.createUser({
    user: "renderserver",
    pwd: "xxxxxxxxxxxxxxx",
    roles: [ { role: "readWrite", db: "renderserver" } ]
});
~~~~

## SystemD setup

~~~~
su root;
vi /etc/systemd/system/render-server.service;
~~~~

~~~~
[Unit]
Description=Render Server
[Service]
Type=simple
User=renderserver
Group=renderserver
Environment=NODE_ENV=production
ExecStart=/usr/local/bin/node /home/renderserver/render-server/server/build/server/index.js &
Requires=mongod.service
After=network.target

[Install]
WantedBy=multi-user.target
~~~~

~~~~
systemctl enable render-server
systemctl start render-server
systemctl list-units | grep render-server
~~~~

## Crawler cronjob

~~~~
su renderserver;
crontab -e;
~~~~

~~~~
05 00 * * * /usr/local/bin/node /home/renderserver/render-server/crawler/build/app/index.js
~~~~

## Copyright

`awesome1888@gmail.com`, MIT License
