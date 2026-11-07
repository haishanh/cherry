# Bookmark imports

Import CSV, browser (Netscape bookmark HTML), or legacy Pocket HTML exports from **Settings → Import**.

1. Select a file and choose how to handle existing bookmarks.
2. Click **Preview import**. This validates the file and shows counts without saving anything.
3. Review invalid-record messages, then click **Confirm import** to save valid records.

## Limits and validation

- Maximum **10 MiB** of UTF-8 data and **10,000 bookmark records** per request. Split larger exports into smaller files. Limits are shared by the UI and server in `src/lib/import.ts`.
- The server checks actual streamed bytes, even without a trustworthy `Content-Length` header, and stops processing oversized uploads. Unread bytes are drained by the Node adapter after responding so clients receive a JSON error rather than a connection reset.
- Reverse proxies and SvelteKit's `BODY_SIZE_LIMIT` may impose a lower upload limit. Docker currently allows 50 MiB at the Node layer; the import endpoint still enforces 10 MiB.
- Only absolute `http://` and `https://` bookmark URLs are accepted. No bookmark URLs are fetched during validation.
- CSV requires a `url` header. Optional columns are `title`, `description`, `folder` (or `group`), `tags`, and `created`. Column names are case-insensitive. Unknown columns are ignored.
- CSV supports UTF-8 BOMs, CR/LF line endings, embedded commas/newlines, escaped double quotes, and empty trailing cells. Each data record must have the same number of columns as the header.
- CSV files are limited to 100 columns, and each bookmark may contain at most 100 comma-separated tag entries. These bounds prevent unusually wide records from exhausting memory.
- Tags are comma-separated, trimmed, and deduplicated; blank tags are ignored.
- `created` accepts nonnegative Unix seconds or a date string accepted by JavaScript (ISO dates recommended). Browser `ADD_DATE` and Pocket `time_added` are preserved. Missing dates default to import time; invalid dates are reported rather than silently discarded.
- Browser folder paths are joined with `/`, HTML entities are decoded, and title text is preserved. Folder nesting is limited to 128 levels.

## Duplicates

Duplicates match the **exact URL after trimming surrounding whitespace**, within the signed-in user's library only. No URL canonicalization or tracking-parameter removal is performed.

- **Skip duplicates** (default): existing bookmarks, tags, and metadata remain unchanged.
- **Merge tags only**: add imported tags to an existing bookmark, preserving its title, description, folder, dates, and existing tags. Repeating this operation is safe.
- Within one file, the **first valid occurrence wins**; subsequent occurrences of that URL are skipped in either mode.
- Skipped/invalid rows do not create orphan tags or folders.

## Results and recovery

Results include `total`, `imported`, `merged`, `skipped`, `failed`, `duplicates`, and up to 20 `issues` (`row` and `message`). Counts satisfy `total = imported + merged + skipped + failed`; `duplicates` is informational and overlaps merged/skipped counts. The legacy `count` field is `imported + merged`.

`row` identifies a logical record: CSV record 1 is the header (blank lines are ignored and multiline quoted fields are one record); HTML records count bookmark links starting at 1.

- Invalid individual records are counted as `failed`; other valid records can still be imported. Fix invalid records and re-import them.
- Invalid file structure or exceeding a limit rejects the entire request before any database changes.
- All database writes (bookmarks, folders, tags, bindings, counters, and search index changes) share one transaction. Any database failure rolls everything back and returns an error instead of a misleading success count.
- If a connection fails after confirmation, the outcome may be unknown. Preview again before retrying; duplicate handling prevents creating duplicate bookmarks.
- Previews are advisory, not stored server-side. Confirmation re-uploads and revalidates the file against the current library, so counts may change.

## API

POST the raw file body to `/api/import/csv`, `/api/import/netscape-bookmark-file-1`, or `/api/import/pocket`. The original `/api/import` Pocket endpoint remains supported. Existing cookie/Bearer authentication is required.

Query parameters:

- `preview=1` validates and counts without writing; `preview=0` (default) commits.
- `duplicates=skip` (default) or `duplicates=merge-tags`.

Successful requests return the result object with `preview` indicating the operation. File/option validation errors return `400`, upload size errors `413`, and rolled-back database failures `500`, with a human-readable `message`.

Processing is currently synchronous and bounded by the limits above. Background jobs, resumable uploads, and live progress are not implemented.
