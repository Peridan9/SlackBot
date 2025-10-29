// Delete confirmation modal builder
// This modal asks for confirmation before deleting a channel configuration

export interface DeleteModalMetadata {
  channelId: string;
  channelName: string;
}

export function buildDeleteConfirmModal(
  channelId: string,
  channelName: string
) {
  return {
    type: 'modal' as const,
    callback_id: 'delete_confirm_modal',
    title: {
      type: 'plain_text' as const,
      text: 'Confirm Delete'
    },
    submit: {
      type: 'plain_text' as const,
      text: 'Delete'
    },
    close: {
      type: 'plain_text' as const,
      text: 'Cancel'
    },
    // Store channel context in metadata
    private_metadata: JSON.stringify({
      channelId,
      channelName
    } as DeleteModalMetadata),
    blocks: [
      // Warning section
      {
        type: 'section' as const,
        text: {
          type: 'mrkdwn' as const,
          text: `⚠️ *Are you sure you want to delete the configuration for #${channelName}?*\n\n` +
                `This will:\n` +
                `• Stop sending reminders to monitored users\n` +
                `• Stop publishing daily reports\n` +
                `• Remove all pending reports for this channel\n\n` +
                `⚠️ *This action cannot be undone!*`
        }
      }
    ]
  };
}

