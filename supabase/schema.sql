-- ╔════════════════════════════════════════════════════════════════╗
-- ║  MawinguPrep – Supabase SQL Schema                            ║
-- ║  Run this in your Supabase SQL Editor                         ║
-- ╚════════════════════════════════════════════════════════════════╝

-- 1. Readiness scores table (tracks learner progress across 3 AZ-900 domains)
CREATE TABLE IF NOT EXISTS public.readiness_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL UNIQUE,
  cloud_concepts INT DEFAULT 0 CHECK (cloud_concepts BETWEEN 0 AND 100),
  architecture_services INT DEFAULT 0 CHECK (architecture_services BETWEEN 0 AND 100),
  management_governance INT DEFAULT 0 CHECK (management_governance BETWEEN 0 AND 100),
  questions_attempted INT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Questions table (supports fetching domain-specific questions from DB)
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL CHECK (domain IN ('Cloud Concepts', 'Architecture & Services', 'Management & Governance')),
  concept TEXT NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Enable Row Level Security (RLS) - allow all for anon reads/writes
ALTER TABLE public.readiness_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on readiness_scores" ON public.readiness_scores
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow select on questions" ON public.questions
  FOR SELECT USING (true);

-- 4. Seed: original practice questions (NOT real exam questions — UNOFFICIAL)
INSERT INTO public.questions (domain, concept, question_text, options, correct_answer) VALUES
('Cloud Concepts', 'CapEx vs OpEx',
 'Which cloud model shifts IT costs from capital expense (CapEx) to operational expense (OpEx)?',
 '["Public Cloud", "Private Cloud", "On-Premises Data Center", "Hybrid Cloud"]',
 'Public Cloud'),

('Cloud Concepts', 'High Availability',
 'A company needs their Azure application to remain running even if one data center goes offline. Which benefit of the cloud does this describe?',
 '["Scalability", "High Availability", "Disaster Recovery", "Elasticity"]',
 'High Availability'),

('Cloud Concepts', 'Cloud Service Models',
 'Which cloud service model gives you the MOST control over the underlying operating system and runtime environment?',
 '["SaaS", "PaaS", "IaaS", "FaaS"]',
 'IaaS'),

('Cloud Concepts', 'Consumption-Based Model',
 'Your startup only runs a batch job on the last day of each month. What Azure pricing benefit is MOST relevant?',
 '["Reserved Instances", "Consumption-based pricing", "Enterprise Agreement", "Spot Pricing"]',
 'Consumption-based pricing'),

('Cloud Concepts', 'Shared Responsibility Model',
 'When using Azure SQL Database (PaaS), who is responsible for patching the operating system?',
 '["The customer", "Microsoft", "Both equally", "A third-party auditor"]',
 'Microsoft'),

('Architecture & Services', 'Azure Functions',
 'Which Azure service lets you run code in response to events without managing any server infrastructure?',
 '["Azure Virtual Machines", "Azure Functions", "Azure App Service", "Azure Kubernetes Service"]',
 'Azure Functions'),

('Architecture & Services', 'Azure Regions and Availability Zones',
 'A company wants to protect their Azure VMs from a failure affecting a single physical rack in a data center. What should they use?',
 '["Azure Region Pairs", "Azure Availability Zones", "Azure Resource Groups", "Azure Management Groups"]',
 'Azure Availability Zones'),

('Architecture & Services', 'Azure Storage',
 'You need to store millions of unstructured files like images and videos in Azure. Which service should you use?',
 '["Azure SQL Database", "Azure Blob Storage", "Azure Table Storage", "Azure File Share"]',
 'Azure Blob Storage'),

('Architecture & Services', 'Azure Virtual Network',
 'Which Azure service enables you to create an isolated, private network environment in Azure?',
 '["Azure Load Balancer", "Azure VPN Gateway", "Azure Virtual Network", "Azure ExpressRoute"]',
 'Azure Virtual Network'),

('Architecture & Services', 'Azure App Service',
 'A developer wants to host a web API in Azure without managing servers, but needs more control than Azure Functions. Which service is BEST?',
 '["Azure Virtual Machines", "Azure App Service", "Azure Container Registry", "Azure Logic Apps"]',
 'Azure App Service'),

('Management & Governance', 'Azure Policy',
 'Which Azure service automatically evaluates resources to ensure they comply with your corporate rules and standards?',
 '["Azure Monitor", "Azure Active Directory", "Azure Policy", "Azure Blueprints"]',
 'Azure Policy'),

('Management & Governance', 'Azure Cost Management',
 'Your team wants to be notified when their Azure spending is about to exceed a monthly budget. Which feature should they use?',
 '["Azure Advisor", "Azure Cost Management + Budget Alerts", "Azure Monitor Alerts", "Azure Service Health"]',
 'Azure Cost Management + Budget Alerts'),

('Management & Governance', 'Role-Based Access Control',
 'A developer should be able to read Azure resources but NOT make any changes. Which built-in RBAC role should you assign?',
 '["Owner", "Contributor", "Reader", "User Access Administrator"]',
 'Reader'),

('Management & Governance', 'Azure Resource Manager',
 'Which Azure feature allows you to deploy resources from a JSON or Bicep template to ensure consistent, repeatable deployments?',
 '["Azure Policy", "ARM Templates", "Azure Advisor", "Azure Monitor"]',
 'ARM Templates'),

('Management & Governance', 'Azure Service Health',
 'You want to receive notifications when Azure services that YOUR resources depend on have outages or planned maintenance. What should you use?',
 '["Azure Monitor", "Azure Service Health", "Azure Advisor", "Azure Policy"]',
 'Azure Service Health');
