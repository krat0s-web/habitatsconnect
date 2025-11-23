# shadcn/ui Migration Guide

## Overview

This project has been migrated from native JSX elements to **shadcn/ui**, a modern React UI library built on:

- **Radix UI** - Accessible, unstyled component primitives
- **Tailwind CSS** - Utility-first styling (already in use)
- **CVA (Class Variance Authority)** - Type-safe component variants
- **TypeScript** - Full type safety

## Why shadcn/ui?

✅ **Not a package dependency** - Components are copied into your codebase, giving you full control  
✅ **Tailwind-native** - Seamlessly integrates with your existing Tailwind setup  
✅ **Accessible by default** - Built on Radix UI primitives  
✅ **Customizable** - Easily modify components to match your brand  
✅ **Type-safe** - Full TypeScript support  
✅ **Production-ready** - Used by companies like Vercel, Cal.com, and more

## Installation Steps

### 1. Install Dependencies

```bash
npm install @radix-ui/react-avatar @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-tabs @radix-ui/react-toast class-variance-authority clsx lucide-react tailwind-merge tailwindcss-animate
```

### 2. Update Tailwind Config

The `tailwind.config.ts` has been updated with:

- `tailwindcss-animate` plugin for smooth animations
- Border radius CSS variables for consistent styling

### 3. Component Library Structure

All shadcn/ui components are located in `src/components/ui/`:

```
src/components/ui/
├── avatar.tsx       # User avatars with fallbacks
├── badge.tsx        # Status badges with variants
├── button.tsx       # Primary button component
├── card.tsx         # Card container with header/footer
├── input.tsx        # Form input fields
├── label.tsx        # Form labels
├── select.tsx       # Dropdown select menus
├── separator.tsx    # Visual dividers
└── textarea.tsx     # Multi-line text inputs
```

### 4. Utility Function

The `cn()` utility function combines `clsx` and `tailwind-merge` for optimal className handling:

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Components Migrated

### ✅ Completed Migrations

1. **Navbar** (`src/components/Navbar.tsx`)
   - Replaced `<button>` with `<Button>`
   - Replaced `<input>` with `<Input>`
   - Added proper icon button variants
   - Improved mobile menu styling

2. **PropertyCard** (`src/components/PropertyCard.tsx`)
   - Replaced `<div>` containers with `<Card>` components
   - Replaced badge `<div>` with `<Badge>` variants
   - Replaced favorite `<button>` with `<Button variant="secondary">`
   - Added `<Separator>` for visual hierarchy

3. **Footer** (`src/components/Footer.tsx`)
   - Replaced social media links with `<Button variant="ghost">`
   - Added `<Separator>` for bottom divider
   - Improved accessibility with proper button semantics

4. **Auth Pages** (`src/app/auth/login/page.tsx`, `src/app/auth/register/page.tsx`)
   - Replaced all `<input>` elements with `<Input>`
   - Replaced `<label>` with `<Label>`
   - Replaced action buttons with `<Button variant="gradient">`
   - Wrapped forms in `<Card>` components
   - Improved form accessibility and validation

### 🔄 Remaining Pages to Migrate

5. **PropertyDetail** (`src/components/PropertyDetail.tsx`)
   - Migration needed: Replace buttons, inputs, badges

6. **Dashboard Pages** (Owner & Client dashboards)
   - All dashboard pages need component migration
   - Focus on forms, tables, and action buttons

7. **Homepage** (`src/app/page.tsx`)
   - Hero section buttons
   - Property listings grid

8. **Properties Pages** (`src/app/properties/*`)
   - Filter forms
   - Search inputs
   - Property listings

## Usage Examples

### Button Component

```tsx
import { Button } from '@/components/ui/button';

// Default button
<Button>Click me</Button>

// Gradient variant (custom for this project)
<Button variant="gradient">Sign Up</Button>

// Outline variant
<Button variant="outline">Cancel</Button>

// Icon button
<Button variant="ghost" size="icon">
  <FaUser />
</Button>

// With Link (Next.js)
<Button variant="gradient" asChild>
  <Link href="/dashboard">Go to Dashboard</Link>
</Button>
```

### Input Component

```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="your@email.com" className="h-11" />
</div>;
```

### Card Component

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Property Details</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Your content here</p>
  </CardContent>
</Card>;
```

### Badge Component

```tsx
import { Badge } from '@/components/ui/badge';

