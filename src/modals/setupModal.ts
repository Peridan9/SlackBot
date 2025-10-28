// Setup modal builder
// This function creates the modal view for configuring daily reports
export interface SetupModalMetadata {
  channelId: string;
  channelName: string;
  createdBy: string;
}

export function buildSetupModal(
  channelId: string,
  channelName: string,
  createdBy: string
) {
  return {
    type: 'modal' as const,
    callback_id: 'setup_modal_submit',
    title: {
      type: 'plain_text' as const,
      text: 'Setup Daily Reports'
    },
    submit: {
      type: 'plain_text' as const,
      text: 'Submit'
    },
    close: {
      type: 'plain_text' as const,
      text: 'Cancel'
    },
    // Store channel context in metadata (we'll need it on submit)
    private_metadata: JSON.stringify({
      channelId,
      channelName,
      createdBy
    }),
    blocks: [
      // Header section
      {
        type: 'section' as const,
        text: {
          type: 'mrkdwn' as const,
          text: `Configure daily reports for *#${channelName}*`
        }
      },
      {
        type: 'divider' as const
      },
      // Input 1: Select users to monitor
      {
        type: 'input' as const,
        block_id: 'users_block',
        label: {
          type: 'plain_text' as const,
          text: 'Select users to monitor'
        },
        element: {
          type: 'multi_users_select' as const,
          action_id: 'users_select',
          placeholder: {
            type: 'plain_text' as const,
            text: 'Choose users...'
          }
        }
      },
      // Input 2: Reminder time
      {
        type: 'input' as const,
        block_id: 'reminder_time_block',
        label: {
          type: 'plain_text' as const,
          text: 'Reminder time'
        },
        element: {
          type: 'timepicker' as const,
          action_id: 'reminder_time_select',
          initial_time: '09:00',
          placeholder: {
            type: 'plain_text' as const,
            text: 'Select time'
          }
        },
        hint: {
          type: 'plain_text' as const,
          text: 'When to ask users for their daily reports'
        }
      },
      // Input 3: Report publishing time
      {
        type: 'input' as const,
        block_id: 'report_time_block',
        label: {
          type: 'plain_text' as const,
          text: 'Report publishing time'
        },
        element: {
          type: 'timepicker' as const,
          action_id: 'report_time_select',
          initial_time: '17:00',
          placeholder: {
            type: 'plain_text' as const,
            text: 'Select time'
          }
        },
        hint: {
          type: 'plain_text' as const,
          text: 'When to publish collected reports to the channel'
        }
      }
    ]
  };
}

