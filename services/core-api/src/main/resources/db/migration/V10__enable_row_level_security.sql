-- Supabase exposes tables in the public schema through its API. Keep these
-- backend-owned tables closed to anon/authenticated API roles by default.
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.game_sessions ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    backend_role name := current_user;
    public_table text;
    public_sequence record;
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
              'game_sessions'
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
                      'game_sessions'
                  ])
            LOOP
                EXECUTE format(
                    'REVOKE ALL PRIVILEGES ON TABLE public.%I FROM %I',
                    public_table,
                    exposed_role
                );
            END LOOP;

            FOR public_sequence IN
                SELECT sequence_namespace.nspname AS sequence_schema,
                       sequence_class.relname AS sequence_name
                FROM pg_class sequence_class
                JOIN pg_namespace sequence_namespace
                  ON sequence_namespace.oid = sequence_class.relnamespace
                JOIN pg_depend dependency
                  ON dependency.objid = sequence_class.oid
                 AND dependency.deptype IN ('a', 'i')
                JOIN pg_class table_class
                  ON table_class.oid = dependency.refobjid
                JOIN pg_namespace table_namespace
                  ON table_namespace.oid = table_class.relnamespace
                WHERE sequence_class.relkind = 'S'
                  AND table_namespace.nspname = 'public'
                  AND table_class.relname = ANY (ARRAY[
                      'users',
                      'feedback',
                      'documents',
                      'document_chunks',
                      'conversations',
                      'messages',
                      'game_sessions'
                  ])
            LOOP
                EXECUTE format(
                    'REVOKE ALL PRIVILEGES ON SEQUENCE %I.%I FROM %I',
                    public_sequence.sequence_schema,
                    public_sequence.sequence_name,
                    exposed_role
                );
            END LOOP;

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
