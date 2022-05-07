## Development

```
pnpm dev
pnpm dev --open
pnpm build
pnpm preview

# upgrade SvelteKit
pnpm add -E @sveltejs/{kit,adapter-auto,adapter-vercel}@next
```

## Operation

```sql
-- create an admin user
insert into user (username, isAdmin, createdAt, updatedAt)
values ('haishanhan@gmail.com', 1, strftime('%s','now'), strftime('%s','now'));
```

## References

- [Cloudflare Pages doc](https://developers.cloudflare.com/pages/get-started)
- [SvelteKit doc](https://kit.svelte.dev/docs#anchor-options-sveltekit-prefetch)
- [Svelte doc](https://svelte.dev/docs#template-syntax-element-directives-class-name)
