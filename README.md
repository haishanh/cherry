## Development

```bash
pnpm dev
pnpm dev --open
pnpm build
pnpm preview

# upgrade SvelteKit
pnpm add -E @sveltejs/{kit,adapter-auto,adapter-vercel}@next
```

## API

```bash
# signup
http localhost:5173/api/auth/signup "email=test@haishan.me"

# get bookmarks of a user
xh -A bearer -a $PAT :5173/api/bookmarks
# create bookmark
xh -A bearer -a $PAT post :5173/api/bookmarks "url=https://google.com"

# update a bookmark
# // below curl removes all tags on bookmark 1000
curl "$BASE/api/bookmarks/1000" \
  -H "Authorization: Bearer ${JWT}" \
  -H "content-type: application/json" \
  -X PATCH \
  -d '{"tags":[]}'

# delete a bookmark
http DELETE localhost:5173/api/bookmarks/42 "Authorization: Bearer ${JWT}"

# stash bookmarks
http POST localhost:3000/api/bookmarks/operations/stash "Authorization: Bearer ${JWT}"   "key=abc" "ids[]=363"
# restore bookmarks
http POST localhost:3000/api/bookmarks/operations/restore "Authorization: Bearer ${JWT}" "key=abc"

## update tag name
http PATCH localhost:5173/api/tags/233 "Authorization: Bearer ${JWT}" name=hello
```

### Internal Admin API

```bash
# migrate **content** from "current" db file to a new one
http POST localhost:5173/api/_internal/migration to=db/03.sqlite
xh post :5173/api/_internal/delete-dangle-bookmark-tag
xh :5173/api/ping
xh post :5173/api/_internal/delete-user id=xx username=asdfa@xcc

xh post :5173/api/_internal/delete-user id=7 username=ch004@haishan.me


# equivalent curl
curl -XPOST 'http://localhost:3000/api/_internal/create-user' -H "content-type: application/json" -d '{"username":"john@example.com","password":"123"}'
curl -XPOST 'http://localhost:3000/api/_internal/update-user-password' -H "content-type: application/json" -d '{"username":"john@example.com","newPassword":"123"}'
curl -XPOST 'http://localhost:3000/api/_internal/migration' -H "content-type: application/json" -d '{"to":"/data/05.sqlite"}'
curl -XPOST 'http://localhost:3000/api/_internal/delete-dangle-bookmark-tag'
```

## sql

#### search

```sql
-- search bookmarks of an user that have specific tags
with original as (
  select id , title , desc , url , updatedAt from bookmark b
    join bookmark_tag t0 on t0.bookmarkId = b.id
    join bookmark_tag t1 on t1.bookmarkId = b.id
    where userId = 1
    and t0.tagId = 12
    and t1.tagId = 11
) select original.* from original join bookmark_fts on original.id = bookmark_fts.rowid where bookmark_fts match 'toolkit' order by bookmark_fts.rank;

-- currently, in bookmark_fts virtual table we also have the "userId" column
-- so we now have 2 ways to search users bookmarks

-- solution1
with original as (
  select id , title , desc , url , updatedAt from bookmark
) select original.* from original join bookmark_fts on original.id = bookmark_fts.rowid where bookmark_fts match 'toolkit' and bookmark_fts.userId = 1 order by bookmark_fts.rank;

-- solution2
with original as (
  select id , title , desc , url , updatedAt from bookmark b where userId = 1
) select original.* from original join bookmark_fts on original.id = bookmark_fts.rowid where bookmark_fts match 'toolkit' order by bookmark_fts.rank;

-- also shoud check the perf of with...as

select b.id, b.title, b.desc, b.url, b.updatedAt from bookmark b
  join bookmark_fts on b.id = bookmark_fts.rowid where bookmark_fts match 'toolkit' and b.userId = 1;

with original as (
  select id , title , desc , url , updatedAt from bookmark b where userId = 1
) select original.* from original join bookmark_fts on original.id = bookmark_fts.rowid where bookmark_fts match 'toolkit';
```

## Env

**PUBLIC_ICON_SERVICE**

Optional, favicon URL template, it should contain a `{}` which will be replaced by the domain name of the url. Other possible values: `https://icons.duckduckgo.com/ip3/{}.ico`, `https://www.google.com/s2/favicons?domain={}&sz=32`

## References

- [Cloudflare Pages doc](https://developers.cloudflare.com/pages/get-started)
- [SvelteKit doc](https://kit.svelte.dev/docs#anchor-options-sveltekit-prefetch)
- [Svelte doc](https://svelte.dev/docs#template-syntax-element-directives-class-name)
