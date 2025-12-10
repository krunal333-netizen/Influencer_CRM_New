const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const defaultPassword = 'ChangeMe123!';
  const hashedPassword = await argon2.hash(defaultPassword);

  // Clean up existing data
  await prisma.courierShipment.deleteMany();
  await prisma.invoiceImage.deleteMany();
  await prisma.analyticsSnapshot.deleteMany();
  await prisma.apifyRunLog.deleteMany();
  await prisma.financialDocument.deleteMany();
  await prisma.influencerCampaignLink.deleteMany();
  await prisma.campaignProduct.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.product.deleteMany();
  await prisma.influencer.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();
  await prisma.firm.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();

  // Create Roles
  const adminRole = await prisma.role.create({
    data: {
      name: 'ADMIN',
      description: 'Administrator role with full access',
    },
  });

  const managerRole = await prisma.role.create({
    data: {
      name: 'MANAGER',
      description: 'Manager role with store and campaign management',
    },
  });

  const coordinatorRole = await prisma.role.create({
    data: {
      name: 'COORDINATOR',
      description: 'Coordinator role with limited access',
    },
  });

  // Create Permissions
  const permissions = await Promise.all([
    prisma.permission.create({
      data: {
        name: 'CREATE_CAMPAIGN',
        description: 'Permission to create campaigns',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'EDIT_CAMPAIGN',
        description: 'Permission to edit campaigns',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'DELETE_CAMPAIGN',
        description: 'Permission to delete campaigns',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'VIEW_ANALYTICS',
        description: 'Permission to view analytics',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'MANAGE_INFLUENCERS',
        description: 'Permission to manage influencers',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'MANAGE_FINANCES',
        description: 'Permission to manage financial documents',
      },
    }),
  ]);

  // Connect permissions to roles
  await prisma.role.update({
    where: { id: adminRole.id },
    data: {
      permissions: {
        connect: permissions.map((p) => ({ id: p.id })),
      },
    },
  });

  await prisma.role.update({
    where: { id: managerRole.id },
    data: {
      permissions: {
        connect: [
          { id: permissions[0].id }, // CREATE_CAMPAIGN
          { id: permissions[1].id }, // EDIT_CAMPAIGN
          { id: permissions[3].id }, // VIEW_ANALYTICS
          { id: permissions[4].id }, // MANAGE_INFLUENCERS
        ],
      },
    },
  });

  // Create Firms
  const firm1 = await prisma.firm.create({
    data: {
      name: 'Global Brands Inc.',
      email: 'contact@globalbrands.com',
      phone: '+1-555-0100',
      address: '123 Business Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
  });

  const firm2 = await prisma.firm.create({
    data: {
      name: 'Digital Solutions Ltd.',
      email: 'info@digitalsolutions.com',
      phone: '+1-555-0200',
      address: '456 Tech Park',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA',
    },
  });

  // Create Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@globalbrands.com',
      name: 'Admin User',
      password: hashedPassword,
      hashedRefreshToken: null,
      firm: { connect: { id: firm1.id } },
      roles: { connect: [{ id: adminRole.id }] },
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@globalbrands.com',
      name: 'Manager User',
      password: hashedPassword,
      hashedRefreshToken: null,
      firm: { connect: { id: firm1.id } },
      roles: { connect: [{ id: managerRole.id }] },
    },
  });

  // Create Stores
  const store1 = await prisma.store.create({
    data: {
      name: 'Main Store',
      email: 'main@globalbrands.com',
      phone: '+1-555-0101',
      address: '123 Business Ave, Suite 100',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      firm: { connect: { id: firm1.id } },
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'West Coast Store',
      email: 'west@globalbrands.com',
      phone: '+1-555-0102',
      address: '789 Market Street',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA',
      firm: { connect: { id: firm1.id } },
    },
  });

  // Create Products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Premium Sunglasses',
        sku: 'SGL-001',
        asCode: 'SUN001',
        description: 'High-quality UV protection sunglasses',
        category: 'FASHION',
        stock: 150,
        price: 129.99,
        imageUrls: [
          'https://example.com/sunglasses-front.jpg',
          'https://example.com/sunglasses-side.jpg',
        ],
        metadata: {
          color: 'Black',
          material: 'Acetate',
          uvProtection: '100%',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Designer Watch',
        sku: 'WCH-001',
        asCode: 'WTC001',
        description: 'Luxury timepiece with leather band',
        category: 'FASHION',
        stock: 75,
        price: 299.99,
        imageUrls: [
          'https://example.com/watch-front.jpg',
          'https://example.com/watch-back.jpg',
        ],
        metadata: {
          movement: 'Quartz',
          band: 'Leather',
          waterResistance: '50m',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Wireless Headphones',
        sku: 'HDP-001',
        asCode: 'AUD001',
        description: 'Noise-canceling Bluetooth headphones',
        category: 'ELECTRONICS',
        stock: 200,
        price: 199.99,
        imageUrls: [
          'https://example.com/headphones-front.jpg',
          'https://example.com/headphones-side.jpg',
        ],
        metadata: {
          batteryLife: '30 hours',
          noiseCanceling: true,
          bluetooth: '5.0',
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Smartphone Case',
        sku: 'CSE-001',
        asCode: 'CAS001',
        description: 'Protective smartphone case',
        category: 'ELECTRONICS',
        stock: 500,
        price: 49.99,
        imageUrls: [
          'https://example.com/case-clear.jpg',
          'https://example.com/case-black.jpg',
        ],
        metadata: {
          material: 'TPU',
          protection: 'Drop-resistant',
          colors: ['Clear', 'Black', 'Blue'],
        },
      },
    }),
  ]);

  // Create Influencers
  const influencers = await Promise.all([
    prisma.influencer.create({
      data: {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '+1-555-1001',
        bio: 'Lifestyle and fashion influencer',
        followers: 150000,
        status: 'ACTIVE',
        platform: 'Instagram',
        profileUrl: 'https://instagram.com/sarahjohnson',
      },
    }),
    prisma.influencer.create({
      data: {
        name: 'Mike Chen',
        email: 'mike@example.com',
        phone: '+1-555-1002',
        bio: 'Tech and gadget reviewer',
        followers: 250000,
        status: 'ACTIVE',
        platform: 'YouTube',
        profileUrl: 'https://youtube.com/mikechen',
      },
    }),
    prisma.influencer.create({
      data: {
        name: 'Emma Wilson',
        email: 'emma@example.com',
        bio: 'Beauty and wellness content creator',
        followers: 180000,
        status: 'COLD',
        platform: 'TikTok',
        profileUrl: 'https://tiktok.com/@emmawilson',
      },
    }),
    prisma.influencer.create({
      data: {
        name: 'James Davis',
        email: 'james@example.com',
        bio: 'Sports and fitness influencer',
        followers: 320000,
        status: 'FINAL',
        platform: 'Instagram',
        profileUrl: 'https://instagram.com/jamesdavis',
      },
    }),
  ]);

  // Create Campaigns
  const campaign1 = await prisma.campaign.create({
    data: {
      name: 'Summer Collection 2024',
      description: 'Influencer campaign for summer collection launch',
      status: 'ACTIVE',
      type: 'REELS',
      budget: 50000,
      budgetSpent: 12500,
      budgetAllocated: 45000,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-31'),
      deliverableDeadline: new Date('2024-07-15'),
      brief:
        'Create engaging reels showcasing summer fashion pieces. Focus on lifestyle and outdoor activities.',
      reelsRequired: 5,
      postsRequired: 3,
      storiesRequired: 10,
      store: { connect: { id: store1.id } },
    },
  });

  const campaign2 = await prisma.campaign.create({
    data: {
      name: 'Holiday Season Promo',
      description: 'Year-end promotional campaign',
      status: 'DRAFT',
      type: 'MIXED',
      budget: 75000,
      budgetSpent: 0,
      budgetAllocated: 70000,
      startDate: new Date('2024-11-01'),
      endDate: new Date('2024-12-31'),
      deliverableDeadline: new Date('2024-11-30'),
      brief:
        'Mixed content campaign for holiday gift promotion. Include posts, stories, and reels.',
      reelsRequired: 3,
      postsRequired: 4,
      storiesRequired: 8,
      store: { connect: { id: store2.id } },
    },
  });

  // Connect products to campaigns
  await prisma.campaignProduct.createMany({
    data: [
      {
        campaignId: campaign1.id,
        productId: products[0].id,
        quantity: 100,
        plannedQty: 120,
        discount: 15,
        notes: 'Priority items for summer campaign launch',
        dueDate: new Date('2024-06-15'),
      },
      {
        campaignId: campaign1.id,
        productId: products[1].id,
        quantity: 50,
        plannedQty: 60,
        discount: 10,
        notes: 'Limited edition pieces',
        dueDate: new Date('2024-06-20'),
      },
      {
        campaignId: campaign2.id,
        productId: products[2].id,
        quantity: 200,
        plannedQty: 250,
        discount: 20,
        notes: 'High-demand electronics for holiday season',
        dueDate: new Date('2024-10-15'),
      },
      {
        campaignId: campaign2.id,
        productId: products[3].id,
        quantity: 500,
        plannedQty: 600,
        discount: 25,
        notes: 'Stock up for holiday gift bundles',
        dueDate: new Date('2024-10-20'),
      },
    ],
  });

  // Create Influencer-Campaign Links
  const campaignLink1 = await prisma.influencerCampaignLink.create({
    data: {
      influencer: { connect: { id: influencers[0].id } },
      campaign: { connect: { id: campaign1.id } },
      rate: 5000,
      status: 'ACCEPTED',
      deliverables: '5 Instagram posts, 3 stories',
      deliverableType: 'reel',
      expectedDate: new Date('2024-07-10'),
      notes: 'Focus on lifestyle content with sunglasses',
    },
  });

  const campaignLink2 = await prisma.influencerCampaignLink.create({
    data: {
      influencer: { connect: { id: influencers[1].id } },
      campaign: { connect: { id: campaign1.id } },
      rate: 7500,
      status: 'ACCEPTED',
      deliverables: '2 YouTube videos, 10 Shorts',
      deliverableType: 'mixed',
      expectedDate: new Date('2024-07-05'),
      notes: 'Tech review style content for headphones',
    },
  });

  const campaignLink3 = await prisma.influencerCampaignLink.create({
    data: {
      influencer: { connect: { id: influencers[3].id } },
      campaign: { connect: { id: campaign2.id } },
      rate: 10000,
      status: 'PENDING',
      deliverables: '3 reels, sponsored content',
      deliverableType: 'post',
      expectedDate: new Date('2024-11-15'),
      notes: 'High engagement fitness content',
    },
  });

  // Create Financial Documents
  const doc1 = await prisma.financialDocument.create({
    data: {
      type: 'PO',
      documentNumber: 'PO-2024-0001',
      amount: 12500,
      status: 'APPROVED',
      issueDate: new Date('2024-06-01'),
      dueDate: new Date('2024-07-01'),
      description: 'Purchase order for campaign 1 materials',
      campaign: { connect: { id: campaign1.id } },
    },
  });

  const doc2 = await prisma.financialDocument.create({
    data: {
      type: 'INVOICE',
      documentNumber: 'INV-2024-0001',
      amount: 5000,
      status: 'PENDING',
      issueDate: new Date('2024-06-15'),
      dueDate: new Date('2024-07-15'),
      description: 'Invoice for influencer compensation',
      campaign: { connect: { id: campaign1.id } },
    },
  });

  // Create Invoice Images
  const invoiceImage1 = await prisma.invoiceImage.create({
    data: {
      imagePath: '/invoices/summer-campaign-001.jpg',
      ocrData: {
        vendor: 'Sunshine Optics Co.',
        invoiceNumber: 'SO-2024-0156',
        date: '2024-06-05',
        items: [
          {
            description: 'Premium Sunglasses',
            quantity: 100,
            unitPrice: 129.99,
          },
        ],
        subtotal: 12999.0,
        tax: 1039.92,
        total: 14038.92,
      },
      extractedTotal: 14038.92,
      status: 'PROCESSED',
      campaign: { connect: { id: campaign1.id } },
      product: { connect: { id: products[0].id } },
    },
  });

  const invoiceImage2 = await prisma.invoiceImage.create({
    data: {
      imagePath: '/invoices/tech-gear-002.jpg',
      ocrData: {
        vendor: 'AudioTech Solutions',
        invoiceNumber: 'ATS-2024-0234',
        date: '2024-06-10',
        items: [
          {
            description: 'Wireless Headphones',
            quantity: 200,
            unitPrice: 199.99,
          },
        ],
        subtotal: 39998.0,
        tax: 3199.84,
        total: 43197.84,
      },
      extractedTotal: 43197.84,
      status: 'PROCESSED',
      campaign: { connect: { id: campaign2.id } },
      product: { connect: { id: products[2].id } },
    },
  });

  // Create Courier Shipments
  const shipment1 = await prisma.courierShipment.create({
    data: {
      trackingNumber: '1Z999AA1234567890',
      courierName: 'UPS',
      courierCompany: 'United Parcel Service',
      sendStore: { connect: { id: store1.id } },
      returnStore: { connect: { id: store1.id } },
      influencer: { connect: { id: influencers[0].id } },
      campaign: { connect: { id: campaign1.id } },
      sentDate: new Date('2024-06-15T09:00:00Z'),
      receivedDate: new Date('2024-06-17T14:30:00Z'),
      returnedDate: new Date('2024-07-20T16:00:00Z'),
      status: 'RETURNED',
      statusTimeline: {
        '2024-06-15T09:00:00Z': 'SENT',
        '2024-06-16T08:00:00Z': 'IN_TRANSIT',
        '2024-06-17T14:30:00Z': 'DELIVERED',
        '2024-07-20T16:00:00Z': 'RETURNED',
      },
    },
  });

  const shipment2 = await prisma.courierShipment.create({
    data: {
      trackingNumber: 'FDX123456789012',
      courierName: 'FedEx',
      courierCompany: 'Federal Express Corporation',
      sendStore: { connect: { id: store2.id } },
      influencer: { connect: { id: influencers[1].id } },
      campaign: { connect: { id: campaign1.id } },
      sentDate: new Date('2024-06-18T11:00:00Z'),
      status: 'IN_TRANSIT',
      statusTimeline: {
        '2024-06-18T11:00:00Z': 'SENT',
        '2024-06-19T06:00:00Z': 'IN_TRANSIT',
      },
    },
  });

  const shipment3 = await prisma.courierShipment.create({
    data: {
      trackingNumber: 'DHL987654321098',
      courierName: 'DHL',
      courierCompany: 'DHL Express',
      sendStore: { connect: { id: store1.id } },
      influencer: { connect: { id: influencers[3].id } },
      campaign: { connect: { id: campaign2.id } },
      sentDate: new Date('2024-10-01T10:00:00Z'),
      status: 'PENDING',
      statusTimeline: {
        '2024-10-01T10:00:00Z': 'PENDING',
      },
    },
  });

  // Create Apify Run Logs
  const apifyLog = await prisma.apifyRunLog.create({
    data: {
      runId: 'run-123456789',
      taskId: 'task-987654321',
      status: 'SUCCEEDED',
      startedAt: new Date('2024-06-01T10:00:00Z'),
      finishedAt: new Date('2024-06-01T10:30:00Z'),
      resultsCount: 1250,
      statusMessage: 'Run completed successfully',
    },
  });

  // Create Analytics Snapshot
  const snapshot = await prisma.analyticsSnapshot.create({
    data: {
      totalCampaigns: 2,
      activeCampaigns: 1,
      totalBudget: 125000,
      totalInfluencers: 4,
      coldInfluencers: 1,
      activeInfluencers: 2,
      finalInfluencers: 1,
      totalRevenue: 50000,
      totalExpenses: 22500,
      metadata: {
        period: 'Q2 2024',
        generatedBy: 'seed script',
      },
    },
  });

  console.log('✓ Database seeded successfully!');
  console.log(`
Seed Summary:
- Roles: 3
- Permissions: 6
- Firms: 2
- Users: 2
- Stores: 2
- Products: 4
- Influencers: 4
- Campaigns: 2
- Campaign Products: 4
- Influencer-Campaign Links: 3
- Financial Documents: 2
- Invoice Images: 2
- Courier Shipments: 3
- Apify Run Logs: 1
- Analytics Snapshots: 1
  `);
  console.log(`Default seeded user password: ${defaultPassword}`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
