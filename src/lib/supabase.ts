import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key'

let supabase: any;
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (e) {
  console.error('Failed to initialize Supabase client:', e);
  // 创建一个无法正常工作的桩对象，防止导入该模块的文件崩溃
  const stubPromise = Promise.resolve({ data: [], error: null });
  const stub = {
    select: () => stub,
    order: () => stub,
    insert: () => Promise.resolve({ data: [], error: { message: 'Supabase not initialized' } }),
    delete: () => stub,
    neq: () => stub,
    eq: () => stub,
    update: () => stub,
    then: (onfulfilled: any) => stubPromise.then(onfulfilled),
  } as any;
  supabase = {
    from: () => stub,
  };
}

export { supabase };
