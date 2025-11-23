# 🚀 Quick Start - shadcn/ui Integration

## ⚠️ IMPORTANT: Install Dependencies First!

The TypeScript errors you're seeing are normal - they'll disappear after installing the required packages.

## Step 1: Install All Dependencies

Run this command in your terminal:

```bash
npm install
```

This will install all the new dependencies added to `package.json`, including:

- `@radix-ui/react-*` packages (Avatar, Dialog, Select, etc.)
- `class-variance-authority` (for component variants)
- `clsx` and `tailwind-merge` (for className handling)
- `lucide-react` (modern icons)
- `tailwindcss-animate` (smooth animations)

## Step 2: Verify Installation

After installation completes, the TypeScript errors should be gone. Verify by checking:

```bash
# Check if compilation works
npm run build

# Or start the dev server
npm run dev
```

## Step 3: See What's Changed

### ✅ Migrated Components (Working)

1. **Navbar** - Modern buttons and inputs
2. **PropertyCard** - Card components with badges
3. **Footer** - Button-based social links
4. **Login Page** - Form components with labels
5. **Register Page** - Complete form migration

### 🔄 Next Components to Migrate

6. **PropertyDetail** - Needs buttons and cards
7. **Dashboard Pages** - All owner/client dashboards
8. **Homepage** - Hero section and listings
9. **Properties Pages** - Filters and search

## Step 4: Use the New Components

### Example: Creating a Button

**Old way (no longer recommended):**

```tsx
<button className="px-4 py-2 bg-blue-500 text-white rounded">Click me</button>
```

**New way with shadcn/ui:**

```tsx
import { Button } from '@/components/ui/button';

<Button variant="gradient">Click me</Button>;
```

### Example: Creating a Card

**Old way:**

```tsx
<div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-xl font-bold">Title</h2>
  <p>Content here</p>
</div>
```

**New way:**

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content here</p>
  </CardContent>
</Card>;
```

### Example: Creating Form Inputs

**Old way:**

```tsx
<div>
  <label>Email</label>
  <input type="email" className="border rounded px-3 py-2" />
</div>
```

**New way:**

```tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>;
```

## Step 5: Available Components

All components are in `src/components/ui/`:

```
✅ button.tsx       - Buttons with variants (default, outline, ghost, gradient)
✅ input.tsx        - Text inputs
✅ textarea.tsx     - Multi-line text inputs
✅ label.tsx        - Form labels
✅ card.tsx         - Container cards
✅ badge.tsx        - Status badges
✅ avatar.tsx       - User avatars
✅ select.tsx       - Dropdown selects
✅ separator.tsx    - Visual dividers
```

## Step 6: Custom Variants

### Button Variants

```tsx
<Button variant="default">Default</Button>
<Button variant="gradient">Gradient (Custom)</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button variant="secondary">Secondary</Button>
```

### Badge Variants

```tsx
<Badge variant="default">Default</Badge>
<Badge variant="purple">Villa</Badge>
<Badge variant="blue">Apartment</Badge>
<Badge variant="pink">Studio</Badge>
<Badge variant="success">Available</Badge>
<Badge variant="warning">Pending</Badge>
```

## Step 7: Migration Workflow

For each page/component you want to migrate:

1. **Import the UI components:**

   ```tsx
   import { Button } from '@/components/ui/button';
   import { Input } from '@/components/ui/input';
   import { Card, CardContent } from '@/components/ui/card';
   ```

2. **Replace native HTML elements:**
   - `<button>` → `<Button>`
   - `<input>` → `<Input>`
   - `<textarea>` → `<Textarea>`
   - `<label>` → `<Label>`
   - `<div className="card">` → `<Card>`

3. **Use variants instead of className:**

   ```tsx
   // Before
   <button className="bg-blue-500 hover:bg-blue-600">

   // After
   <Button variant="default">
   ```

4. **Test the page:** Verify styling and functionality work correctly

## Step 8: Complete Documentation

For detailed information, see:

📖 **[SHADCN_MIGRATION.md](./SHADCN_MIGRATION.md)** - Complete migration guide with examples

📖 **[shadcn/ui Docs](https://ui.shadcn.com)** - Official documentation

## Troubleshooting

### "Cannot find module" errors

**Solution:** Run `npm install` - these errors mean dependencies aren't installed yet

### Styles not applying

**Solution:** Make sure Tailwind config includes `tailwindcss-animate` plugin

### TypeScript errors on variants

**Solution:** Restart TypeScript server in VS Code (Cmd+Shift+P → "TypeScript: Restart TS Server")

### Component not found

**Solution:** Check the import path uses `@/components/ui/...`

## Next Steps

1. ✅ Install dependencies (`npm install`)
2. ✅ Start dev server (`npm run dev`)
3. ✅ Test migrated components
4. 🔄 Migrate remaining pages (see todo list)
5. 🎨 Customize component styles to match your brand

---

**Need help?** Check `SHADCN_MIGRATION.md` for detailed examples and best practices!
