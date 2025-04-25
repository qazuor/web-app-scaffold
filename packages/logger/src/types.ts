/**
 * Options for log messages
 */
export interface LogOptions {
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

export type LogType =
    | 'info'
    | 'success'
    | 'warn'
    | 'error'
    | 'title'
    | 'subtitle'
    | 'step'
    | 'file'
    | 'dir'
    | 'log'
    | 'debug';
