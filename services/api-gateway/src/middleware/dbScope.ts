import { FastifyReply, FastifyRequest } from 'fastify';
import { createDb } from '@restroops/db';
import { sql } from 'kysely';

export const injectDbWithRls = async (request: FastifyRequest, reply: FastifyReply) => {
  const db = createDb(process.env.DATABASE_URL || '');
  const user = request.user as any;

  if (user) {
    // We wrap the db in a proxy or just attach a helper
    // To ensure RLS works, we need to run SET LOCAL in the same transaction
    (request as any).db = db;
    (request as any).rls = async (callback: (trx: any) => Promise<any>) => {
      return await db.transaction().execute(async (trx) => {
        await sql`SET LOCAL app.user_id = ${user.userId}`.execute(trx as any);
        await sql`SET LOCAL app.user_role = ${user.role}`.execute(trx as any);
        return await callback(trx);
      });
    };
  } else {
    (request as any).db = db;
  }
};

declare module 'fastify' {
  interface FastifyRequest {
    db: any;
    rls: <T>(callback: (trx: any) => Promise<T>) => Promise<T>;
  }
}
