-- Initialization Script for Supabase / PostgreSQL
-- Docs references: docs/superpowers/specs/2026-04-12-supabase-backend-design.md

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Fixed Configuration Tables

-- annual_targets
CREATE TABLE IF NOT EXISTS public.annual_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER NOT NULL,
    project_type TEXT NOT NULL,
    project_scope TEXT NOT NULL,
    plan_contract NUMERIC(15, 2) DEFAULT 0,
    plan_payment NUMERIC(15, 2) DEFAULT 0
);

-- staff
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT,
    department TEXT,
    is_active BOOLEAN DEFAULT true
);

-- log_standards
CREATE TABLE IF NOT EXISTS public.log_standards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name TEXT NOT NULL,
    project_phase BOOLEAN DEFAULT false,
    opportunity_phase BOOLEAN DEFAULT false,
    department_log BOOLEAN DEFAULT false,
    is_shared BOOLEAN DEFAULT false,
    description TEXT
);

-- project_opportunity_mapping
CREATE TABLE IF NOT EXISTS public.project_opportunity_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uid TEXT UNIQUE,
    project_name TEXT,
    project_code TEXT,
    opportunity_code TEXT,
    opportunity_name TEXT
);

-- 2. Variable Data Tables (Updated via Excel)

-- import_batches
CREATE TABLE IF NOT EXISTS public.import_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT,
    table_name TEXT,
    row_count INTEGER DEFAULT 0,
    uploaded_by TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    status TEXT
);

-- projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seq INTEGER,
    region TEXT,
    name TEXT,
    code TEXT,
    project_type TEXT,
    pm TEXT,
    sales TEXT,
    client TEXT,
    contract_amount NUMERIC(15, 2) DEFAULT 0,
    contract_date DATE,
    deadline DATE,
    received_payment NUMERIC(15, 2) DEFAULT 0,
    pending_payment NUMERIC(15, 2) DEFAULT 0,
    status TEXT,
    est_external_dept NUMERIC(15, 2) DEFAULT 0,
    est_business_cost NUMERIC(15, 2) DEFAULT 0,
    est_procurement_net NUMERIC(15, 2) DEFAULT 0,
    est_procurement_total NUMERIC(15, 2) DEFAULT 0,
    est_external_total NUMERIC(15, 2) DEFAULT 0,
    est_internal NUMERIC(15, 2) DEFAULT 0,
    actual_procurement NUMERIC(15, 2) DEFAULT 0,
    procurement_paid NUMERIC(15, 2) DEFAULT 0,
    procurement_pending NUMERIC(15, 2) DEFAULT 0,
    payment_note TEXT,
    external_dept_cost NUMERIC(15, 2) DEFAULT 0,
    internal_dept_cost NUMERIC(15, 2) DEFAULT 0,
    reimbursement_cost NUMERIC(15, 2) DEFAULT 0,
    total_cost_incurred NUMERIC(15, 2) DEFAULT 0,
    cost_progress TEXT,
    progress_estimate TEXT,
    risk TEXT,
    quarterly_focus TEXT,
    weekly_progress TEXT,
    weekly_plan TEXT,
    total_plan_cost NUMERIC(15, 2) DEFAULT 0,
    total_plan_delivery_cost NUMERIC(15, 2) DEFAULT 0,
    total_plan_business_cost NUMERIC(15, 2) DEFAULT 0,
    internal_to_external_project_cost NUMERIC(15, 2) DEFAULT 0,
    import_batch_id UUID REFERENCES public.import_batches(id)
);

-- procurements
CREATE TABLE IF NOT EXISTS public.procurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seq INTEGER,
    type TEXT,
    region TEXT,
    project_name TEXT,
    project_code TEXT,
    pm TEXT,
    status TEXT,
    contract_name TEXT,
    vendor TEXT,
    contract_amount NUMERIC(15, 2) DEFAULT 0,
    cumulative_paid NUMERIC(15, 2) DEFAULT 0,
    q1_actual NUMERIC(15, 2) DEFAULT 0,
    q2_estimated NUMERIC(15, 2) DEFAULT 0,
    q3_estimated NUMERIC(15, 2) DEFAULT 0,
    q4_estimated NUMERIC(15, 2) DEFAULT 0,
    note TEXT,
    import_batch_id UUID REFERENCES public.import_batches(id)
);

