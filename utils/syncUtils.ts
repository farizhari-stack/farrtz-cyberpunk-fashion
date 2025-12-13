// Real-time sync utility using custom events and localStorage
// This ensures data syncs immediately between user and admin tabs

export const STORAGE_EVENTS = {
    FEEDBACK_UPDATED: 'farrtz_feedback_updated',
    CHAT_UPDATED: 'farrtz_chat_updated',
};

// Trigger custom event when data changes
export const triggerStorageEvent = (eventName: string) => {
    const event = new CustomEvent(eventName, {
        detail: { timestamp: Date.now() }
    });
    window.dispatchEvent(event);

    // Also dispatch to other tabs via storage event
    localStorage.setItem(`${eventName}_trigger`, Date.now().toString());
};

// Listen for storage changes from other tabs
export const setupStorageListener = (
    eventName: string,
    callback: () => void
) => {
    const handleStorage = (e: StorageEvent) => {
        if (e.key === `${eventName}_trigger`) {
            callback();
        }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
        window.removeEventListener('storage', handleStorage);
    };
};

// Listen for custom events in same tab
export const setupCustomEventListener = (
    eventName: string,
    callback: () => void
) => {
    const handleEvent = () => {
        callback();
    };

    window.addEventListener(eventName, handleEvent);

    return () => {
        window.removeEventListener(eventName, handleEvent);
    };
};
