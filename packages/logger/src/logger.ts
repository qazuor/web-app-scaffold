import chalk from 'chalk';
import figlet from 'figlet';
import { summer } from 'gradient-string';
import terminalLink from 'terminal-link';
import type { LogOptions } from './types';

// Color palette for different log types
export const colors = {
    info: chalk.hex('#00BFFF'),
    success: chalk.hex('#32CD32'),
    warn: chalk.hex('#FFD700'),
    error: chalk.bold.hex('#FF4C4C'),
    title: chalk.bold.hex('#FFA500'),
    subtitle: chalk.hex('#FFA500'),
    step: chalk.hex('#00CED1'),
    skip: chalk.hex('#00CED1'),
    file: chalk.hex('#7B68EE'),
    dir: chalk.hex('#9370DB'),
    path: chalk.cyan
};

// Default icons for different log types
export const defaultIcons = {
    info: 'ℹ️',
    success: '✅',
    warn: '⚠️',
    error: '❌',
    title: '🚀',
    subtitle: '📌',
    step: '🔹',
    skip: '⏩',
    file: '📄',
    dir: '📁'
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
    skip: 'SKIPPED',
    file: 'FILE',
    dir: 'DIRECTORY',
    title: 'TITLE',
    subtitle: 'SUBTITLE'
};

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
        options: LogOptions = {}
    ): string {
        const {
            title = defaultTitles[type] || '',
            dontUseTitle = false,
            icon = defaultIcons[type] || '',
            dontUseIcon = false,
            subtitle
        } = options;

        const prefix = this.buildPrefix(icon, dontUseIcon, title, dontUseTitle, type);
        return this.buildMessage(
            prefix,
            message,
            subtitle,
            (title?.length + 2 || 0) + (icon ? 3 : 0)
        );
    },

    /**
     * Builds the prefix for a log message
     */
    buildPrefix(
        icon: string,
        dontUseIcon: boolean,
        title: string,
        dontUseTitle: boolean,
        type: Exclude<keyof typeof colors, 'path'>
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
    buildMessage(
        prefix: string,
        message: string,
        subtitle: string | undefined,
        subtitlePadLenght: number
    ): string {
        if (subtitle) {
            const subtitlePad = ' '.repeat(subtitlePadLenght);
            let formatedSubtitle = subtitle.replace(/\n/g, `\n${subtitlePad}`);
            const linkRegex = /(https?|ftp):\/\/[^\s/$.?#].[^\s]*/gm;
            formatedSubtitle = formatedSubtitle.replace(linkRegex, (match) => {
                return chalk.cyan(terminalLink(match, match));
            });

            return `${prefix + message}\n${' '.repeat(subtitlePadLenght)}${formatedSubtitle}`;
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
     * Log an error object with Stack trace (work only in debug mode)
     * @param error Error to log
     */
    debug(error: Error): void {
        console.error(this.formatLog('error', error.message));
        if (process.env.DEBUG) {
            console.error(error);
            console.error('Stack trace:', error.stack);
        }
    },

    /**
     * Log a title (section header)
     * @param message Title text
     * @param options Formatting options
     */
    title(message: string, options: LogOptions = {}): void {
        const formattedTitle = this.formatLog('title', message.toUpperCase(), {
            ...options,
            dontUseTitle: true
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
                dontUseTitle: true
            })
        );
    },

    /**
     * Log a step in a process
     * @param message Step description
     * @param options Formatting options
     */
    step(message: string, options: LogOptions = {}): void {
        console.log('\n-----------------------------------------------------');
        console.log(this.formatLog('step', message, options));
        console.log('\n');
    },

    /**
     * Log a skipped step in a process
     * @param message Skip reason description
     * @param options Formatting options
     */
    skip(message: string, options: LogOptions = {}): void {
        console.log(this.formatLog('skip', message, options));
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

    /**
     * Log a plain console log
     * @param message Operation description
     * @param title Label for Log message
     */
    log(message: string, title?: string): void {
        if (title) {
            console.log(`${title} ==> ${message}`);
        } else {
            console.log(message);
        }
    },

    /**
     * Prints a banner with the given title and subtitle
     */
    banner(bannerTitle: string, bannerSubtitle: string, font = 'Standard'): void {
        const banner = figlet.textSync(bannerTitle, {
            font: font as figlet.Fonts,
            horizontalLayout: 'default',
            verticalLayout: 'default',
            width: 120,
            whitespaceBreak: true
        });
        console.log(summer(banner));
        console.log(chalk.bold.bgCyan(`${bannerSubtitle}\n`));
    },

    link(url: string, title?: string): void {
        const link = terminalLink(title || url, url);
        console.log(chalk.cyan(link));
    }
};
