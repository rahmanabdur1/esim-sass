import type { Meta, StoryObj } from '@storybook/react';
import { colorTokens, shadowTokens, borderRadiusTokens } from '@/lib/design-tokens/tokens';

// ─── Color Palette Story ──────────────────────────────────────
function ColorPalette() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold mb-6">Color System</h2>
        {Object.entries(colorTokens).map(([groupName, group]) => (
          <div key={groupName} className="mb-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {groupName}
            </h3>
            {'base' in group ? (
              // Semantic colors (success, warning, error, info)
              <div className="flex gap-3">
                {Object.entries(group).map(([shade, value]) => (
                  <div key={shade} className="flex flex-col items-center gap-2">
                    <div
                      className="h-14 w-14 rounded-xl shadow-sm border"
                      style={{ backgroundColor: value as string }}
                      title={`${groupName}.${shade}: ${value}`}
                    />
                    <span className="text-xs text-muted-foreground">{shade}</span>
                  </div>
                ))}
              </div>
            ) : (
              // Scale colors (brand, gray)
              <div className="grid grid-cols-10 gap-2">
                {Object.entries(group).map(([shade, value]) => (
                  <div key={shade} className="flex flex-col items-center gap-1.5">
                    <div
                      className="h-12 w-full rounded-lg shadow-sm"
                      style={{ backgroundColor: value as string }}
                      title={`${groupName}.${shade}: ${value}`}
                    />
                    <span className="text-xs text-muted-foreground">{shade}</span>
                    <span className="text-[10px] text-muted-foreground/60 font-mono hidden xl:block">
                      {(value as string).toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Typography Story ─────────────────────────────────────────
function TypographyScale() {
  const sizes = [
    { name: 'xs',   sample: 'Extra Small — 12px/16px'  },
    { name: 'sm',   sample: 'Small — 14px/20px'         },
    { name: 'base', sample: 'Base — 16px/24px'          },
    { name: 'lg',   sample: 'Large — 18px/28px'         },
    { name: 'xl',   sample: 'X-Large — 20px/28px'       },
    { name: '2xl',  sample: '2X-Large — 24px/32px'      },
    { name: '3xl',  sample: '3X-Large — 30px/36px'      },
    { name: '4xl',  sample: '4X-Large — 36px/40px'      },
    { name: '5xl',  sample: '5X-Large — 48px/48px'      },
  ];
  const weights = [
    { label: 'Normal 400',    className: 'font-normal'    },
    { label: 'Medium 500',    className: 'font-medium'    },
    { label: 'Semibold 600',  className: 'font-semibold'  },
    { label: 'Bold 700',      className: 'font-bold'      },
    { label: 'Extrabold 800', className: 'font-extrabold' },
  ];

  return (
    <div className="p-6 max-w-3xl space-y-10">
      <div>
        <h2 className="font-display text-2xl font-bold mb-6">Type Scale</h2>
        <div className="space-y-4">
          {sizes.map(({ name, sample }) => (
            <div key={name} className="flex items-baseline gap-6 border-b pb-4">
              <span className="w-12 text-xs font-mono text-muted-foreground flex-shrink-0">{name}</span>
              <p className={`text-${name} font-medium`}>{sample}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-2xl font-bold mb-6">Font Weights</h2>
        <div className="space-y-3">
          {weights.map(({ label, className }) => (
            <div key={label} className="flex items-center gap-6 border-b pb-3">
              <span className="w-32 text-xs font-mono text-muted-foreground flex-shrink-0">{label}</span>
              <p className={`text-xl ${className}`}>The quick brown fox jumps over the lazy dog</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-2xl font-bold mb-6">Font Families</h2>
        <div className="space-y-4">
          {[
            { label: 'Sans (Inter)',       className: 'font-sans',    sample: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789' },
            { label: 'Display (Inter)',    className: 'font-display',  sample: 'The eSIM Platform — Global Connectivity' },
            { label: 'Mono (JetBrains)', className: 'font-mono',    sample: 'eyJhbGciOiJIUzI1NiJ9.payload.signature' },
          ].map(({ label, className, sample }) => (
            <div key={label}>
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className={`text-lg ${className}`}>{sample}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Shadows Story ────────────────────────────────────────────
function ShadowScale() {
  return (
    <div className="p-8 bg-muted/30 min-h-screen">
      <h2 className="font-display text-2xl font-bold mb-8">Shadow Scale</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {Object.entries(shadowTokens).map(([name, value]) => (
          <div key={name} className="flex flex-col items-center gap-3">
            <div
              className="h-20 w-full rounded-xl bg-card flex items-center justify-center"
              style={{ boxShadow: value }}
            >
              <span className="text-sm font-mono text-muted-foreground">{name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Border Radius Story ──────────────────────────────────────
function BorderRadiusScale() {
  return (
    <div className="p-8">
      <h2 className="font-display text-2xl font-bold mb-8">Border Radius Scale</h2>
      <div className="flex flex-wrap gap-8 items-end">
        {Object.entries(borderRadiusTokens)
          .filter(([k]) => k !== 'full')
          .map(([name, value]) => (
            <div key={name} className="flex flex-col items-center gap-3">
              <div
                className="h-16 w-16 bg-primary/20 border-2 border-primary"
                style={{ borderRadius: value }}
              />
              <div className="text-center">
                <p className="text-xs font-semibold">{name}</p>
                <p className="text-xs text-muted-foreground font-mono">{value}</p>
              </div>
            </div>
          ))}
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-16 w-16 bg-primary/20 border-2 border-primary rounded-full"
          />
          <div className="text-center">
            <p className="text-xs font-semibold">full</p>
            <p className="text-xs text-muted-foreground font-mono">9999px</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Exports ─────────────────────────────────────────────────
const meta: Meta = {
  title:      'Design System/Tokens',
  parameters: { layout: 'fullscreen' },
};
export default meta;

export const Colors:       StoryObj = { render: () => <ColorPalette />       };
export const Typography:   StoryObj = { render: () => <TypographyScale />    };
export const Shadows:      StoryObj = { render: () => <ShadowScale />        };
export const BorderRadius: StoryObj = { render: () => <BorderRadiusScale />  };
