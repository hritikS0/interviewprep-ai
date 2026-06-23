import { useState } from 'react'

const sections = [
  { id: 'profile', label: 'Profile' },
  { id: 'ai-provider', label: 'AI Provider' },
  { id: 'api-keys', label: 'API Keys' },
  { id: 'security', label: 'Security' },
] as const

type Section = (typeof sections)[number]['id']

export default function Settings() {
  const [activeSection, setActiveSection] = useState<Section>('profile')

  return (
    <div className="max-w-[800px] mx-auto">
      <h1 className="text-[28px] font-semibold tracking-[-0.6px] text-text-primary mb-8">Settings</h1>

      <div className="flex gap-8">
        <div className="w-[200px] flex-shrink-0 space-y-0.5">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-[14px] font-medium transition-colors ${
                activeSection === s.id
                  ? 'bg-[#F3F4F6] dark:bg-[#27272A] text-text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-[#F9FAFB] dark:hover:bg-[#27272A]/50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex-1 rounded-[12px] border border-border bg-surface p-6">
          {activeSection === 'profile' && <ProfileSection />}
          {activeSection === 'ai-provider' && <AIProviderSection />}
          {activeSection === 'api-keys' && <APIKeysSection />}
          {activeSection === 'security' && <SecuritySection />}
        </div>
      </div>
    </div>
  )
}

function ProfileSection() {
  return (
    <div>
      <h2 className="text-[18px] font-semibold text-text-primary mb-1">Profile</h2>
      <p className="text-[14px] text-text-secondary mb-6">Manage your personal information.</p>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="First Name" defaultValue="Ashmit" />
          <FormField label="Last Name" defaultValue="Sharma" />
        </div>
        <FormField label="Email" type="email" defaultValue="ashmit@example.com" />
        <FormField label="Current Role" defaultValue="Software Engineer" />
        <FormField label="Years of Experience" defaultValue="5" />
      </div>

      <button className="mt-6 px-5 py-2.5 rounded-[10px] bg-accent text-white text-[14px] font-medium hover:bg-accent-hover transition-colors">
        Save Changes
      </button>
    </div>
  )
}

function AIProviderSection() {
  return (
    <div>
      <h2 className="text-[18px] font-semibold text-text-primary mb-1">AI Provider</h2>
      <p className="text-[14px] text-text-secondary mb-6">Configure which AI model powers your interviews.</p>

      <div className="space-y-4">
        {[
          { name: 'OpenAI GPT-4o', description: 'Best overall performance and accuracy.', selected: true },
          { name: 'Anthropic Claude 4', description: 'Excellent reasoning and nuanced responses.', selected: false },
          { name: 'DeepSeek', description: 'Cost-effective with strong coding capabilities.', selected: false },
        ].map((provider) => (
          <label
            key={provider.name}
            className={`flex items-start gap-3 p-4 rounded-[10px] border cursor-pointer transition-colors ${
              provider.selected
                ? 'border-accent bg-accent-light dark:bg-blue-950/20'
                : 'border-border hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
          >
            <input
              type="radio"
              name="ai-provider"
              defaultChecked={provider.selected}
              className="mt-0.5 accent-accent"
            />
            <div>
              <div className="text-[14px] font-medium text-text-primary">{provider.name}</div>
              <div className="text-[13px] text-text-secondary mt-0.5">{provider.description}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}

function APIKeysSection() {
  return (
    <div>
      <h2 className="text-[18px] font-semibold text-text-primary mb-1">API Keys</h2>
      <p className="text-[14px] text-text-secondary mb-6">Manage your API keys securely. Keys are encrypted at rest.</p>

      <div className="space-y-5">
        <FormField label="OpenAI API Key" type="password" defaultValue="sk-••••••••••••••••••••••••" />
        <FormField label="Anthropic API Key" type="password" defaultValue="" placeholder="Enter your API key" />
        <FormField label="DeepSeek API Key" type="password" defaultValue="" placeholder="Enter your API key" />
      </div>

      <button className="mt-6 px-5 py-2.5 rounded-[10px] bg-accent text-white text-[14px] font-medium hover:bg-accent-hover transition-colors">
        Save Keys
      </button>
    </div>
  )
}

function SecuritySection() {
  return (
    <div>
      <h2 className="text-[18px] font-semibold text-text-primary mb-1">Security</h2>
      <p className="text-[14px] text-text-secondary mb-6">Manage your account security settings.</p>

      <div className="space-y-6">
        <div>
          <label className="text-[14px] font-medium text-text-primary block mb-1.5">Change Password</label>
          <input
            type="password"
            placeholder="Current password"
            className="w-full rounded-[10px] border border-border bg-surface px-4 py-2.5 text-[14px] text-text-primary placeholder:text-[#9CA3AF] focus:outline-none focus:border-accent mb-3"
          />
          <input
            type="password"
            placeholder="New password"
            className="w-full rounded-[10px] border border-border bg-surface px-4 py-2.5 text-[14px] text-text-primary placeholder:text-[#9CA3AF] focus:outline-none focus:border-accent mb-3"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            className="w-full rounded-[10px] border border-border bg-surface px-4 py-2.5 text-[14px] text-text-primary placeholder:text-[#9CA3AF] focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 rounded-[10px] bg-accent text-white text-[14px] font-medium hover:bg-accent-hover transition-colors">
            Update Password
          </button>
          <button className="px-5 py-2.5 rounded-[10px] border border-border text-text-secondary text-[14px] font-medium hover:bg-[#F9FAFB] dark:hover:bg-[#27272A] transition-colors">
            Sign Out Everywhere
          </button>
        </div>
      </div>
    </div>
  )
}

function FormField({
  label,
  type = 'text',
  defaultValue,
  placeholder,
}: {
  label: string
  type?: string
  defaultValue?: string
  placeholder?: string
}) {
  return (
    <div>
      <label className="text-[13px] font-medium text-text-secondary block mb-1.5">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-[10px] border border-border bg-surface px-4 py-2.5 text-[14px] text-text-primary placeholder:text-[#9CA3AF] focus:outline-none focus:border-accent"
      />
    </div>
  )
}
