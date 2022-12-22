# zeliasays

[zeliasays.com](zeliasays.com) application using [deno.land](deno.land) and [deno deploy](deno.com), database is hosted on [baserow.io](baserow.io).

## Run locally

```
env DATABASE_URL="https://api.baserow.io/api/database/rows/table/TABLE_ID/?user_field_names=true" DATABASE_TOKEN="DATABASE_TOKEN" deno run --allow-all --watch --allow-env=DATABASE_URL,DATABASE_TOKEN main.ts
```

## Deploy

```
deployctl deploy --project=zeliasays main.ts
```