// Property type badges
<Badge variant="purple">Villa</Badge>
<Badge variant="blue">Apartment</Badge>
<Badge variant="secondary">Garage</Badge>

// Status badges
<Badge variant="success">Available</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="destructive">Unavailable</Badge>
```

## Custom Variants

### Button Gradient Variant

A custom `gradient` variant has been added to match your brand:

```tsx
// In button.tsx
gradient: 'bg-gradient-fluid text-white shadow-sm hover:shadow-lg hover:shadow-primary-500/50';
```

Usage:

```tsx
<Button variant="gradient">Get Started</Button>
```

### Badge Color Variants

Custom badge variants for property types and statuses:

```tsx
<Badge variant="purple">Villa</Badge>      // Purple for villas
<Badge variant="blue">Apartment</Badge>    // Blue for apartments
<Badge variant="pink">Studio</Badge>       // Pink for studios
<Badge variant="success">Confirmed</Badge> // Green for success
<Badge variant="warning">Pending</Badge>   // Yellow for warnings
```

## Benefits Realized

### 1. **Consistency**

All form inputs, buttons, and interactive elements now use the same component system with consistent styling.

### 2. **Accessibility**

Radix UI primitives provide:

- Keyboard navigation
- Screen reader support
- ARIA attributes
- Focus management

### 3. **Maintainability**

- Single source of truth for component styles
- Easy to update theme across entire app
- Type-safe props prevent errors

### 4. **Developer Experience**

- Autocomplete for component props
- Variant suggestions in IDE
- Consistent API across all components

### 5. **Performance**

- Tree-shakeable components
- No runtime style generation
- Optimized for production builds

## Migration Checklist

To complete the migration for remaining pages:

- [ ] Migrate PropertyDetail component
- [ ] Update all dashboard pages (owner and client)
- [ ] Convert homepage hero and featured sections
- [ ] Update properties listing and filter pages
- [ ] Migrate any remaining forms and inputs
- [ ] Replace all standalone `<button>` elements
- [ ] Replace all `<input>` and `<textarea>` elements
- [ ] Replace `<select>` with shadcn Select component
- [ ] Add proper Labels to all form fields

## Best Practices

### 1. Always Use Semantic Components

❌ **Bad:**

```tsx
<div className="p-4 border rounded">Content</div>
```

✅ **Good:**

```tsx
<Card>
  <CardContent>Content</CardContent>
</Card>
```

### 2. Leverage Variants

❌ **Bad:**

```tsx
<button className={isActive ? 'bg-blue-500' : 'bg-gray-200'}>Click me</button>
```

✅ **Good:**

```tsx
<Button variant={isActive ? 'default' : 'secondary'}>Click me</Button>
```

### 3. Use asChild for Link Integration

❌ **Bad:**

```tsx
<Link href="/dashboard">
  <button>Go to Dashboard</button>
</Link>
```

✅ **Good:**

```tsx
<Button asChild>
  <Link href="/dashboard">Go to Dashboard</Link>
</Button>
```

### 4. Combine with Tailwind for Customization

```tsx
<Button variant="gradient" className="rounded-full px-8">
  Custom Styled Button
</Button>
```

## Troubleshooting

### Type Errors

If you see TypeScript errors about missing variants:

1. Check that `class-variance-authority` is installed
2. Restart your TypeScript server in VS Code

### Style Not Applying

If styles aren't working:

1. Ensure `tailwindcss-animate` is in dependencies
2. Verify Tailwind config has the plugin: `plugins: [require("tailwindcss-animate")]`
3. Check that component path matches the import

### Component Not Found

If imports fail:

1. Verify the component exists in `src/components/ui/`
2. Check the path alias `@/components` is configured in `tsconfig.json`

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com)
- [Tailwind CSS](https://tailwindcss.com)
- [CVA Documentation](https://cva.style)

## Next Steps

1. **Install dependencies**: Run `npm install` to install all new packages
2. **Complete remaining migrations**: Use the checklist above to migrate all pages
3. **Customize components**: Adjust variants and styles to match your exact brand requirements
4. **Add more components**: Consider adding Dialog, Dropdown Menu, Toast for enhanced UX

---

**Migration completed by:** GitHub Copilot  
**Date:** November 23, 2025  
**Status:** Core components migrated ✅ | Remaining pages in progress 🔄
