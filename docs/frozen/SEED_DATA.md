# Seed Data
# MealFrame MVP Initial Data

This document describes the initial data to seed the application. Format is descriptive to accommodate schema changes during development.

---

## 1. Meal Types

Create these meal types in the order listed (creation order affects round-robin for meal types with shared meals).

| Name | Description | Tags |
|------|-------------|------|
| **Breakfast** | Standard weekday breakfast. Protein + slow carbs. Low decision, routine anchor. | `weekday`, `morning` |
| **Pre-Workout Breakfast** | Morning workout fuel. Higher carbs, easy to digest. | `workout`, `morning`, `pre-workout` |
| **Mid-Morning Protein** | Appetite control snack. Coffee + protein drink. | `snack`, `protein` |
| **Lunch** | Main daytime meal. Balanced macros, satiety-focused. | `main-meal` |
| **Afternoon Filler** | Prevent evening hunger. Protein + fiber. Non-workout days. | `snack`, `protein`, `evening-prep` |
| **Pre-Workout Snack** | Evening workout fuel. Carb-forward. | `workout`, `pre-workout`, `snack` |
| **Post-Workout Snack** | Post-workout recovery. Protein-dominant, hunger dampening. | `workout`, `post-workout`, `snack`, `protein` |
| **Dinner** | Family meal. Protein-heavy, controlled carbs. High environmental risk. | `main-meal`, `evening` |
| **After-Exercise Dinner** | Post-workout dinner variant. Recovery framing. | `main-meal`, `evening`, `post-workout` |
| **Weekend Breakfast** | Weekend morning meal. More caloric, protein-first. | `weekend`, `morning` |
| **Light Dinner** | Calorie control dinner. Protein + vegetables. | `main-meal`, `evening`, `light` |
| **Hiking Fuel** | Endurance activity fuel. Carbs + protein. | `weekend`, `activity`, `endurance` |

---

## 2. Day Templates

Create these templates with slots in the specified order. Position numbers start at 1.

### Normal Workday

| Position | Meal Type |
|----------|-----------|
| 1 | Breakfast |
| 2 | Mid-Morning Protein |
| 3 | Lunch |
| 4 | Afternoon Filler |
| 5 | Dinner |

**Notes:** Standard non-workout weekday. Focus on hunger control and evening restraint.

---

### Morning Workout Workday

| Position | Meal Type |
|----------|-----------|
| 1 | Pre-Workout Breakfast |
| 2 | Post-Workout Snack |
| 3 | Lunch |
| 4 | Afternoon Filler |
| 5 | Dinner |

**Notes:** Gym session in the morning. Fuel before, recover after, stable evening.

---

### Evening Workout Workday

| Position | Meal Type |
|----------|-----------|
| 1 | Breakfast |
| 2 | Mid-Morning Protein |
| 3 | Lunch |
| 4 | Pre-Workout Snack |
| 5 | After-Exercise Dinner |

**Notes:** Gym session in the evening. Prevent post-workout binge behavior.

---

### Weekend

| Position | Meal Type |
|----------|-----------|
| 1 | Weekend Breakfast |
| 2 | Lunch |
| 3 | Light Dinner |

**Notes:** Standard weekend day. Enjoyment with boundaries.

---

### Hiking Weekend Day

| Position | Meal Type |
|----------|-----------|
| 1 | Weekend Breakfast |
| 2 | Hiking Fuel |
| 3 | Lunch |
| 4 | Light Dinner |

**Notes:** Long hike or outdoor activity. Extra fuel for endurance.

---

## 3. Default Week Plan

**Name:** Default Week

| Weekday | Day (index) | Day Template |
|---------|-------------|--------------|
| Monday | 0 | Normal Workday |
| Tuesday | 1 | Morning Workout Workday |
| Wednesday | 2 | Normal Workday |
| Thursday | 3 | Evening Workout Workday |
| Friday | 4 | Morning Workout Workday |
| Saturday | 5 | Weekend |
| Sunday | 6 | Weekend |

**Set as default:** Yes

---

## 4. App Configuration

| Setting | Value |
|---------|-------|
| timezone | `Europe/Ljubljana` (adjust as needed) |
| week_start_day | `0` (Monday) |
| default_week_plan_id | (reference to Default Week) |

