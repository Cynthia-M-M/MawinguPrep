import { Question } from './supabase';

// Offline fallback seed questions aligned with AZ-900 skills outline
// These are original practice questions - NOT real exam questions
export const SEED_QUESTIONS: Question[] = [
  // Cloud Concepts
  {
    id: 'q1',
    domain: 'Cloud Concepts',
    concept: 'CapEx vs OpEx',
    question_text: 'Which cloud model shifts IT costs from capital expense (CapEx) to operational expense (OpEx)?',
    options: ['Public Cloud', 'Private Cloud', 'On-Premises Data Center', 'Hybrid Cloud'],
    correct_answer: 'Public Cloud',
  },
  {
    id: 'q2',
    domain: 'Cloud Concepts',
    concept: 'High Availability',
    question_text: 'A company needs their Azure application to remain running even if one data center goes offline. Which benefit of the cloud does this describe?',
    options: ['Scalability', 'High Availability', 'Disaster Recovery', 'Elasticity'],
    correct_answer: 'High Availability',
  },
  {
    id: 'q3',
    domain: 'Cloud Concepts',
    concept: 'Cloud Service Models',
    question_text: 'Which cloud service model gives you the MOST control over the underlying operating system and runtime environment?',
    options: ['SaaS', 'PaaS', 'IaaS', 'FaaS'],
    correct_answer: 'IaaS',
  },
  {
    id: 'q4',
    domain: 'Cloud Concepts',
    concept: 'Consumption-Based Model',
    question_text: 'Your startup only runs a batch job on the last day of each month. What Azure pricing benefit is MOST relevant?',
    options: ['Reserved Instances', 'Consumption-based pricing', 'Enterprise Agreement', 'Spot Pricing'],
    correct_answer: 'Consumption-based pricing',
  },
  {
    id: 'q5',
    domain: 'Cloud Concepts',
    concept: 'Shared Responsibility Model',
    question_text: 'When using Azure SQL Database (PaaS), who is responsible for patching the operating system?',
    options: ['The customer', 'Microsoft', 'Both equally', 'A third-party auditor'],
    correct_answer: 'Microsoft',
  },

  // Architecture & Services
  {
    id: 'q6',
    domain: 'Architecture & Services',
    concept: 'Azure Functions',
    question_text: 'Which Azure service lets you run code in response to events without managing any server infrastructure?',
    options: ['Azure Virtual Machines', 'Azure Functions', 'Azure App Service', 'Azure Kubernetes Service'],
    correct_answer: 'Azure Functions',
  },
  {
    id: 'q7',
    domain: 'Architecture & Services',
    concept: 'Azure Regions and Availability Zones',
    question_text: 'A company wants to protect their Azure VMs from a failure affecting a single physical rack in a data center. What should they use?',
    options: ['Azure Region Pairs', 'Azure Availability Zones', 'Azure Resource Groups', 'Azure Management Groups'],
    correct_answer: 'Azure Availability Zones',
  },
  {
    id: 'q8',
    domain: 'Architecture & Services',
    concept: 'Azure Storage',
    question_text: 'You need to store millions of unstructured files like images and videos in Azure. Which service should you use?',
    options: ['Azure SQL Database', 'Azure Blob Storage', 'Azure Table Storage', 'Azure File Share'],
    correct_answer: 'Azure Blob Storage',
  },
  {
    id: 'q9',
    domain: 'Architecture & Services',
    concept: 'Azure Virtual Network',
    question_text: 'Which Azure service enables you to create an isolated, private network environment in Azure?',
    options: ['Azure Load Balancer', 'Azure VPN Gateway', 'Azure Virtual Network', 'Azure ExpressRoute'],
    correct_answer: 'Azure Virtual Network',
  },
  {
    id: 'q10',
    domain: 'Architecture & Services',
    concept: 'Azure App Service',
    question_text: 'A developer wants to host a web API in Azure without managing servers, but needs more control than Azure Functions. Which service is BEST?',
    options: ['Azure Virtual Machines', 'Azure App Service', 'Azure Container Registry', 'Azure Logic Apps'],
    correct_answer: 'Azure App Service',
  },

  // Management & Governance
  {
    id: 'q11',
    domain: 'Management & Governance',
    concept: 'Azure Policy',
    question_text: 'Which Azure service automatically evaluates resources to ensure they comply with your corporate rules and standards?',
    options: ['Azure Monitor', 'Azure Active Directory', 'Azure Policy', 'Azure Blueprints'],
    correct_answer: 'Azure Policy',
  },
  {
    id: 'q12',
    domain: 'Management & Governance',
    concept: 'Azure Cost Management',
    question_text: 'Your team wants to be notified when their Azure spending is about to exceed a monthly budget. Which feature should they use?',
    options: ['Azure Advisor', 'Azure Cost Management + Budget Alerts', 'Azure Monitor Alerts', 'Azure Service Health'],
    correct_answer: 'Azure Cost Management + Budget Alerts',
  },
  {
    id: 'q13',
    domain: 'Management & Governance',
    concept: 'Role-Based Access Control',
    question_text: 'A developer should be able to read Azure resources but NOT make any changes. Which built-in RBAC role should you assign?',
    options: ['Owner', 'Contributor', 'Reader', 'User Access Administrator'],
    correct_answer: 'Reader',
  },
  {
    id: 'q14',
    domain: 'Management & Governance',
    concept: 'Azure Resource Manager',
    question_text: 'Which Azure feature allows you to deploy resources from a JSON or Bicep template to ensure consistent, repeatable deployments?',
    options: ['Azure Policy', 'ARM Templates', 'Azure Advisor', 'Azure Monitor'],
    correct_answer: 'ARM Templates',
  },
  {
    id: 'q15',
    domain: 'Management & Governance',
    concept: 'Azure Service Health',
    question_text: 'You want to receive notifications when Azure services that YOUR resources depend on have outages or planned maintenance. What should you use?',
    options: ['Azure Monitor', 'Azure Service Health', 'Azure Advisor', 'Azure Policy'],
    correct_answer: 'Azure Service Health',
  },
];

export const DOMAIN_COLORS = {
  'Cloud Concepts': '#6366f1',
  'Architecture & Services': '#06b6d4',
  'Management & Governance': '#10b981',
} as const;

export const DOMAIN_ICONS = {
  'Cloud Concepts': '☁️',
  'Architecture & Services': '⚡',
  'Management & Governance': '🛡️',
} as const;
