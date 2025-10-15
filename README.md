<img src="https://user-images.githubusercontent.com/1166872/193450149-240171cb-8699-4cdb-a4df-7a63f742d986.png" width="80" height="80" alt="Cherry Logo" />

## Development

```bash
# install dependencies
pnpm i

# create a .env file
cp env.example .env

# generate typing files
pnpm sync

# run the app in dev mode
pnpm dev

# you may want to create an user
pnpm cherry create-user "foo@example.com" "P@ssw0rd" --admin
pnpm cherry set-admin "foo@example.com"
```