---

## 5. Sample Meals (Optional)

These are example meals to populate the library for testing. User should import their own meals via CSV.

### Breakfast Meals

| Name | Portion Description | Calories | Protein | Carbs | Fat | Meal Types |
|------|---------------------|----------|---------|-------|-----|------------|
| Scrambled Eggs | 2 eggs + 1 slice whole wheat toast + 10g butter | 320 | 18 | 15 | 22 | Breakfast, Weekend Breakfast |
| Oatmeal Classic | 60g oats + 200ml milk + 1 tbsp honey | 350 | 12 | 55 | 8 | Breakfast |
| Greek Yogurt Parfait | 200g Greek yogurt + 30g granola + mixed berries | 320 | 22 | 38 | 10 | Breakfast, Weekend Breakfast |

### Pre-Workout Breakfast Meals

| Name | Portion Description | Calories | Protein | Carbs | Fat | Meal Types |
|------|---------------------|----------|---------|-------|-----|------------|
| Banana Oatmeal | 50g oats + 1 banana + 1 scoop whey | 420 | 32 | 58 | 6 | Pre-Workout Breakfast |
| Toast with Peanut Butter | 2 slices toast + 30g peanut butter + 1 banana | 450 | 15 | 55 | 20 | Pre-Workout Breakfast |

### Mid-Morning Protein Meals

| Name | Portion Description | Calories | Protein | Carbs | Fat | Meal Types |
|------|---------------------|----------|---------|-------|-----|------------|
| Protein Coffee | 1 scoop whey + 200ml cold coffee + ice | 120 | 25 | 3 | 1 | Mid-Morning Protein |
| Protein Shake Simple | 1.5 scoops whey + 300ml water | 180 | 38 | 4 | 2 | Mid-Morning Protein |

### Lunch Meals

| Name | Portion Description | Calories | Protein | Carbs | Fat | Meal Types |
|------|---------------------|----------|---------|-------|-----|------------|
| Chicken Rice Bowl | 150g chicken breast + 150g rice + mixed vegetables | 520 | 42 | 50 | 12 | Lunch |
| Tuna Salad | 1 can tuna + mixed greens + 1 tbsp olive oil + vegetables | 380 | 35 | 12 | 22 | Lunch |
| Turkey Sandwich | 100g turkey + 2 slices bread + lettuce + tomato + mustard | 380 | 32 | 35 | 12 | Lunch |

### Afternoon Filler Meals

| Name | Portion Description | Calories | Protein | Carbs | Fat | Meal Types |
|------|---------------------|----------|---------|-------|-----|------------|
| Cottage Cheese Bowl | 200g cottage cheese + cucumber + cherry tomatoes | 220 | 28 | 8 | 8 | Afternoon Filler |
| Protein Bar | 1 protein bar (60g) | 220 | 20 | 22 | 8 | Afternoon Filler, Pre-Workout Snack |
| Veggie Sticks with Hummus | Carrots + celery + bell pepper + 60g hummus | 180 | 6 | 18 | 10 | Afternoon Filler |

### Pre-Workout Snack Meals

| Name | Portion Description | Calories | Protein | Carbs | Fat | Meal Types |
|------|---------------------|----------|---------|-------|-----|------------|
| Rice Cakes with Banana | 3 rice cakes + 1 banana + 15g honey | 280 | 4 | 62 | 2 | Pre-Workout Snack |
| Energy Balls | 3 energy balls (dates + oats + peanut butter) | 250 | 6 | 35 | 10 | Pre-Workout Snack |

### Post-Workout Snack Meals

| Name | Portion Description | Calories | Protein | Carbs | Fat | Meal Types |
|------|---------------------|----------|---------|-------|-----|------------|
| Protein Smoothie | 1.5 scoops whey + 1 banana + 200ml milk | 350 | 40 | 35 | 6 | Post-Workout Snack |
| Greek Yogurt with Honey | 250g Greek yogurt + 1 tbsp honey | 280 | 25 | 28 | 8 | Post-Workout Snack |
| Chocolate Milk Recovery | 500ml chocolate milk | 320 | 16 | 48 | 8 | Post-Workout Snack |

### Dinner Meals

