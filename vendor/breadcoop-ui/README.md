# Bread UI Kit

A React TypeScript component library for implementing Bread Coop branding in JS/TS projects. Built for **Tailwind CSS v4**.

## Installation

```bash
pnpm install @breadcoop/ui
```

## Preview

Preview the available typography and components on the [Storybook Demo](http://breadcoopstorybook.netlify.app/).

### Quick Setup

1. **Install Tailwind v4** in your project:

   ```bash
   npm install tailwindcss@next @tailwindcss/postcss@next
   ```

2. **Import the theme** in your main CSS file:

   ```css
   /* globals.css or your main CSS file */
   @import "tailwindcss";
   @import "@breadcoop/ui/theme";
   ```

3. **Use components** in your React app:
   ```tsx
   import { Button, Heading1, Body } from "@breadcoop/ui";
   import "./globals.css"; // Make sure to import your CSS file i.e. in layout.ts
   ```

## Usage

### Basic Setup

```css
/* globals.css */
@import "tailwindcss";
@import "@breadcoop/ui/theme";
```

```tsx
import React from "react";
import { Button, Heading1, Body } from "@breadcoop/ui";
import "./globals.css";

function App() {
  return (
    <div>
      <Heading1>Welcome to Bread Coop</Heading1>
      <Body>This text uses our brand typography.</Body>
      <Button onClick={() => console.log("Clicked!")}>Click me</Button>

      {/* Tailwind classes available in imported theme can be used */}
      <div className="bg-primary-orange text-white p-4 rounded-md">
        Custom styled element
      </div>
    </div>
  );
}
```

## Components

The sections below cover the most common components. For a one-line index of **everything**
the package exports — components, providers, hooks, utils, and types — see
[docs/COMPONENTS.md](./docs/COMPONENTS.md), or browse the
[Storybook demo](http://breadcoopstorybook.netlify.app/).

### Typography

```tsx
import { Typography } from "@breadcoop/ui";

<Typography variant="h1">Main Heading</Typography>
<Typography variant="h2">Section Heading</Typography>
<Typography variant="body">Body text content</Typography>
<Typography variant="caption">Small caption text</Typography>
```

#### Individual Typography Components

```tsx
import { Heading1, Heading2, Heading3, Body, Caption } from "@breadcoop/ui";

<Heading1>Main Heading</Heading1>
<Heading2>Section Heading</Heading2>
<Heading3>Subsection Heading</Heading3>
<Body>Body text content</Body>
<Body bold>Bold body text content</Body>
<Caption>Small caption text</Caption>
```

#### Props

| Component           | Props                                                                  | Description                     |
| ------------------- | ---------------------------------------------------------------------- | ------------------------------- |
| Typography          | `variant: "h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "body" \| "caption"` | Typography variant              |
| Typography          | `children: React.ReactNode`                                            | Content to display              |
| Typography          | `className?: string`                                                   | Additional CSS classes          |
| Heading1-3, Caption | `children: React.ReactNode`                                            | Content to display              |
| Heading1-3, Caption | `className?: string`                                                   | Additional CSS classes          |
| Body                | `children: React.ReactNode`                                            | Content to display              |
| Body                | `className?: string`                                                   | Additional CSS classes          |
| Body                | `bold?: boolean`                                                       | Make text bold (default: false) |

### Button

The primary, app-themed button. It is polymorphic (`as`), brand-aware (`app`), and
supports left/right icons and a loading state.

```tsx
import { Button } from "@breadcoop/ui";

<Button>Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="light">Cancel</Button>
```

#### Props

| Prop                    | Type                                                                         | Default   | Description                                           |
| ----------------------- | ---------------------------------------------------------------------------- | --------- | ----------------------------------------------------- |
| children                | React.ReactNode                                                              | -         | The content of the button                             |
| app                     | 'fund' \| 'stacks' \| 'net'                                                  | 'fund'    | Brand theme: fund = orange, stacks = blue, net = jade |
| variant                 | 'primary' \| 'secondary' \| 'destructive' \| 'positive' \| 'light' \| 'burn' | 'primary' | Visual style                                          |
| size                    | 'sm' \| 'default' \| 'icon'                                                  | 'default' | Padding / sizing (`icon` is square)                   |
| leftIcon                | React.ReactNode                                                              | -         | Icon rendered before the children                     |
| rightIcon               | React.ReactNode                                                              | -         | Icon rendered after the children                      |
| isLoading               | boolean                                                                      | false     | Show a loading spinner and disable the button         |
| showChildrenWhenLoading | boolean                                                                      | false     | Keep the children visible while loading               |
| withBorder              | boolean                                                                      | false     | Add a `surface-ink` border (non-`light` variants)     |
| as                      | ElementType                                                                  | 'button'  | Render as another element/component (e.g. `'a'`)      |
| disabled                | boolean                                                                      | false     | Whether the button is disabled                        |
| className               | string                                                                       | -         | Additional CSS classes (merged with `cn`)             |

Any other props are forwarded to the underlying element, so native attributes like
`onClick`, `type`, and `href` (with `as="a"`) work as expected.

#### Variants

- **primary**: solid brand color (orange / blue / jade depending on `app`).
- **secondary**: lighter tinted background with brand-colored text.
- **light**: paper background with dark ink text and a border.
- **destructive**: red — for irreversible/dangerous actions.
- **positive**: green — for confirming/successful actions.
- **burn**: red-tinted background with red text.

#### Examples

```tsx
import { Button } from "@breadcoop/ui";
import { ArrowUpRight, SignOut } from "@phosphor-icons/react";

// Basic usage
<Button>Click me</Button>

// Variants
<Button variant="primary">Primary Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="light">Cancel</Button>
<Button variant="destructive">Delete</Button>

// App theme (orange / blue / jade)
<Button app="stacks">Stacks Button</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="icon" aria-label="Open"><ArrowUpRight /></Button>

// With icons
<Button leftIcon={<ArrowUpRight />}>External Link</Button>
<Button rightIcon={<SignOut />}>Sign Out</Button>

// Loading state
<Button isLoading>Saving…</Button>
<Button isLoading showChildrenWhenLoading>Saving…</Button>

// Render as a link
<Button as="a" href="https://breadchain.xyz" target="_blank">
  Visit site
</Button>

// Disabled state
<Button disabled>Disabled Button</Button>
```

### Logo

```tsx
import { Logo } from '@breadcoop/ui';

// Basic usage
<Logo />

// With text and custom styling
<Logo
  text="Bread Coop"
  className="text-xl font-bold"
  color="blue"
  size={48}
/>

// Different variants
<Logo variant="square" color="jade" />
<Logo variant="line" color="white" />
```

#### Props

| Prop      | Type                                      | Default  | Description                                     |
| --------- | ----------------------------------------- | -------- | ----------------------------------------------- |
| size      | `number`                                  | 32       | Size in pixels                                  |
| color     | `"orange" \| "blue" \| "jade" \| "white"` | "orange" | Color variant                                   |
| variant   | `"square" \| "line"`                      | -        | Logo variant                                    |
| text      | `string`                                  | -        | Optional text to display next to the logo       |
| className | `string`                                  | -        | Additional CSS classes (applied to svg element) |

## Local Development & Usage

### Setting Up for Local Development

If you want to use this UI kit in your project during development or make custom modifications, you can set it up locally.

#### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd bread-ui-kit

# Install dependencies
npm install

# Build the library
npm run build
```

#### Step 2: Configure Your Project's package.json

**Option A: Using file: protocol (Recommended)**

Add a local reference to your project's `package.json`:

```json
{
  "dependencies": {
    "bread-ui-kit": "file:../bread-ui-kit"
  }
}
```

Then install:

```bash
pnpm install
```

### Development Workflow

When making changes to the UI kit:

1. **Make your changes** in the `src/` directory
2. **Build the library**: `npm run build`
3. **Test in your project** - `pnpm install`
