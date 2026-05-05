# Supabase Migrations

This folder contains the SQL migration foundation for OpsPilot / ServiceOps Command Center.

Apply locally after installing and configuring the Supabase CLI:

```bash
supabase start
supabase db reset
supabase db lint
```

No production seed data is included. `seed.sql` is intentionally empty until local demo data is explicitly requested.
