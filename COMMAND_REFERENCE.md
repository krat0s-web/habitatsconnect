# 🎯 Quick Command Reference

## Essential Commands

### 1️⃣ Install Dependencies (MUST RUN FIRST!)

```bash
npm install
```

This installs all shadcn/ui dependencies. TypeScript errors will disappear after this.

### 2️⃣ Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 to see your app.

### 3️⃣ Build for Production

```bash
npm run build
```

Creates optimized production build.

### 4️⃣ Check for Errors

```bash
npm run lint
```

Runs ESLint to check for code issues.

---

## Component Import Examples

### Basic Imports

```tsx
// Single component
import { Button } from '@/components/ui/button';

// Multiple components
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Card components
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// All at once (if needed)
import { Button, Input, Card, Badge } from '@/components/ui';
```

---

## Quick Component Reference

### Button

```tsx
<Button>Default</Button>
<Button variant="gradient">Gradient</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// With Link
<Button asChild>
  <Link href="/dashboard">Dashboard</Link>
</Button>
```

### Input

```tsx
<Input type="text" placeholder="Enter text" />
<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" />
<Input className="h-11" /> // Custom height
```

### Label

```tsx
<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" />
```

### Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Badge

```tsx
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Error</Badge>

// Custom variants
<Badge variant="purple">Villa</Badge>
<Badge variant="blue">Apartment</Badge>
<Badge variant="pink">Studio</Badge>
<Badge variant="success">Available</Badge>
<Badge variant="warning">Pending</Badge>
```

### Select

```tsx
<Select onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Textarea

```tsx
<Textarea placeholder="Enter description" rows={4} />
```

### Separator

```tsx
<Separator />
<Separator orientation="vertical" />
<Separator className="my-4" />
```

### Avatar

```tsx
<Avatar>
  <AvatarImage src="/avatar.jpg" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

---

## Migration Patterns

### Replace Button

```tsx
// Before
<button className="px-4 py-2 bg-blue-500 text-white rounded">
  Click me
</button>

// After
<Button variant="default">Click me</Button>
```

### Replace Input

```tsx
// Before
<input
  type="text"
  className="border rounded px-3 py-2 w-full"
/>

// After
<Input type="text" />
```

### Replace Card Container

```tsx
// Before
<div className="bg-white rounded-lg shadow-md p-6">
  <h3 className="font-bold mb-2">Title</h3>
  <p>Content</p>
</div>

// After
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>
```

### Replace Badge

```tsx
// Before
<div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
  Status
</div>

// After
<Badge variant="blue">Status</Badge>
```

### Form with Labels

```tsx
// Before
<div>
  <label className="block mb-2">Email</label>
  <input type="email" className="border rounded px-3 py-2" />
</div>

// After
<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>
```

---

## Common Utilities

### cn() Helper

```tsx
import { cn } from '@/lib/utils';

// Combine class names with proper merging
<Button className={cn('rounded-full', isActive && 'bg-blue-500', 'px-8')}>Button</Button>;
```

---

## File Locations

```
📁 Components
src/components/ui/
├── button.tsx
├── input.tsx
├── textarea.tsx
├── label.tsx
├── card.tsx
├── badge.tsx
├── avatar.tsx
├── select.tsx
├── separator.tsx
└── index.ts

📁 Utilities
src/lib/
└── utils.ts

📁 Config
├── components.json
├── tailwind.config.ts
└── package.json
```

---

## Troubleshooting

### TypeScript Errors

**Problem:** "Cannot find module '@radix-ui/react-\*'"  
**Solution:** Run `npm install`

### Styles Not Working

**Problem:** Component has no styling  
**Solution:** Make sure Tailwind config includes `tailwindcss-animate`

### Import Errors

**Problem:** Cannot import component  
**Solution:** Check path uses `@/components/ui/...`

### Build Errors

**Problem:** Build fails  
**Solution:**

```bash
rm -rf node_modules .next
npm install
npm run build
```

---

## Documentation Links

📖 [SHADCN_MIGRATION.md](./SHADCN_MIGRATION.md) - Full migration guide  
📖 [QUICK_START_SHADCN.md](./QUICK_START_SHADCN.md) - Quick start guide  
📖 [SUMMARY_SHADCN_INTEGRATION.md](./SUMMARY_SHADCN_INTEGRATION.md) - Complete summary  
📖 [SHADCN_CHECKLIST.md](./SHADCN_CHECKLIST.md) - Migration checklist  
🌐 [shadcn/ui Docs](https://ui.shadcn.com) - Official documentation

---

## Migration Workflow

1. **Pick a component/page to migrate**
2. **Import shadcn components:**
   ```tsx
   import { Button, Input, Card } from '@/components/ui';
   ```
3. **Replace HTML elements:**
   - `<button>` → `<Button>`
   - `<input>` → `<Input>`
   - `<div className="card">` → `<Card>`
4. **Use variants instead of classes:**
   ```tsx
   <Button variant="gradient">
   ```
5. **Test the changes**
6. **Move to next component**

---

**Pro Tip:** Use VS Code's IntelliSense! Type `<Button ` and press `Ctrl+Space` to see all available props and variants.

---

_Last Updated: November 23, 2025_
