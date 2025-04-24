import { logger } from '@repo/logger';
import chalk from 'chalk';
import figlet from 'figlet';

export function printBanner(bannerTitle: string, bannerSubtitle: string, font = 'Standard'): void {
    const banner = figlet.textSync(bannerTitle, {
        font: font,
        horizontalLayout: 'default',
        verticalLayout: 'default'
    });

    logger.log(chalk.cyan(banner));
    logger.log(chalk.bold.bgCyan(`${bannerSubtitle}\n`));
}
