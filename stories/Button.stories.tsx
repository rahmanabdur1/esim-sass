import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/atoms/Button';
import { Globe, ArrowRight, Trash2 } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title:     'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'The primary interactive element. Supports 7 variants, 5 sizes, loading state, left/right icons, and full accessibility (focus ring, disabled state).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'gradient'],
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg', 'xl', 'icon'],
    },
    isLoading:  { control: 'boolean' },
    disabled:   { control: 'boolean' },
    children:   { control: 'text'    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { children: 'Button', variant: 'default', size: 'default' },
};

export const Gradient: Story = {
  args: { children: 'Get Started', variant: 'gradient', size: 'lg' },
};

export const Outline: Story = {
  args: { children: 'Learn More', variant: 'outline' },
};

export const Destructive: Story = {
  args: { children: 'Delete Account', variant: 'destructive', leftIcon: <Trash2 className="h-4 w-4" /> },
};

export const WithIcons: Story = {
  args: {
    children:  'Browse Plans',
    variant:   'gradient',
    leftIcon:  <Globe      className="h-4 w-4" />,
    rightIcon: <ArrowRight className="h-4 w-4" />,
  },
};

export const Loading: Story = {
  args: { children: 'Saving…', isLoading: true, variant: 'default' },
};

export const Disabled: Story = {
  args: { children: 'Unavailable', disabled: true },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      {(['default','destructive','outline','secondary','ghost','link','gradient'] as const).map((v) => (
        <Button key={v} variant={v}>{v}</Button>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center flex-wrap gap-3 p-4">
      {(['sm','default','lg','xl'] as const).map((s) => (
        <Button key={s} size={s} variant="gradient">{s}</Button>
      ))}
    </div>
  ),
};
