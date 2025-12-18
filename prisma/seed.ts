import 'dotenv/config';
import { PrismaClient, UserRole, ProductType } from '../src/generated/prisma';
import * as bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  log: ['error', 'warn'],
  adapter,
});

// Helper function to create slugs
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

async function main() {
  console.log('Starting database seed...');

  // ================================
  // 1. GAME TYPES (14 total)
  // ================================
  console.log('Seeding game types...');

  const gameTypesData = [
    { name: 'Venison (Deer)', description: 'Tender and lean meat from white-tailed and mule deer' },
    { name: 'Elk', description: 'Rich, hearty red meat with a slightly sweet flavor' },
    { name: 'Moose', description: 'Large game with mild, tender meat similar to beef' },
    { name: 'Wild Boar', description: 'Flavorful, slightly sweet pork with a robust taste' },
    { name: 'Bison', description: 'Sweet, rich red meat with less fat than beef' },
    { name: 'Rabbit', description: 'Delicate, mild white meat similar to chicken' },
    { name: 'Squirrel', description: 'Tender, nutty-flavored small game meat' },
    { name: 'Wild Turkey', description: 'Lean, flavorful poultry with darker meat than domestic turkey' },
    { name: 'Duck', description: 'Rich, succulent waterfowl with distinctive flavor' },
    { name: 'Goose', description: 'Full-flavored, dark waterfowl meat' },
    { name: 'Pheasant', description: 'Tender upland game bird with delicate flavor' },
    { name: 'Quail', description: 'Small, delicate game bird with mild, slightly gamey taste' },
    { name: 'Bear', description: 'Rich, dark meat with bold, distinctive flavor' },
    { name: 'Antelope', description: 'Lean, tender meat with mild flavor similar to venison' },
  ];

  const gameTypes = await Promise.all(
    gameTypesData.map((data) =>
      prisma.gameType.upsert({
        where: { slug: createSlug(data.name) },
        update: {},
        create: {
          name: data.name,
          slug: createSlug(data.name),
          description: data.description,
          isActive: true,
        },
      })
    )
  );

  console.log(`Created ${gameTypes.length} game types`);

  // ================================
  // 2. RECIPE CATEGORIES (11 total)
  // ================================
  console.log('Seeding recipe categories...');

  const recipeCategoriesData = [
    { name: 'Main Dishes', description: 'Hearty entrees perfect for family dinners', displayOrder: 1 },
    { name: 'Appetizers', description: 'Start your meal with wild game starters', displayOrder: 2 },
    { name: 'Soups & Stews', description: 'Warming comfort food featuring wild game', displayOrder: 3 },
    { name: 'Grilling & BBQ', description: 'Fire up the grill for outdoor cooking', displayOrder: 4 },
    { name: 'Slow Cooker', description: 'Set it and forget it wild game recipes', displayOrder: 5 },
    { name: 'Smoking & Curing', description: 'Preserve and enhance wild game flavors', displayOrder: 6 },
    { name: 'Ground Game', description: 'Versatile recipes using ground wild game', displayOrder: 7 },
    { name: 'Sausages', description: 'Homemade wild game sausages and links', displayOrder: 8 },
    { name: 'Jerky', description: 'Dried and seasoned wild game snacks', displayOrder: 9 },
    { name: 'Quick & Easy', description: 'Simple recipes for busy hunters', displayOrder: 10 },
    { name: 'Holiday & Special Occasions', description: 'Impressive wild game for celebrations', displayOrder: 11 },
  ];

  const recipeCategories = await Promise.all(
    recipeCategoriesData.map((data) =>
      prisma.recipeCategory.upsert({
        where: { slug: createSlug(data.name) },
        update: {},
        create: {
          name: data.name,
          slug: createSlug(data.name),
          description: data.description,
          displayOrder: data.displayOrder,
          isActive: true,
        },
      })
    )
  );

  console.log(`Created ${recipeCategories.length} recipe categories`);

  // ================================
  // 3. PRODUCT CATEGORIES (hierarchical)
  // ================================
  console.log('Seeding product categories...');

  // Parent categories
  const apparelCategory = await prisma.productCategory.upsert({
    where: { slug: 'apparel' },
    update: {},
    create: {
      name: 'Apparel',
      slug: 'apparel',
      description: 'Clothing and wearables for outdoor enthusiasts',
      displayOrder: 1,
      isActive: true,
    },
  });

  const cookbooksCategory = await prisma.productCategory.upsert({
    where: { slug: 'cookbooks' },
    update: {},
    create: {
      name: 'Cookbooks',
      slug: 'cookbooks',
      description: 'Wild game recipe collections and cooking guides',
      displayOrder: 2,
      isActive: true,
    },
  });

  const accessoriesCategory = await prisma.productCategory.upsert({
    where: { slug: 'accessories' },
    update: {},
    create: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Essential items for cooking and outdoor life',
      displayOrder: 3,
      isActive: true,
    },
  });

  await prisma.productCategory.upsert({
    where: { slug: 'gear' },
    update: {},
    create: {
      name: 'Gear',
      slug: 'gear',
      description: 'Equipment and tools for hunters and outdoor chefs',
      displayOrder: 4,
      isActive: true,
    },
  });

  // Apparel subcategories
  const tshirtsCategory = await prisma.productCategory.upsert({
    where: { slug: 'apparel-t-shirts' },
    update: {},
    create: {
      name: 'T-Shirts',
      slug: 'apparel-t-shirts',
      description: 'Comfortable t-shirts for hunting and everyday wear',
      parentId: apparelCategory.id,
      displayOrder: 1,
      isActive: true,
    },
  });

  const hoodiesCategory = await prisma.productCategory.upsert({
    where: { slug: 'apparel-hoodies-sweatshirts' },
    update: {},
    create: {
      name: 'Hoodies & Sweatshirts',
      slug: 'apparel-hoodies-sweatshirts',
      description: 'Warm layers for cold weather hunting',
      parentId: apparelCategory.id,
      displayOrder: 2,
      isActive: true,
    },
  });

  await prisma.productCategory.upsert({
    where: { slug: 'apparel-hats-caps' },
    update: {},
    create: {
      name: 'Hats & Caps',
      slug: 'apparel-hats-caps',
      description: 'Headwear for sun protection and style',
      parentId: apparelCategory.id,
      displayOrder: 3,
      isActive: true,
    },
  });

  // Accessories subcategories
  const apronsCategory = await prisma.productCategory.upsert({
    where: { slug: 'accessories-aprons' },
    update: {},
    create: {
      name: 'Aprons',
      slug: 'accessories-aprons',
      description: 'Durable aprons for cooking and butchering',
      parentId: accessoriesCategory.id,
      displayOrder: 1,
      isActive: true,
    },
  });

  await prisma.productCategory.upsert({
    where: { slug: 'accessories-drinkware' },
    update: {},
    create: {
      name: 'Drinkware',
      slug: 'accessories-drinkware',
      description: 'Mugs, tumblers, and water bottles',
      parentId: accessoriesCategory.id,
      displayOrder: 2,
      isActive: true,
    },
  });

  const stickersCategory = await prisma.productCategory.upsert({
    where: { slug: 'accessories-stickers-decals' },
    update: {},
    create: {
      name: 'Stickers & Decals',
      slug: 'accessories-stickers-decals',
      description: 'Show your hunting pride',
      parentId: accessoriesCategory.id,
      displayOrder: 3,
      isActive: true,
    },
  });

  console.log('Created product category hierarchy');

  // ================================
  // 4. SAMPLE RECIPES (3-5 recipes)
  // ================================
  console.log('Seeding sample recipes...');

  const venisonGameType = gameTypes.find((gt) => gt.name === 'Venison (Deer)');
  const elkGameType = gameTypes.find((gt) => gt.name === 'Elk');
  const wildBoarGameType = gameTypes.find((gt) => gt.name === 'Wild Boar');

  const soupsStewsCategory = recipeCategories.find((rc) => rc.name === 'Soups & Stews');
  const grillingCategory = recipeCategories.find((rc) => rc.name === 'Grilling & BBQ');
  const slowCookerCategory = recipeCategories.find((rc) => rc.name === 'Slow Cooker');
  const mainDishesCategory = recipeCategories.find((rc) => rc.name === 'Main Dishes');

  // Recipe 1: Classic Venison Stew
  const venisonStew = await prisma.recipe.upsert({
    where: { slug: 'classic-venison-stew' },
    update: {},
    create: {
      title: 'Classic Venison Stew',
      slug: 'classic-venison-stew',
      description:
        'A hearty, warming stew that transforms tough venison cuts into tender, flavorful comfort food. Perfect for cold weather and a great way to use shoulder or neck meat.',
      gameTypeId: venisonGameType!.id,
      prepTimeMinutes: 20,
      cookTimeMinutes: 180,
      totalTimeMinutes: 200,
      servings: 6,
      ingredients: [
        '2 lbs venison stew meat, cut into 1-inch cubes',
        '3 tablespoons olive oil',
        '1 large onion, diced',
        '4 cloves garlic, minced',
        '4 carrots, peeled and cut into chunks',
        '3 celery stalks, chopped',
        '3 large potatoes, cubed',
        '4 cups beef stock',
        '1 cup red wine',
        '2 bay leaves',
        '2 teaspoons fresh thyme',
        '1 teaspoon rosemary',
        '2 tablespoons tomato paste',
        '2 tablespoons flour',
        'Salt and pepper to taste',
      ],
      instructions: [
        'Pat venison cubes dry and season generously with salt and pepper.',
        'Heat olive oil in a large Dutch oven over medium-high heat. Brown venison in batches, about 3-4 minutes per side. Remove and set aside.',
        'In the same pot, add onions and garlic. Sauté until softened, about 5 minutes.',
        'Sprinkle flour over onions and stir to coat. Cook for 1 minute.',
        'Add tomato paste and stir for another minute.',
        'Pour in red wine, scraping up browned bits from the bottom of the pot.',
        'Return venison to pot. Add beef stock, bay leaves, thyme, and rosemary.',
        'Bring to a boil, then reduce heat to low. Cover and simmer for 2 hours.',
        'Add carrots, celery, and potatoes. Continue cooking for 45 minutes until vegetables are tender.',
        'Remove bay leaves. Adjust seasoning with salt and pepper. Serve hot with crusty bread.',
      ],
      tips: 'For extra richness, brown a few strips of bacon first and use the rendered fat instead of olive oil. The stew tastes even better the next day after the flavors have melded.',
      isFeatured: true,
      isPublished: true,
      publishedAt: new Date(),
      viewCount: 0,
      metaTitle: 'Classic Venison Stew Recipe - Hearty Wild Game Comfort Food',
      metaDescription: 'Learn how to make the perfect venison stew with tender meat and vegetables in a rich, flavorful broth. A hunter\'s favorite comfort food.',
    },
  });

  await prisma.recipeCategoryJunction.upsert({
    where: {
      recipeId_categoryId: {
        recipeId: venisonStew.id,
        categoryId: soupsStewsCategory!.id,
      },
    },
    update: {},
    create: {
      recipeId: venisonStew.id,
      categoryId: soupsStewsCategory!.id,
    },
  });

  await prisma.recipeCategoryJunction.upsert({
    where: {
      recipeId_categoryId: {
        recipeId: venisonStew.id,
        categoryId: mainDishesCategory!.id,
      },
    },
    update: {},
    create: {
      recipeId: venisonStew.id,
      categoryId: mainDishesCategory!.id,
    },
  });

  // Recipe 2: Grilled Elk Steaks with Herb Butter
  const elkSteaks = await prisma.recipe.upsert({
    where: { slug: 'grilled-elk-steaks-with-herb-butter' },
    update: {},
    create: {
      title: 'Grilled Elk Steaks with Herb Butter',
      slug: 'grilled-elk-steaks-with-herb-butter',
      description:
        'Perfectly grilled elk steaks topped with a luxurious herb butter. This simple preparation lets the quality of the meat shine through while adding a touch of elegance.',
      gameTypeId: elkGameType!.id,
      prepTimeMinutes: 15,
      cookTimeMinutes: 10,
      totalTimeMinutes: 25,
      servings: 4,
      ingredients: [
        '4 elk steaks (8 oz each), 1-inch thick',
        '2 tablespoons olive oil',
        'Salt and freshly ground black pepper',
        '4 tablespoons butter, softened',
        '2 tablespoons fresh parsley, chopped',
        '1 tablespoon fresh thyme, chopped',
        '2 cloves garlic, minced',
        '1 teaspoon lemon zest',
        'Pinch of sea salt',
      ],
      instructions: [
        'Remove elk steaks from refrigerator 30 minutes before cooking to bring to room temperature.',
        'Make herb butter: Combine softened butter with parsley, thyme, garlic, lemon zest, and a pinch of sea salt. Mix well and set aside.',
        'Preheat grill to high heat (450-500°F).',
        'Brush both sides of steaks with olive oil and season generously with salt and pepper.',
        'Place steaks on hot grill. Cook for 4-5 minutes without moving.',
        'Flip steaks and cook for another 3-4 minutes for medium-rare (internal temp 130-135°F).',
        'Remove from grill and let rest for 5 minutes.',
        'Top each steak with a generous dollop of herb butter and serve immediately.',
      ],
      tips: 'Elk is very lean, so be careful not to overcook. Medium-rare to medium is ideal. Use a meat thermometer for best results. Let the steaks rest - this is crucial for juicy meat.',
      nutritionInfo: {
        servingSize: '1 steak with butter',
        calories: 380,
        protein: '52g',
        fat: '18g',
        carbohydrates: '1g',
      },
      isFeatured: true,
      isPublished: true,
      publishedAt: new Date(),
      viewCount: 0,
      metaTitle: 'Grilled Elk Steaks with Herb Butter - Perfect Wild Game Recipe',
      metaDescription: 'Master the art of grilling elk steaks to perfection with this simple recipe featuring herb butter. Restaurant-quality results at home.',
    },
  });

  await prisma.recipeCategoryJunction.upsert({
    where: {
      recipeId_categoryId: {
        recipeId: elkSteaks.id,
        categoryId: grillingCategory!.id,
      },
    },
    update: {},
    create: {
      recipeId: elkSteaks.id,
      categoryId: grillingCategory!.id,
    },
  });

  await prisma.recipeCategoryJunction.upsert({
    where: {
      recipeId_categoryId: {
        recipeId: elkSteaks.id,
        categoryId: mainDishesCategory!.id,
      },
    },
    update: {},
    create: {
      recipeId: elkSteaks.id,
      categoryId: mainDishesCategory!.id,
    },
  });

  // Recipe 3: Wild Boar Carnitas
  const boarCarnitas = await prisma.recipe.upsert({
    where: { slug: 'wild-boar-carnitas' },
    update: {},
    create: {
      title: 'Wild Boar Carnitas',
      slug: 'wild-boar-carnitas',
      description:
        'Slow-cooked wild boar shoulder becomes incredibly tender and flavorful in this wild game twist on traditional carnitas. Perfect for tacos, burritos, or nachos.',
      gameTypeId: wildBoarGameType!.id,
      prepTimeMinutes: 20,
      cookTimeMinutes: 240,
      totalTimeMinutes: 260,
      servings: 8,
      ingredients: [
        '4 lbs wild boar shoulder, cut into 3-inch chunks',
        '1 tablespoon salt',
        '1 tablespoon black pepper',
        '1 tablespoon cumin',
        '1 tablespoon chili powder',
        '2 teaspoons oregano',
        '1 large onion, quartered',
        '6 cloves garlic, smashed',
        '2 bay leaves',
        '1 orange, juiced',
        '2 limes, juiced',
        '1 cup chicken stock',
        '2 tablespoons vegetable oil',
      ],
      instructions: [
        'Combine salt, pepper, cumin, chili powder, and oregano in a small bowl.',
        'Rub spice mixture all over wild boar chunks.',
        'Heat oil in a large skillet over high heat. Sear boar chunks on all sides until browned, about 2-3 minutes per side.',
        'Transfer browned meat to slow cooker.',
        'Add onion, garlic, bay leaves, orange juice, lime juice, and chicken stock to slow cooker.',
        'Cover and cook on low for 8 hours or on high for 4 hours, until meat is fall-apart tender.',
        'Remove meat from slow cooker and shred with two forks. Discard bay leaves.',
        'Optional: Spread shredded meat on a baking sheet and broil for 3-5 minutes until crispy edges form.',
        'Serve in warm tortillas with your favorite toppings: cilantro, diced onions, lime wedges, salsa, and avocado.',
      ],
      tips: 'For authentic carnitas, crisp the meat under the broiler at the end. Save the cooking liquid - it makes an incredible base for beans or rice. Carnitas freeze beautifully for quick weeknight meals.',
      isFeatured: true,
      isPublished: true,
      publishedAt: new Date(),
      viewCount: 0,
      metaTitle: 'Wild Boar Carnitas Recipe - Slow Cooker Wild Game Tacos',
      metaDescription: 'Tender, flavorful wild boar carnitas made easy in the slow cooker. Perfect for tacos, burritos, and more.',
    },
  });

  await prisma.recipeCategoryJunction.upsert({
    where: {
      recipeId_categoryId: {
        recipeId: boarCarnitas.id,
        categoryId: slowCookerCategory!.id,
      },
    },
    update: {},
    create: {
      recipeId: boarCarnitas.id,
      categoryId: slowCookerCategory!.id,
    },
  });

  await prisma.recipeCategoryJunction.upsert({
    where: {
      recipeId_categoryId: {
        recipeId: boarCarnitas.id,
        categoryId: mainDishesCategory!.id,
      },
    },
    update: {},
    create: {
      recipeId: boarCarnitas.id,
      categoryId: mainDishesCategory!.id,
    },
  });

  console.log('Created 3 sample recipes');

  // ================================
  // 5. SAMPLE PRODUCTS (3-5 products)
  // ================================
  console.log('Seeding sample products...');

  // Product 1: The Hunt Kitchen Cookbook (Digital)
  await prisma.product.upsert({
    where: { slug: 'the-hunt-kitchen-cookbook' },
    update: {},
    create: {
      name: 'The Hunt Kitchen Cookbook',
      slug: 'the-hunt-kitchen-cookbook',
      description:
        'A comprehensive digital cookbook featuring over 150 wild game recipes from appetizers to desserts. Includes butchering guides, cooking techniques, and tips from experienced hunters and chefs. Instant download in PDF format.',
      shortDescription: '150+ wild game recipes with butchering guides and cooking techniques',
      productType: ProductType.DIGITAL,
      categoryId: cookbooksCategory.id,
      basePrice: 29.99,
      compareAtPrice: 39.99,
      sku: 'COOKBOOK-DIGITAL-001',
      trackInventory: false,
      isFeatured: true,
      isActive: true,
      metaTitle: 'The Hunt Kitchen Cookbook - 150+ Wild Game Recipes',
      metaDescription: 'Digital cookbook with 150+ wild game recipes, butchering guides, and expert cooking techniques. Instant download.',
    },
  });

  // No variants needed for digital product

  // Product 2: Camo Hunter T-Shirt (Physical with variants)
  const camoTshirt = await prisma.product.upsert({
    where: { slug: 'camo-hunter-t-shirt' },
    update: {},
    create: {
      name: 'Camo Hunter T-Shirt',
      slug: 'camo-hunter-t-shirt',
      description:
        'Premium quality 100% cotton t-shirt featuring The Hunt Kitchen logo in camouflage design. Comfortable, durable, and perfect for hunting trips or casual wear. Pre-shrunk fabric ensures lasting fit. Printed with eco-friendly inks.',
      shortDescription: '100% cotton tee with camo logo design',
      productType: ProductType.PHYSICAL,
      categoryId: tshirtsCategory.id,
      basePrice: 24.99,
      compareAtPrice: 29.99,
      sku: 'TSHIRT-CAMO-001',
      trackInventory: true,
      weightOz: 6.0,
      isFeatured: true,
      isActive: true,
      metaTitle: 'Camo Hunter T-Shirt - The Hunt Kitchen Apparel',
      metaDescription: 'Comfortable 100% cotton t-shirt with camo logo design. Perfect for hunters and outdoor enthusiasts.',
    },
  });

  // Create size variants for t-shirt
  const sizes = ['S', 'M', 'L', 'XL'];
  const inventories = [15, 25, 30, 20]; // More medium and large sizes

  for (let i = 0; i < sizes.length; i++) {
    await prisma.productVariant.upsert({
      where: { sku: `TSHIRT-CAMO-001-${sizes[i]}` },
      update: {},
      create: {
        productId: camoTshirt.id,
        name: `Camo Hunter T-Shirt - ${sizes[i]}`,
        sku: `TSHIRT-CAMO-001-${sizes[i]}`,
        option1Name: 'Size',
        option1Value: sizes[i],
        inventoryQty: inventories[i],
        isActive: true,
      },
    });
  }

  // Product 3: Wild Game Apron
  const apron = await prisma.product.upsert({
    where: { slug: 'wild-game-apron' },
    update: {},
    create: {
      name: 'Wild Game Apron',
      slug: 'wild-game-apron',
      description:
        'Heavy-duty canvas apron designed for serious wild game processing and cooking. Features multiple pockets for tools and accessories, adjustable neck strap, and reinforced stress points. Water-resistant coating makes cleanup easy. The Hunt Kitchen logo embroidered on chest pocket.',
      shortDescription: 'Heavy-duty canvas apron for butchering and cooking',
      productType: ProductType.PHYSICAL,
      categoryId: apronsCategory.id,
      basePrice: 39.99,
      compareAtPrice: 49.99,
      sku: 'APRON-CANVAS-001',
      trackInventory: true,
      weightOz: 18.0,
      isFeatured: true,
      isActive: true,
      metaTitle: 'Wild Game Canvas Apron - Professional Butchering & Cooking',
      metaDescription: 'Heavy-duty canvas apron perfect for wild game processing and cooking. Water-resistant with multiple pockets.',
    },
  });

  // Single variant for apron (one size)
  await prisma.productVariant.upsert({
    where: { sku: 'APRON-CANVAS-001-OS' },
    update: {},
    create: {
      productId: apron.id,
      name: 'Wild Game Apron - One Size',
      sku: 'APRON-CANVAS-001-OS',
      option1Name: 'Size',
      option1Value: 'One Size',
      inventoryQty: 50,
      isActive: true,
    },
  });

  // Product 4: Hunt Kitchen Hoodie
  const hoodie = await prisma.product.upsert({
    where: { slug: 'hunt-kitchen-hoodie' },
    update: {},
    create: {
      name: 'The Hunt Kitchen Hoodie',
      slug: 'hunt-kitchen-hoodie',
      description:
        'Stay warm in the field or around the campfire with this premium fleece hoodie. 80% cotton, 20% polyester blend provides comfort and durability. Features kangaroo pocket, drawstring hood, and The Hunt Kitchen logo screen-printed on the front. Perfect for cool morning hunts.',
      shortDescription: 'Premium fleece hoodie with logo',
      productType: ProductType.PHYSICAL,
      categoryId: hoodiesCategory.id,
      basePrice: 49.99,
      compareAtPrice: 59.99,
      sku: 'HOODIE-001',
      trackInventory: true,
      weightOz: 20.0,
      isFeatured: true,
      isActive: true,
      metaTitle: 'The Hunt Kitchen Hoodie - Premium Hunting Apparel',
      metaDescription: 'Warm, comfortable fleece hoodie perfect for hunters. 80/20 cotton-poly blend with logo.',
    },
  });

  // Create size variants for hoodie
  for (let i = 0; i < sizes.length; i++) {
    await prisma.productVariant.upsert({
      where: { sku: `HOODIE-001-${sizes[i]}` },
      update: {},
      create: {
        productId: hoodie.id,
        name: `The Hunt Kitchen Hoodie - ${sizes[i]}`,
        sku: `HOODIE-001-${sizes[i]}`,
        option1Name: 'Size',
        option1Value: sizes[i],
        inventoryQty: inventories[i],
        isActive: true,
      },
    });
  }

  // Product 5: Sticker Pack
  const stickerPack = await prisma.product.upsert({
    where: { slug: 'hunt-kitchen-sticker-pack' },
    update: {},
    create: {
      name: 'The Hunt Kitchen Sticker Pack',
      slug: 'hunt-kitchen-sticker-pack',
      description:
        'Show your hunting pride with this 5-pack of weather-resistant vinyl stickers. Features various The Hunt Kitchen designs perfect for coolers, vehicles, gun cases, and more. UV-resistant and waterproof. Each pack includes 5 different designs.',
      shortDescription: '5-pack of weather-resistant vinyl stickers',
      productType: ProductType.PHYSICAL,
      categoryId: stickersCategory.id,
      basePrice: 9.99,
      compareAtPrice: 14.99,
      sku: 'STICKER-PACK-001',
      trackInventory: true,
      weightOz: 1.0,
      isFeatured: false,
      isActive: true,
      metaTitle: 'The Hunt Kitchen Sticker Pack - 5 Weather-Resistant Decals',
      metaDescription: 'Weather-resistant vinyl sticker pack with 5 unique Hunt Kitchen designs. Perfect for coolers, vehicles, and gear.',
    },
  });

  // Single variant for sticker pack
  await prisma.productVariant.upsert({
    where: { sku: 'STICKER-PACK-001-5PK' },
    update: {},
    create: {
      productId: stickerPack.id,
      name: 'The Hunt Kitchen Sticker Pack - 5 Pack',
      sku: 'STICKER-PACK-001-5PK',
      option1Name: 'Quantity',
      option1Value: '5 Pack',
      inventoryQty: 200,
      isActive: true,
    },
  });

  console.log('Created 5 sample products with variants');

  // ================================
  // 6. ADMIN USER
  // ================================
  console.log('Seeding admin user...');

  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@thehuntkitchen.com' },
    update: {},
    create: {
      email: 'admin@thehuntkitchen.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  });

  console.log('Created admin user');

  console.log('\n✅ Database seed completed successfully!');
  console.log('\nSummary:');
  console.log(`- ${gameTypes.length} game types`);
  console.log(`- ${recipeCategories.length} recipe categories`);
  console.log('- 10 product categories (4 parent, 6 subcategories)');
  console.log('- 3 sample recipes');
  console.log('- 5 sample products with variants');
  console.log('- 1 admin user (admin@thehuntkitchen.com)');
  console.log('\nYou can now login with:');
  console.log('Email: admin@thehuntkitchen.com');
  console.log('Password: Admin123!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