-- acceptance_projects
CREATE TABLE IF NOT EXISTS public.acceptance_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seq INTEGER,
    region TEXT,
    name TEXT,
    pm TEXT,
    sales TEXT,
    client TEXT,
    contract_amount NUMERIC(15, 2) DEFAULT 0,
    contract_date DATE,
    deadline DATE,
    received_payment NUMERIC(15, 2) DEFAULT 0,
    pending_payment NUMERIC(15, 2) DEFAULT 0,
    acceptance_status TEXT,
    payment_status TEXT,
    risk TEXT,
    import_batch_id UUID REFERENCES public.import_batches(id)
);

-- opportunities
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seq INTEGER,
    region TEXT,
    sales TEXT,
    budget_match TEXT,
    next_step TEXT,
    opp_total_amount NUMERIC(15, 2) DEFAULT 0,
    expense_diff NUMERIC(15, 2) DEFAULT 0,
    plan_estimated_total NUMERIC(15, 2) DEFAULT 0,
    scene_xingjiu TEXT,
    scene_renminjianyi TEXT,
    scene_redian TEXT,
    scene_yizhangtu TEXT,
    scene_lianggefugai TEXT,
    scene_xiehui TEXT,
    budget_status TEXT,
    note TEXT,
    market_next_step TEXT,
    import_batch_id UUID REFERENCES public.import_batches(id)
);

-- project_logs
CREATE TABLE IF NOT EXISTS public.project_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name TEXT,
    project_code TEXT,
    pm TEXT,
    department TEXT,
    task_name TEXT,
    content TEXT,
    hours NUMERIC(15, 2) DEFAULT 0,
    amount NUMERIC(15, 2) DEFAULT 0,
    status TEXT,
    reporter TEXT,
    reporter_dept TEXT,
    date DATE,
    period_start DATE,
    period_end DATE,
    import_batch_id UUID REFERENCES public.import_batches(id)
);

-- opportunity_logs
CREATE TABLE IF NOT EXISTS public.opportunity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opp_name TEXT,
    opp_code TEXT,
    sales TEXT,
    sales_dept TEXT,
    task_type TEXT,
    content TEXT,
    hours NUMERIC(15, 2) DEFAULT 0,
    amount NUMERIC(15, 2) DEFAULT 0,
    status TEXT,
    reporter TEXT,
    reporter_dept TEXT,
    date DATE,
    period_start DATE,
    period_end DATE,
    import_batch_id UUID REFERENCES public.import_batches(id)
);

-- department_logs
CREATE TABLE IF NOT EXISTS public.department_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dept_name TEXT,
    task_name TEXT,
    content TEXT,
    hours NUMERIC(15, 2) DEFAULT 0,
    amount NUMERIC(15, 2) DEFAULT 0,
    external_amount NUMERIC(15, 2) DEFAULT 0,
    status TEXT,
    reporter TEXT,
    reporter_dept TEXT,
    date DATE,
    period_start DATE,
    period_end DATE,
    import_batch_id UUID REFERENCES public.import_batches(id)
);

-- manual_costs
CREATE TABLE IF NOT EXISTS public.manual_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item TEXT,
    year INTEGER,
    quarter INTEGER,
    amount NUMERIC(15, 2) DEFAULT 0,
    project_type TEXT,
    note TEXT
);

-- Simplified RLS constraints (Everything is public to Super Admin according to design: "不设计管理后台。内置两账号...")
ALTER TABLE public.annual_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_opportunity_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acceptance_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow All on annual_targets" ON public.annual_targets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on staff" ON public.staff FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on log_standards" ON public.log_standards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on project_opportunity_mapping" ON public.project_opportunity_mapping FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on import_batches" ON public.import_batches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on procurements" ON public.procurements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on acceptance_projects" ON public.acceptance_projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on opportunities" ON public.opportunities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on project_logs" ON public.project_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on opportunity_logs" ON public.opportunity_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on department_logs" ON public.department_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on manual_costs" ON public.manual_costs FOR ALL USING (true) WITH CHECK (true);
