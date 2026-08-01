import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Input, Badge, Avatar, Spinner, Skeleton, Progress } from '../src/components/atoms/index';
import { SearchBar } from '../src/components/molecules/SearchBar';
import { Mail } from 'lucide-react';

// ─── Input Stories ────────────────────────────────────────────
const inputMeta: Meta<typeof Input> = {
  title: 'Atoms/Input',
  component: Input,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};
export default inputMeta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { label: 'Email address', placeholder: 'you@example.com', type: 'email' },
};

export const WithLeftIcon: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    type: 'email',
    leftIcon: <Mail className="h-4 w-4" />,
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    error: 'Please enter a valid email address.',
  },
};

export const WithHint: Story = {
  args: {
    label: 'Password',
    type: 'password',
    hint: 'Must be at least 8 characters with uppercase and number.',
  },
};

export const Required: Story = {
  args: { label: 'Full Name', placeholder: 'John Doe', required: true },
};

export const Disabled: Story = {
  args: { label: 'Email', value: 'user@example.com', disabled: true },
};

// ─── Badge Stories ────────────────────────────────────────────
export const Badges: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      {(
        ['default', 'secondary', 'destructive', 'outline', 'success', 'warning', 'info'] as const
      ).map((v) => (
        <Badge key={v} variant={v}>
          {v}
        </Badge>
      ))}
    </div>
  ),
};

// ─── Avatar Stories ───────────────────────────────────────────
export const Avatars: StoryObj = {
  render: () => (
    <div className="flex items-center gap-4 p-4">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Avatar alt="John Doe" name="John Doe" size={size} />
          <span className="text-xs text-muted-foreground">{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const AvatarWithImage: StoryObj = {
  render: () => (
    <Avatar
      src="https://api.dicebear.com/7.x/avataaars/svg?seed=esim"
      alt="User Avatar"
      name="John Doe"
      size="lg"
    />
  ),
};

// ─── Progress Stories ─────────────────────────────────────────
export const ProgressBars: StoryObj = {
  render: () => (
    <div className="w-72 space-y-4 p-4">
      {[10, 30, 50, 70, 90, 100].map((v) => (
        <div key={v}>
          <p className="mb-1 text-xs text-muted-foreground">{v}% used</p>
          <Progress value={v} showLabel />
        </div>
      ))}
    </div>
  ),
};

// ─── Skeleton Stories ─────────────────────────────────────────
export const Skeletons: StoryObj = {
  render: () => (
    <div className="w-72 space-y-3 p-4">
      <Skeleton className="h-8 w-3/4 rounded-lg" />
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-4 w-5/6 rounded" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="flex gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
      </div>
    </div>
  ),
};

// ─── Spinner Stories ──────────────────────────────────────────
export const Spinners: StoryObj = {
  render: () => (
    <div className="flex items-center gap-8 p-4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Spinner size={size} />
          <span className="text-xs text-muted-foreground">{size}</span>
        </div>
      ))}
    </div>
  ),
};

// ─── SearchBar Stories ────────────────────────────────────────
export const SearchBars: StoryObj = {
  render: () => {
    const [value, setValue] = React.useState('');
    return (
      <div className="w-80 space-y-4 p-4">
        <SearchBar
          value={value}
          onChange={setValue}
          placeholder="Search plans…"
          aria-label="Search plans"
        />
        <SearchBar
          value="japan"
          onChange={() => {}}
          placeholder="With value"
          aria-label="Filled search"
        />
        <SearchBar
          value=""
          onChange={() => {}}
          placeholder="Loading…"
          isLoading
          aria-label="Loading search"
        />
      </div>
    );
  },
};
