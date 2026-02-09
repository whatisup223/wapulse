// Notification Helper Functions

/**
 * Check if browser supports notifications
 */
export const isNotificationSupported = (): boolean => {
    return 'Notification' in window;
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = (): NotificationPermission => {
    if (!isNotificationSupported()) return 'denied';
    return Notification.permission;
};

/**
 * Request notification permission from user
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!isNotificationSupported()) {
        console.warn('Notifications not supported');
        return 'denied';
    }

    try {
        const permission = await Notification.requestPermission();
        return permission;
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return 'denied';
    }
};

/**
 * Send a desktop notification
 */
export const sendNotification = (
    title: string,
    options?: NotificationOptions
): Notification | null => {
    if (!isNotificationSupported()) {
        console.warn('Notifications not supported');
        return null;
    }

    if (Notification.permission !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
    }

    try {
        const notification = new Notification(title, {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            ...options,
        });

        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);

        return notification;
    } catch (error) {
        console.error('Error sending notification:', error);
        return null;
    }
};

/**
 * Send notification for new message
 */
export const sendNewMessageNotification = (
    senderName: string,
    messagePreview: string,
    language: 'en' | 'ar' = 'ar'
): void => {
    const title = language === 'ar' ? `رسالة جديدة من ${senderName}` : `New message from ${senderName}`;

    sendNotification(title, {
        body: messagePreview,
        tag: 'new-message',
        requireInteraction: false,
    });
};

/**
 * Send notification for campaign status
 */
export const sendCampaignNotification = (
    campaignName: string,
    status: 'success' | 'failed' | 'completed',
    language: 'en' | 'ar' = 'ar'
): void => {
    const titles = {
        success: language === 'ar' ? 'تم إرسال الحملة بنجاح' : 'Campaign sent successfully',
        failed: language === 'ar' ? 'فشل إرسال الحملة' : 'Campaign failed',
        completed: language === 'ar' ? 'اكتملت الحملة' : 'Campaign completed',
    };

    const bodies = {
        success: language === 'ar' ? `تم إرسال "${campaignName}" بنجاح` : `"${campaignName}" sent successfully`,
        failed: language === 'ar' ? `فشل إرسال "${campaignName}"` : `"${campaignName}" failed to send`,
        completed: language === 'ar' ? `اكتملت "${campaignName}"` : `"${campaignName}" completed`,
    };

    sendNotification(titles[status], {
        body: bodies[status],
        tag: 'campaign-status',
    });
};

/**
 * Check if user has enabled desktop notifications in settings
 */
export const checkNotificationSettings = async (): Promise<boolean> => {
    try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        return data.desktopNotifications === true;
    } catch (error) {
        console.error('Error checking notification settings:', error);
        return false;
    }
};
