// Report modal builder
// This function creates the modal view for submitting daily reports

import { ChannelConfig } from '../types';

export interface ReportModalMetadata {
  userId: string;
  channels: {
    channelId: string;
    channelName: string;
  }[];
}

export function buildReportModal(userId: string, channels: ChannelConfig[]) {
  // Build channel options for the dropdown
  const channelOptions = channels.map(config => ({
    text: {
      type: 'plain_text' as const,
      text: `#${config.channelName}`
    },
    value: config.channelId
  }));

  return {
    type: 'modal' as const,
    callback_id: 'report_modal_submit',
    title: {
      type: 'plain_text' as const,
      text: 'Submit Daily Report'
    },
    submit: {
      type: 'plain_text' as const,
      text: 'Submit'
    },
    close: {
      type: 'plain_text' as const,
      text: 'Cancel'
    },
    // Store user context and channel info in metadata
    private_metadata: JSON.stringify({
      userId,
      channels: channels.map(c => ({
        channelId: c.channelId,
        channelName: c.channelName
      }))
    } as ReportModalMetadata),
    blocks: [
      // Header section
      {
        type: 'section' as const,
        text: {
          type: 'mrkdwn' as const,
          text: '📝 *Submit your daily report*\n\nSelect the channel and write your update:'
        }
      },
      {
        type: 'divider' as const
      },
      // Input 1: Channel selection
      {
        type: 'input' as const,
        block_id: 'channel_block',
        label: {
          type: 'plain_text' as const,
          text: 'Select channel'
        },
        element: {
          type: 'static_select' as const,
          action_id: 'channel_select',
          placeholder: {
            type: 'plain_text' as const,
            text: 'Choose a channel...'
          },
          options: channelOptions
        },
        hint: {
          type: 'plain_text' as const,
          text: 'Which channel is this report for?'
        }
      },
      // Input 2: Report text
      {
        type: 'input' as const,
        block_id: 'report_block',
        label: {
          type: 'plain_text' as const,
          text: 'Your report'
        },
        element: {
          type: 'plain_text_input' as const,
          action_id: 'report_input',
          multiline: true,
          min_length: 10,
          max_length: 1000,
          placeholder: {
            type: 'plain_text' as const,
            text: 'What did you work on today?\n\n• Task 1\n• Task 2\n• ...'
          }
        },
        hint: {
          type: 'plain_text' as const,
          text: 'Share your progress, accomplishments, and any blockers'
        }
      }
    ]
  };
}

