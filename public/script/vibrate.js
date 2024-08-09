export const vibrate = ({
	duration = 10,
	style = 'medium'
} = {}) => window?.navigator?.vibrate?.(duration) ?? window?.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.(style)