import { describe, expect, it } from 'vitest';
import { defaultIcons, defaultTitles, logger } from '../logger';

describe('Logger', () => {
    it('should format log message with title and icon', () => {
        const message = 'Test message';
        const formattedLog = logger.formatLog('info', message);

        expect(formattedLog).toContain(defaultIcons.info);
        expect(formattedLog).toContain(defaultTitles.info);
        expect(formattedLog).toContain(message);
    });

    it('should format log message without title when dontUseTitle is true', () => {
        const message = 'Test message';
        const formattedLog = logger.formatLog('info', message, { dontUseTitle: true });

        expect(formattedLog).not.toContain(defaultTitles.info);
        expect(formattedLog).toContain(message);
    });

    it('should format log message without icon when dontUseIcon is true', () => {
        const message = 'Test message';
        const formattedLog = logger.formatLog('info', message, { dontUseIcon: true });

        expect(formattedLog).not.toContain(defaultIcons.info);
        expect(formattedLog).toContain(message);
    });

    it('should format log message with custom title and icon', () => {
        const message = 'Test message';
        const customTitle = 'Custom Title';
        const customIcon = '🔥';

        const formattedLog = logger.formatLog('info', message, {
            title: customTitle,
            icon: customIcon
        });

        expect(formattedLog).toContain(customIcon);
        expect(formattedLog).toContain(customTitle);
        expect(formattedLog).toContain(message);
    });

    it('should format log message with subtitle', () => {
        const message = 'Test message';
        const subtitle = 'Test subtitle';

        const formattedLog = logger.formatLog('info', message, { subtitle });

        expect(formattedLog).toContain(subtitle);
        expect(formattedLog).toContain(message);
    });
});
