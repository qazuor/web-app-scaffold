import chalk from 'chalk';

/**
 * Color palette for different log types
 */
export const colors = {
    info: chalk.hex('#00BFFF'),
    success: chalk.hex('#32CD32'),
    warn: chalk.hex('#FFD700'),
    error: chalk.bold.hex('#FF4C4C'),
    title: chalk.bold.hex('#FFA500'),
    subtitle: chalk.hex('#FFA500'),
    step: chalk.hex('#00CED1'),
    file: chalk.hex('#7B68EE'),
    dir: chalk.hex('#9370DB'),
    path: chalk.cyan,
};

/**
 * Default icons for different log types
 */
export const defaultIcons = {
    info: 'ℹ️',
    success: '✅',
    warn: '⚠️',
    error: '❌',
    title: '🚀',
    subtitle: '📌',
    step: '🔹',
    file: '📄',
    dir: '📁',
};

/**
 * Default titles for different log types
 */
export const defaultTitles = {
    info: 'INFO',
    success: 'SUCCESS',
    warn: 'WARNING',
    error: 'ERROR',
    step: 'STEP',
    file: 'FILE',
    dir: 'DIRECTORY',
    title: 'TITLE',
    subtitle: 'SUBTITLE',
};

/**
 * Options for log messages
 */
interface LogOptions {
    /**
     * Optional title to display before the message
     * If not provided, a default title based on log type will be used
     */
    title?: string;

    /**
     * If true, no title will be displayed
     * @default false
     */
    dontUseTitle?: boolean;

    /**
     * Optional icon to display before the title/message
     * If not provided, a default icon based on log type will be used
     */
    icon?: string;

    /**
     * If true, no icon will be displayed
     * @default false
     */
    dontUseIcon?: boolean;

    /**
     * Optional subtitle to display between title and message
     */
    subtitle?: string;
}

/**
 * Enhanced logger with customizable formatting options
 */
export const logger = {
    /**
     * Format a log message with the specified options
     * @param type Log type (info, success, warn, error, etc.)
     * @param message Main message to display
     * @param options Formatting options
     * @returns Formatted log message
     */
    formatLog(
        type: Exclude<keyof typeof colors, 'path'>,
        message: string,
        options: LogOptions = {},
    ): string {
        const {
            title = defaultTitles[type] || '',
            dontUseTitle = false,
            icon = defaultIcons[type] || '',
            dontUseIcon = false,
            subtitle = '',
        } = options;

        const prefix = this.buildPrefix(icon, dontUseIcon, title, dontUseTitle, type);
        return this.buildMessage(prefix, message, subtitle);
    },

    /**
     * Builds the prefix for a log message
     */
    buildPrefix(
        icon: string,
        dontUseIcon: boolean,
        title: string,
        dontUseTitle: boolean,
        type: Exclude<keyof typeof colors, 'path'>,
    ): string {
        let prefix = '';
        if (!dontUseIcon && icon) {
            prefix += `${icon} `;
        }
        if (!dontUseTitle && title) {
            prefix += `${colors[type](title)}: `;
        }
        return prefix;
    },

    /**
     * Builds the complete message with prefix and optional subtitle
     */
    buildMessage(prefix: string, message: string, subtitle: string): string {
        if (subtitle) {
            return `${prefix + subtitle}\n${' '.repeat(prefix.length)}${message}`;
        }
        return prefix + message;
    },

    /**
     * Log an informational message
     * @param message Message to display
     * @param options Formatting options
     */
    info(message: string, options: LogOptions = {}): void {
        console.log(this.formatLog('info', message, options));
    },

    /**
     * Log a success message
     * @param message Message to display
     * @param options Formatting options
     */
    success(message: string, options: LogOptions = {}): void {
        console.log(this.formatLog('success', message, options));
    },

    /**
     * Log a warning message
     * @param message Message to display
     * @param options Formatting options
     */
    warn(message: string, options: LogOptions = {}): void {
        console.warn(this.formatLog('warn', message, options));
    },

    /**
     * Log an error message
     * @param message Message to display
     * @param options Formatting options
     */
    error(message: string, options: LogOptions = {}): void {
        console.error(this.formatLog('error', message, options));
    },

    /**
     * Log a title (section header)
     * @param message Title text
     * @param options Formatting options
     */
    title(message: string, options: LogOptions = {}): void {
        const formattedTitle = this.formatLog('title', message.toUpperCase(), {
            ...options,
            dontUseTitle: true,
        });
        console.log(`\n${formattedTitle}`);
        console.log(colors.title('─'.repeat(message.length + 2)));
    },

    /**
     * Log a subtitle (subsection header)
     * @param message Subtitle text
     * @param options Formatting options
     */
    subtitle(message: string, options: LogOptions = {}): void {
        console.log(
            this.formatLog('subtitle', message, {
                ...options,
                dontUseTitle: true,
            }),
        );
    },

    /**
     * Log a step in a process
     * @param message Step description
     * @param options Formatting options
     */
    step(message: string, options: LogOptions = {}): void {
        console.log(this.formatLog('step', message, options));
    },

    /**
     * Log a file operation
     * @param message Operation description
     * @param filePath Path to the file
     * @param options Formatting options
     */
    file(message: string, filePath: string, options: LogOptions = {}): void {
        console.log(this.formatLog('file', `${message} ${colors.path(filePath)}`, options));
    },

    /**
     * Log a directory operation
     * @param message Operation description
     * @param dirPath Path to the directory
     * @param options Formatting options
     */
    directory(message: string, dirPath: string, options: LogOptions = {}): void {
        console.log(this.formatLog('dir', `${message} ${colors.path(dirPath)}`, options));
    },
};
