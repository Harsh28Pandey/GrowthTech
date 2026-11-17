import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { Role } from '../models/Role.js';
import { User } from '../models/User.js';
import { Record } from '../models/Record.js';
import { ALL_PERMISSION_KEYS, DEFAULT_ROLE_PERMISSIONS } from '../utils/permissions.js';

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB.');

    console.log('Clearing old data...');
    await Promise.all([
      User.deleteMany({}),
      Role.deleteMany({}),
      Record.deleteMany({}),
    ]);
    console.log('Old collections cleared.');

    // 1. Seed Roles
    console.log('Seeding roles...');
    const adminRole = await Role.create({
      name: 'admin',
      displayName: 'Administrator',
      description: 'Super user with unrestricted access to all system entities and settings',
      isSystem: true,
      permissions: ALL_PERMISSION_KEYS,
    });

    const managerRole = await Role.create({
      name: 'manager',
      displayName: 'Project Manager',
      description: 'Can manage all projects and view users across the organization',
      isSystem: true,
      permissions: DEFAULT_ROLE_PERMISSIONS.manager,
    });

    const userRole = await Role.create({
      name: 'user',
      displayName: 'Standard User',
      description: 'Regular user access to personal workspace and assigned projects',
      isSystem: true,
      permissions: DEFAULT_ROLE_PERMISSIONS.user,
    });

    console.log('Roles created: Admin, Manager, User.');

    // 2. Seed Default Admin User
    console.log('Seeding default administrator...');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@growthtech.com',
      password: 'Admin@1234',
      role: adminRole._id,
      status: 'active',
      lastLogin: new Date(),
    });
    console.log(`Created admin user: admin@growthtech.com (Admin@1234)`);

    // 3. Seed 10 Sample Users
    console.log('Seeding 10 sample users...');
    const sampleUsersData = [
      {
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@growthtech.com',
        password: 'User@1234',
        role: managerRole._id,
        status: 'active',
      },
      {
        name: 'David Chen',
        email: 'david.chen@growthtech.com',
        password: 'User@1234',
        role: managerRole._id,
        status: 'active',
      },
      {
        name: 'Elena Rostova',
        email: 'elena.rostova@growthtech.com',
        password: 'User@1234',
        role: userRole._id,
        status: 'active',
      },
      {
        name: 'Marcus Brody',
        email: 'marcus.brody@growthtech.com',
        password: 'User@1234',
        role: userRole._id,
        status: 'active',
      },
      {
        name: 'Amina Diallo',
        email: 'amina.diallo@growthtech.com',
        password: 'User@1234',
        role: userRole._id,
        status: 'active',
      },
      {
        name: 'Liam O’Connor',
        email: 'liam.oconnor@growthtech.com',
        password: 'User@1234',
        role: userRole._id,
        status: 'active',
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@growthtech.com',
        password: 'User@1234',
        role: userRole._id,
        status: 'active',
      },
      {
        name: 'Carlos Mendez',
        email: 'carlos.mendez@growthtech.com',
        password: 'User@1234',
        role: userRole._id,
        status: 'active',
      },
      {
        name: 'Rachel Green',
        email: 'rachel.green@growthtech.com',
        password: 'User@1234',
        role: userRole._id,
        status: 'inactive', // Inactive user for testing deactivation
      },
      {
        name: 'Kenji Sato',
        email: 'kenji.sato@growthtech.com',
        password: 'User@1234',
        role: userRole._id,
        status: 'active',
      },
    ];

    const createdUsers = await User.create(sampleUsersData);
    console.log(`Created ${createdUsers.length} sample users.`);

    // Pool of all creators
    const allUsers = [adminUser, ...createdUsers];

    // 4. Seed 20 Sample Projects / Records
    console.log('Seeding 20 sample project records...');
    const projectTemplates = [
      {
        title: 'Cloud Infrastructure Migration',
        description: 'Migrate core backend services from legacy bare-metal servers to resilient AWS ECS container clusters.',
        category: 'Engineering',
        status: 'in-progress',
        priority: 'high',
        dueOffsetDays: 14,
      },
      {
        title: 'Q3 Product Growth Campaign',
        description: 'Coordinate cross-platform content and performance advertising targeting mid-market B2B tech leads.',
        category: 'Marketing',
        status: 'completed',
        priority: 'medium',
        dueOffsetDays: -5,
      },
      {
        title: 'Enterprise Single Sign-On (SSO)',
        description: 'Implement SAML 2.0 and OIDC integrations for Okta, Azure AD, and Google Workspace identity providers.',
        category: 'Engineering',
        status: 'pending',
        priority: 'high',
        dueOffsetDays: 30,
      },
      {
        title: 'Design System 2.0 Tokens & Kit',
        description: 'Standardize Figma design tokens, color ramps, typography scales, and accessible component guidelines.',
        category: 'Design',
        status: 'completed',
        priority: 'medium',
        dueOffsetDays: -12,
      },
      {
        title: 'Annual SOC2 Type II Audit',
        description: 'Collate security policy evidence, access review attestations, and runbook logs for external compliance auditors.',
        category: 'Operations',
        status: 'in-progress',
        priority: 'high',
        dueOffsetDays: 20,
      },
      {
        title: 'Customer Onboarding Flow Redesign',
        description: 'Streamline the 5-step registration funnel down to a 2-step wizard to reduce sign-up drop-off rates.',
        category: 'Design',
        status: 'in-progress',
        priority: 'medium',
        dueOffsetDays: 10,
      },
      {
        title: 'FY27 Revenue Forecasting Model',
        description: 'Develop Monte Carlo revenue forecasting spreadsheets aligned with recurring subscription cohort retention curves.',
        category: 'Finance',
        status: 'pending',
        priority: 'low',
        dueOffsetDays: 45,
      },
      {
        title: 'Engineering Technical Interview Rubric',
        description: 'Revise live coding and architectural assessment criteria for senior and staff full-stack engineer candidates.',
        category: 'Human Resources',
        status: 'completed',
        priority: 'medium',
        dueOffsetDays: -2,
      },
      {
        title: 'B2B Sales Pipeline Expansion',
        description: 'Target outreach to enterprise VP Engineering prospects in North America and Western Europe SaaS sectors.',
        category: 'Sales',
        status: 'in-progress',
        priority: 'high',
        dueOffsetDays: 18,
      },
      {
        title: 'Database Query Optimization & Index Tuning',
        description: 'Audit slow query logs, add missing compound indexes on records collection, and optimize aggregation pipelines.',
        category: 'Engineering',
        status: 'completed',
        priority: 'high',
        dueOffsetDays: -8,
      },
      {
        title: 'Mobile App Wireframing (iOS & Android)',
        description: 'Produce high-fidelity wireframes and click-through prototypes for next-quarter mobile client rollout.',
        category: 'Design',
        status: 'pending',
        priority: 'medium',
        dueOffsetDays: 35,
      },
      {
        title: 'Automated CI/CD Vulnerability Scanner',
        description: 'Integrate Trivy container scanning and SonarQube static code analysis directly into GitHub Actions pull request gates.',
        category: 'Engineering',
        status: 'in-progress',
        priority: 'high',
        dueOffsetDays: 12,
      },
      {
        title: 'Vendor Contract Renegotiation',
        description: 'Consolidate redundant SaaS tooling licenses and renegotiate cloud hosting enterprise commitments.',
        category: 'Finance',
        status: 'completed',
        priority: 'low',
        dueOffsetDays: -20,
      },
      {
        title: 'Customer Satisfaction (CSAT) Survey',
        description: 'Deploy quarterly survey measuring satisfaction with support response velocity and platform reliability.',
        category: 'Operations',
        status: 'pending',
        priority: 'medium',
        dueOffsetDays: 25,
      },
      {
        title: 'Brand Asset Library Centralization',
        description: 'Organize high-resolution vector logos, marketing collateral, and slide deck templates in a unified drive.',
        category: 'Marketing',
        status: 'completed',
        priority: 'low',
        dueOffsetDays: -15,
      },
      {
        title: 'API Rate Limiting & Abuse Prevention',
        description: 'Implement distributed token bucket rate limiting on public endpoints to defend against automated scraper bots.',
        category: 'Engineering',
        status: 'in-progress',
        priority: 'high',
        dueOffsetDays: 8,
      },
      {
        title: 'Q4 Sales Kickoff Conference Plan',
        description: 'Coordinate keynote speakers, workshop agendas, and travel logistics for the annual sales kickoff.',
        category: 'Sales',
        status: 'pending',
        priority: 'medium',
        dueOffsetDays: 60,
      },
      {
        title: 'Employee Performance Review Cycle',
        description: 'Launch mid-year 360-degree peer feedback and compensation review cycles across all global teams.',
        category: 'Human Resources',
        status: 'in-progress',
        priority: 'medium',
        dueOffsetDays: 15,
      },
      {
        title: 'Data Loss Prevention (DLP) Policy Rollout',
        description: 'Deploy endpoint DLP monitoring rules for sensitive user records and company financial repositories.',
        category: 'Operations',
        status: 'completed',
        priority: 'high',
        dueOffsetDays: -4,
      },
      {
        title: 'GraphQL API Gateway Exploration',
        description: 'Prototype Apollo federation gateway to unify microservices into a single typed query interface.',
        category: 'Engineering',
        status: 'pending',
        priority: 'low',
        dueOffsetDays: 40,
      },
    ];

    const recordsToInsert = projectTemplates.map((tpl, idx) => {
      // Distribute assignments across users
      const assignedUser = allUsers[idx % allUsers.length];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + tpl.dueOffsetDays);

      return {
        title: tpl.title,
        description: tpl.description,
        category: tpl.category,
        status: tpl.status,
        priority: tpl.priority,
        dueDate,
        createdBy: assignedUser._id,
      };
    });

    await Record.insertMany(recordsToInsert);
    console.log(`Created ${recordsToInsert.length} sample project records.`);

    console.log('\n======================================================');
    console.log(' DATABASE SEEDED SUCCESSFULLY!');
    console.log('======================================================');
    console.log(' Default Admin Credentials:');
    console.log(' Email:    admin@growthtech.com');
    console.log(' Password: Admin@1234');
    console.log(' Role:     Administrator (full access)');
    console.log('------------------------------------------------------');
    console.log(' Sample Manager:');
    console.log(' Email:    sarah.jenkins@growthtech.com');
    console.log(' Password: User@1234');
    console.log('------------------------------------------------------');
    console.log(' Sample User:');
    console.log(' Email:    elena.rostova@growthtech.com');
    console.log(' Password: User@1234');
    console.log('------------------------------------------------------');
    console.log(' Inactive User (for testing login rejection):');
    console.log(' Email:    rachel.green@growthtech.com');
    console.log(' Password: User@1234');
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();

