-- Supabase exposes tables in the public schema through its API. Keep these
-- backend-owned tables closed to anon/authenticated API roles by default.
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.flyway_schema_history ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    backend_role name := current_user;
    public_table text;
    exposed_role text;
BEGIN
    FOR public_table IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename = ANY (ARRAY[
              'users',
              'feedback',
              'documents',
              'document_chunks',
              'conversations',
              'messages',
              'game_sessions',
              'flyway_schema_history'
          ])
    LOOP
        EXECUTE format(
            'DROP POLICY IF EXISTS backend_full_access ON public.%I',
            public_table
        );
        EXECUTE format(
            'CREATE POLICY backend_full_access ON public.%I FOR ALL TO %I USING (true) WITH CHECK (true)',
            public_table,
            backend_role
        );
    END LOOP;

    FOREACH exposed_role IN ARRAY ARRAY['anon', 'authenticated']
    LOOP
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = exposed_role) THEN
            EXECUTE format(
                'REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM %I',
                exposed_role
            );
            EXECUTE format(
                'REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM %I',
                exposed_role
            );
            EXECUTE format(
                'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM %I',
                exposed_role
            );
            EXECUTE format(
                'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM %I',
                exposed_role
            );
        END IF;
    END LOOP;
END $$;
