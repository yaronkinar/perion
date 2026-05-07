import type { Meta, StoryObj } from '@storybook/vue3';

const matrixRows = [
  {
    element: 'Users Table',
    admin: '✅ Visible',
    editor: '✅ Visible',
    viewer: '✅ Visible',
    description: 'List of all users (Viewer: role column hidden)',
  },
  {
    element: '└─ Add User button',
    admin: '✅ Enabled',
    editor: '❌ Hidden',
    viewer: '❌ Hidden',
    description: 'Create new user',
  },
  {
    element: '└─ Edit button (per row)',
    admin: '✅ Enabled',
    editor: '✅ Enabled',
    viewer: '❌ Hidden',
    description: 'Modify user details',
  },
  {
    element: '└─ Delete button (per row)',
    admin: '✅ Enabled',
    editor: '❌ Hidden',
    viewer: '❌ Hidden',
    description: 'Remove user',
  },
  {
    element: '└─ Change Role dropdown (inside Edit User modal)',
    admin: '✅ Enabled',
    editor: '✅ Enabled',
    viewer: '❌ Hidden',
    description: 'Assign role to user',
  },
  {
    element: 'Roles section',
    admin: '✅ Visible',
    editor: '✅ Visible',
    viewer: '❌ Hidden',
    description: 'List of roles',
  },
  {
    element: '└─ Role details/permissions',
    admin: '✅ Visible',
    editor: '✅ Visible',
    viewer: '❌ Hidden',
    description: 'View role permissions',
  },
  {
    element: '└─ Edit Role button',
    admin: '✅ Enabled',
    editor: '🔒 Disabled',
    viewer: '❌ Hidden',
    description: 'Modify role permissions (Editor can view only)',
  },
  {
    element: 'Header/Nav',
    admin: '',
    editor: '',
    viewer: '',
    description: '',
  },
  {
    element: '└─ Current User Display',
    admin: '✅ Visible',
    editor: '✅ Visible',
    viewer: '✅ Visible',
    description: 'Shows logged-in user',
  },
  {
    element: '└─ Logout Button',
    admin: '✅ Visible',
    editor: '✅ Visible',
    viewer: '✅ Visible',
    description: 'Return to user selection',
  },
];

const meta: Meta = {
  title: 'Docs/RBAC Matrix',
  parameters: {
    docs: {
      description: {
        component:
          'Single-source RBAC UI visibility matrix for dashboard behavior.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const DashboardMatrix: Story = {
  render: () => ({
    setup() {
      return { matrixRows };
    },
    template: `
      <div style="padding: 12px; max-width: 1200px;">
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Dashboard RBAC Matrix</h2>
        <p style="margin-bottom: 12px; color: #475569;">
          Canonical UI behavior for Admin, Editor, and Viewer roles.
        </p>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="text-align: left; border: 1px solid #e2e8f0; padding: 8px;">UI Element</th>
              <th style="text-align: left; border: 1px solid #e2e8f0; padding: 8px;">Admin</th>
              <th style="text-align: left; border: 1px solid #e2e8f0; padding: 8px;">Editor</th>
              <th style="text-align: left; border: 1px solid #e2e8f0; padding: 8px;">Viewer</th>
              <th style="text-align: left; border: 1px solid #e2e8f0; padding: 8px;">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in matrixRows" :key="row.element">
              <td style="border: 1px solid #e2e8f0; padding: 8px;">{{ row.element }}</td>
              <td style="border: 1px solid #e2e8f0; padding: 8px;">{{ row.admin }}</td>
              <td style="border: 1px solid #e2e8f0; padding: 8px;">{{ row.editor }}</td>
              <td style="border: 1px solid #e2e8f0; padding: 8px;">{{ row.viewer }}</td>
              <td style="border: 1px solid #e2e8f0; padding: 8px;">{{ row.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
  }),
};
