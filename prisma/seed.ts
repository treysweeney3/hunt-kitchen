import 'dotenv/config';
import { PrismaClient, UserRole } from '../src/generated/prisma';
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
  // 3. SAMPLE RECIPES (3-5 recipes)
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
  // 4. ADMIN USER
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
  console.log('- 3 sample recipes');
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
