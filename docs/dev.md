Grab libsimple-osx-x64.zip from [wangfenjin/simple/releases](https://github.com/wangfenjin/simple/releases) and put `libsimple.dylib` into `db/` of the project root.

```sql
.mode box

; list triggers
select * from sqlite_master where type = 'trigger';

select rowid, * from migration;
; manual reset migration version
update migration set version = 5 where rowid = 1;
```
