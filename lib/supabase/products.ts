/**
 * @fileoverview Serviço Supabase para catálogo de produtos/serviços.
 *
 * Observação:
 * - O CRM é "adaptável": o catálogo é um acelerador (defaults).
 * - No deal, ainda permitimos itens personalizados (product_id pode ser NULL em deal_items).
 */

import { supabase } from './client';
import { Product, CurrencyCode } from '@/types';
import { sanitizeUUID } from './utils';

function isMissingColumnInSchemaCache(error: unknown, table: string, column: string): boolean {
  const message = String((error as any)?.message ?? '');
  return (
    message.includes(`Could not find the '${column}' column`) &&
    message.includes(`'${table}'`) &&
    message.includes('schema cache')
  );
}

// =============================================================================
// Organization inference (client-side, RLS-safe)
// =============================================================================
let cachedOrgId: string | null = null;
let cachedOrgUserId: string | null = null;

async function getCurrentOrganizationId(): Promise<string | null> {
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  if (cachedOrgUserId === user.id && cachedOrgId) return cachedOrgId;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (error) return null;

  const orgId = sanitizeUUID((profile as any)?.organization_id);
  cachedOrgUserId = user.id;
  cachedOrgId = orgId;
  return orgId;
}

type DbProduct = {
  id: string;
  organization_id: string | null;
  name: string;
  description: string | null;
  price: number;
  currency_code?: string | null;
  sku: string | null;
  active: boolean | null;
  created_at: string;
  updated_at: string;
  owner_id: string | null;
};

function transformProduct(db: DbProduct): Product {
  return {
    id: db.id,
    organizationId: db.organization_id || undefined,
    name: db.name,
    description: db.description || undefined,
    price: Number(db.price ?? 0),
    currencyCode: (db as any).currency_code === 'EUR' ? 'EUR' : 'BRL',
    sku: db.sku || undefined,
    active: db.active ?? true,
  };
}

export const productsService = {
  async getAll(): Promise<{ data: Product[]; error: Error | null }> {
    try {
      if (!supabase) return { data: [], error: new Error('Supabase não configurado') };

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return { data: [], error };

      const rows = (data || []) as DbProduct[];
      // Por padrão mostramos só ativos na UI do deal; mas aqui retorna tudo para o Settings.
      return { data: rows.map(transformProduct), error: null };
    } catch (e) {
      return { data: [], error: e as Error };
    }
  },

  async getActive(): Promise<{ data: Product[]; error: Error | null }> {
    try {
      if (!supabase) return { data: [], error: new Error('Supabase não configurado') };

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) return { data: [], error };

      const rows = (data || []) as DbProduct[];
      return { data: rows.map(transformProduct), error: null };
    } catch (e) {
      return { data: [], error: e as Error };
    }
  },

  async create(input: { name: string; price: number; currencyCode?: CurrencyCode; sku?: string; description?: string }): Promise<{ data: Product | null; error: Error | null }> {
    try {
      if (!supabase) return { data: null, error: new Error('Supabase não configurado') };

      const { data: { user } } = await supabase.auth.getUser();
      const organizationId = await getCurrentOrganizationId();

      const insertPayload: Record<string, unknown> = {
        name: input.name,
        price: input.price,
        currency_code: input.currencyCode || 'BRL',
        sku: input.sku || null,
        description: input.description || null,
        active: true,
        owner_id: sanitizeUUID(user?.id),
        organization_id: organizationId,
      };

      let { data, error } = await supabase
        .from('products')
        .insert(insertPayload)
        .select('*')
        .single();

      if (error && isMissingColumnInSchemaCache(error, 'products', 'currency_code')) {
        const retryPayload = { ...insertPayload };
        delete (retryPayload as any).currency_code;
        const retry = await supabase.from('products').insert(retryPayload).select('*').single();
        data = retry.data as any;
        error = retry.error as any;
      }

      if (error) return { data: null, error };
      return { data: transformProduct(data as DbProduct), error: null };
    } catch (e) {
      return { data: null, error: e as Error };
    }
  },

  async update(id: string, updates: Partial<{ name: string; price: number; currencyCode: CurrencyCode; sku?: string; description?: string; active: boolean }>): Promise<{ error: Error | null }> {
    try {
      if (!supabase) return { error: new Error('Supabase não configurado') };

      const payload: Record<string, unknown> = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.price !== undefined) payload.price = updates.price;
      if (updates.currencyCode !== undefined) payload.currency_code = updates.currencyCode;
      if (updates.sku !== undefined) payload.sku = updates.sku || null;
      if (updates.description !== undefined) payload.description = updates.description || null;
      if (updates.active !== undefined) payload.active = updates.active;
      payload.updated_at = new Date().toISOString();

      let { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', sanitizeUUID(id));

      if (error && isMissingColumnInSchemaCache(error, 'products', 'currency_code')) {
        const retryPayload = { ...(payload as any) };
        delete retryPayload.currency_code;
        const retry = await supabase
          .from('products')
          .update(retryPayload)
          .eq('id', sanitizeUUID(id));
        error = retry.error as any;
      }

      return { error: error ?? null };
    } catch (e) {
      return { error: e as Error };
    }
  },

  async delete(id: string): Promise<{ error: Error | null }> {
    try {
      if (!supabase) return { error: new Error('Supabase não configurado') };
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', sanitizeUUID(id));

      return { error: error ?? null };
    } catch (e) {
      return { error: e as Error };
    }
  },
};
