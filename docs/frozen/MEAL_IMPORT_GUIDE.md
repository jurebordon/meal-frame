# Meal Import Guide
# CSV Format for Bulk Meal Import

This document describes how to prepare a CSV file for importing meals into MealFrame.

---

## 1. CSV Format

### Required Columns

| Column | Required | Type | Description |
|--------|----------|------|-------------|
| `name` | **Yes** | Text | Meal name (e.g., "Scrambled Eggs") |
| `portion_description` | **Yes** | Text | Exact portions (e.g., "2 eggs + 1 slice toast") |

### Optional Columns

| Column | Required | Type | Description |
|--------|----------|------|-------------|
| `calories_kcal` | No | Integer | Total calories |
| `protein_g` | No | Decimal | Protein in grams |
| `carbs_g` | No | Decimal | Carbohydrates in grams |
| `fat_g` | No | Decimal | Fat in grams |
| `meal_types` | No | Text | Comma-separated meal type names |
| `notes` | No | Text | Preparation notes or variations |

---

## 2. Column Details

### name

- Must be non-empty
- Duplicates are allowed (for variations with different portions)
- Keep names descriptive but concise
- Examples: "Scrambled Eggs", "Oatmeal with Protein", "Chicken Rice Bowl"

### portion_description

- **This is the most important field**
- Must be specific enough to follow without decisions
- Include quantities for all components
- Use practical measurements (household measures OK)

**Good examples:**
```
2 eggs + 1 slice whole wheat toast + 10g butter
150g chicken breast + 150g cooked rice + 100g mixed vegetables
1 scoop whey protein + 300ml milk + 1 banana
200g Greek yogurt + 30g granola + handful berries
```

**Bad examples:**
```
Eggs and toast          (no quantities)
Chicken with rice       (vague)
Protein shake           (no ingredients)
Some yogurt with stuff  (too vague)
```

### meal_types

- Comma-separated list of meal type names
- Names must exactly match existing meal types (case-sensitive)
- If a meal type doesn't exist, import will log a warning and skip that assignment
- A meal can belong to multiple types

**Examples:**
```
Breakfast
Breakfast,Weekend Breakfast
Pre-Workout Snack,Post-Workout Snack
Dinner,After-Exercise Dinner,Light Dinner
```

### Numeric columns (calories, protein, carbs, fat)

- Use decimal point (not comma) for decimals: `25.5` not `25,5`
- Leave empty if unknown (don't use 0 unless actually zero)
- Values should be for the defined portion, not per 100g

---

## 3. Example CSV

```csv
name,portion_description,calories_kcal,protein_g,carbs_g,fat_g,meal_types,notes
"Scrambled Eggs","2 eggs + 1 slice whole wheat toast + 10g butter",320,18,15,22,"Breakfast,Weekend Breakfast","Use whole wheat bread"
"Oatmeal with Protein","60g oats + 1 scoop whey + 1 banana",420,32,58,6,"Pre-Workout Breakfast","Microwave 2 minutes"
"Protein Coffee","1 scoop whey + 200ml cold brew + ice",120,25,3,1,"Mid-Morning Protein",""
"Chicken Rice Bowl","150g chicken breast + 150g rice + mixed vegetables",520,42,50,12,"Lunch","Meal prep friendly"
"Cottage Cheese Snack","200g cottage cheese + cucumber + cherry tomatoes",220,28,8,8,"Afternoon Filler",""
"Rice Cakes Pre-Workout","3 rice cakes + 1 banana + 15g honey",280,4,62,2,"Pre-Workout Snack","Quick energy"
"Protein Smoothie","1.5 scoops whey + 1 banana + 200ml milk",350,40,35,6,"Post-Workout Snack","Blend with ice"
"Grilled Salmon Dinner","180g salmon + 200g roasted vegetables + small potato",520,42,30,25,"Dinner,After-Exercise Dinner",""
"Grilled Chicken Salad","150g chicken breast + large mixed salad + 1 tbsp olive oil dressing",350,40,12,16,"Light Dinner","No croutons"
"Full Weekend Breakfast","2 eggs + 2 bacon strips + toast + tomatoes + half portion beans",550,30,35,32,"Weekend Breakfast","Weekend treat"
"Trail Mix Pack","80g trail mix (nuts + dried fruit)",420,12,40,26,"Hiking Fuel","Pre-portion in bags"
```

---

## 4. Import Process

### Via API

```
POST /api/v1/meals/import
Content-Type: multipart/form-data

file: [CSV file]
```

### Response

```json
{
  "success": true,
  "summary": {
    "total_rows": 11,
    "created": 10,
    "skipped": 1,
    "warnings": 2
  },
  "warnings": [
    {
      "row": 5,
      "message": "Meal type 'Unknown Type' not found, skipping assignment"
    },
    {
      "row": 8,
      "message": "Missing calories_kcal, imported with null value"
    }
  ],
  "errors": [
    {
      "row": 3,
      "message": "Missing required field: portion_description"
    }
  ]
}
```

### Behavior

- **Rows with errors** are skipped, others are imported
- **Duplicate names** are allowed (creates new meal)
- **Unknown meal types** are logged as warnings, meal is still created
- **Missing optional fields** result in null values

---

## 5. Preparing Your Data

### From Google Sheets

1. Create columns matching the format above
2. File → Download → Comma Separated Values (.csv)
3. Ensure text fields with commas are properly quoted

### From Excel

1. Create columns matching the format above
2. Save As → CSV UTF-8 (Comma delimited)
3. Check that special characters are preserved

### Tips

- **Start small**: Import 5-10 meals first to verify format
- **Use quotes**: Wrap text fields in quotes if they contain commas
- **Check meal types**: Export existing meal types first to ensure exact name matches
- **UTF-8 encoding**: Use UTF-8 to preserve special characters

---

## 6. Existing Meal Types Reference

Before importing, verify your meal type names match exactly. These are the default meal types:

| Meal Type Name |
|----------------|
| Breakfast |
| Pre-Workout Breakfast |
| Mid-Morning Protein |
| Lunch |
| Afternoon Filler |
| Pre-Workout Snack |
| Post-Workout Snack |
| Dinner |
| After-Exercise Dinner |
| Weekend Breakfast |
| Light Dinner |
| Hiking Fuel |

**Note:** Names are case-sensitive. "breakfast" will not match "Breakfast".

---

## 7. Template File

A blank template CSV is available:

```csv
name,portion_description,calories_kcal,protein_g,carbs_g,fat_g,meal_types,notes
```

Copy this header row and add your meals below.

---

## 8. Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Meal created but no types assigned | Meal type name doesn't match | Check exact spelling and case |
| Row skipped entirely | Missing required field | Ensure name and portion_description are filled |
| Garbled characters | Encoding issue | Save as UTF-8 |
| Numbers parsed incorrectly | Using comma as decimal | Use period: `25.5` not `25,5` |
| Extra empty meals | Trailing blank rows | Remove empty rows at end of CSV |

---

## 9. Re-importing

- Import creates new meals; it does not update existing ones
- To update a meal, delete and re-import, or edit in the app
- Future enhancement: optional "update by name" mode