| Name | Portion Description | Calories | Protein | Carbs | Fat | Meal Types |
|------|---------------------|----------|---------|-------|-----|------------|
| Grilled Salmon | 180g salmon + 200g roasted vegetables + small potato | 520 | 42 | 30 | 25 | Dinner, After-Exercise Dinner |
| Chicken Stir Fry | 150g chicken + mixed vegetables + 100g rice | 480 | 38 | 40 | 18 | Dinner, After-Exercise Dinner |
| Beef with Vegetables | 150g lean beef + broccoli + carrots + 100g rice | 520 | 40 | 35 | 22 | Dinner, After-Exercise Dinner |
| Pasta Bolognese | 100g pasta + 150g meat sauce + side salad | 580 | 35 | 55 | 22 | Dinner |

### Light Dinner Meals

| Name | Portion Description | Calories | Protein | Carbs | Fat | Meal Types |
|------|---------------------|----------|---------|-------|-----|------------|
| Grilled Chicken Salad | 150g chicken breast + large mixed salad + 1 tbsp dressing | 350 | 40 | 12 | 16 | Light Dinner |
| Egg White Omelette | 4 egg whites + vegetables + 30g feta | 220 | 28 | 6 | 10 | Light Dinner |
| Fish with Vegetables | 150g white fish + steamed vegetables + lemon | 280 | 35 | 10 | 12 | Light Dinner |

### Weekend Breakfast Meals

| Name | Portion Description | Calories | Protein | Carbs | Fat | Meal Types |
|------|---------------------|----------|---------|-------|-----|------------|
| Full Breakfast | 2 eggs + 2 bacon strips + toast + tomatoes + beans (half portion) | 550 | 30 | 35 | 32 | Weekend Breakfast |
| Protein Pancakes | 3 protein pancakes + berries + 1 tbsp maple syrup | 480 | 35 | 50 | 15 | Weekend Breakfast |
| Avocado Toast Deluxe | 2 slices toast + 1 avocado + 2 poached eggs | 520 | 22 | 35 | 35 | Weekend Breakfast |

### Hiking Fuel Meals

| Name | Portion Description | Calories | Protein | Carbs | Fat | Meal Types |
|------|---------------------|----------|---------|-------|-----|------------|
| Trail Mix Pack | 80g trail mix (nuts + dried fruit) | 420 | 12 | 40 | 26 | Hiking Fuel |
| PB&J Sandwich | 2 slices bread + 30g peanut butter + 20g jam | 450 | 14 | 55 | 20 | Hiking Fuel |
| Banana + Protein Bar | 1 banana + 1 protein bar | 340 | 22 | 45 | 10 | Hiking Fuel |

---

## 6. Seeding Order

Execute seeding in this order to maintain referential integrity:

1. **app_config** — Create single config row
2. **meal_types** — Create all 12 meal types
3. **meals** — Create all meals
4. **meal_to_meal_type** — Link meals to their meal types
5. **day_templates** — Create 5 day templates
6. **day_template_slots** — Create slots for each template
7. **week_plans** — Create default week plan
8. **week_plan_days** — Map weekdays to templates
9. Update **app_config** with default_week_plan_id

---

## 7. Verification Queries

After seeding, verify data integrity:

```
-- Count meal types
SELECT COUNT(*) FROM meal_type;  -- Expected: 12

-- Count day templates
SELECT COUNT(*) FROM day_template;  -- Expected: 5

-- Verify slot counts per template
SELECT dt.name, COUNT(dts.id) as slot_count 
FROM day_template dt 
JOIN day_template_slot dts ON dt.id = dts.day_template_id 
GROUP BY dt.name;
-- Expected: Normal Workday=5, Morning Workout=5, Evening Workout=5, Weekend=3, Hiking=4

-- Verify week plan has 7 days
SELECT COUNT(*) FROM week_plan_day WHERE week_plan_id = (
  SELECT id FROM week_plan WHERE is_default = true
);  -- Expected: 7

-- Verify meals have at least one meal type
SELECT m.name FROM meal m
LEFT JOIN meal_to_meal_type mtmt ON m.id = mtmt.meal_id
WHERE mtmt.meal_id IS NULL;  -- Expected: empty result
```
