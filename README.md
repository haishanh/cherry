<img src="https://user-images.githubusercontent.com/1166872/193450149-240171cb-8699-4cdb-a4df-7a63f742d986.png" width="80" height="80" alt="Cherry Logo" />

## Development

```bash
# Install dependencies
pnpm i

# Pull required SQLite tokenizer extension
pnpm fetch:signal-tokenizer

# Create a .env file
cp env.example .env

# Generate typing files
pnpm sync

# Run the app in dev mode
pnpm dev

# You may want to create an user
pnpm cherry create-user "foo@example.com" "P@ssw0rd" --admin
pnpm cherry set-admin "foo@example.com"
```
