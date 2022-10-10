This demonstrate remote user (also called forward auth?) support in Cherry.

## Setup

1. Add these mapping to your `/etc/hosts`

```
127.0.0.1 cherry.example.com
127.0.0.1 authelia.example.com
```

2. Install [mkcert](https://github.com/FiloSottile/mkcert)

```bash
mkcert -install

cd certs
mkcert authelia.example.com cherry.example.com
```

3. Start containers

```bash
docker compose up
```

Open https://cherry.example.com in your browser. Login with username `john` password `john`.
