# Test App - Component Specifications

## Component Library

### Button Component

**Purpose**: Reusable button with Nord theme styling

**Props**:
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}
```

**Styles**:
- Primary: `bg-[#88C0D0]` with `text-[#2E3440]`
- Secondary: `bg-[#3B4252]` with `text-[#D8DEE9]`
- Danger: `bg-[#BF616A]` with `text-[#ECEFF4]`

---

### Card Component

**Purpose**: Container for content sections

**Props**:
```typescript
interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}
```

**Layout**:
- Background: `#3B4252`
- Border: `#434C5E`
- Padding: `1.5rem`
- Border radius: `0.5rem`

---

### Input Component

**Purpose**: Form input with validation

**Props**:
```typescript
interface InputProps {
  type: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
}
```

**States**:
- Default: `border-[#434C5E]`
- Focus: `border-[#88C0D0]`
- Error: `border-[#BF616A]`

---

### Modal Component

**Purpose**: Overlay dialog for focused interactions

**Props**:
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

**Features**:
- Backdrop: `bg-black/50`
- Animated entrance/exit
- Click outside to close
- ESC key to close

---

### Navigation Component

**Purpose**: Top-level navigation bar

**Structure**:
```tsx
<nav className="bg-[#2E3440] border-b border-[#3B4252]">
  <NavLink to="/">Home</NavLink>
  <NavLink to="/about">About</NavLink>
  <NavLink to="/contact">Contact</NavLink>
</nav>
```

**Active State**: `text-[#88C0D0] border-b-2 border-[#88C0D0]`

---

### Table Component

**Purpose**: Data display in tabular format

**Props**:
```typescript
interface TableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
}

interface Column {
  key: string;
  label: string;
  render?: (value: any) => React.ReactNode;
}
```

**Styling**:
- Header: `bg-[#3B4252]` with bold text
- Rows: Alternating `bg-[#2E3440]` and `bg-[#3B4252]/50`
- Hover: `bg-[#434C5E]`

---

## Usage Examples

### Button
```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Submit
</Button>
```

### Card
```tsx
<Card title="User Profile">
  <p>Profile content here</p>
</Card>
```

### Input
```tsx
<Input
  type="email"
  label="Email Address"
  value={email}
  onChange={setEmail}
  error={emailError}
/>
```

---

## Design Tokens

**Colors** (Nord):
- Polar Night: `#2E3440`, `#3B4252`, `#434C5E`, `#4C566A`
- Snow Storm: `#D8DEE9`, `#E5E9F0`, `#ECEFF4`
- Frost: `#8FBCBB`, `#88C0D0`, `#81A1C1`, `#5E81AC`
- Aurora: `#BF616A`, `#D08770`, `#EBCB8B`, `#A3BE8C`, `#B48EAD`

**Typography**:
- Font Family: Inter, system-ui, sans-serif
- Sizes: 10px, 12px, 14px, 16px, 20px, 24px
- Weights: 400 (normal), 600 (semibold), 700 (bold)

**Spacing**:
- Scale: 0.25rem, 0.5rem, 0.75rem, 1rem, 1.5rem, 2rem, 3rem, 4rem

**Border Radius**:
- sm: 0.25rem
- md: 0.5rem
- lg: 0.75rem
- full: 9999px
