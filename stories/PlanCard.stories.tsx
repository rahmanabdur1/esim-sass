import type { Meta, StoryObj } from '@storybook/react';
import { PlanCard } from '@/components/molecules/PlanCard';
import type { Plan } from '@/types';

const mockPlan: Plan = {
  id: '1', name: 'Japan Explorer', data: 10, validity: 30,
  price: 8.99, currency: 'USD', network: 'NTT Docomo',
  coverage: ['JP'], features: ['4G/LTE', 'Tethering', 'No throttling'],
  isPopular: true, isBestValue: false,
  country: { id: 'jp', name: 'Japan', code: 'JP', flag: '🇯🇵', region: 'Asia', continent: 'Asia', networks: ['NTT Docomo'], coverageQuality: 'excellent' },
};

const meta: Meta<typeof PlanCard> = {
  title:      'Molecules/PlanCard',
  component:  PlanCard,
  parameters: { layout: 'centered' },
  tags:       ['autodocs'],
  decorators: [(Story) => <div className="w-72"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof PlanCard>;

export const Default: Story = { args: { plan: mockPlan } };
export const BestValue: Story = { args: { plan: { ...mockPlan, isBestValue: true, isPopular: false, name: 'Best Value Plan' } } };
export const WithCallback: Story = { args: { plan: mockPlan, onSelect: (p) => alert(`Selected: ${p.name}`) } };
export const LargeData: Story = { args: { plan: { ...mockPlan, data: 50, validity: 90, price: 24.99, name: 'Japan Power User' } } };
