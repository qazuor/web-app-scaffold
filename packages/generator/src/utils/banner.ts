import chalk from 'chalk';
import figlet from 'figlet';

export function printBanner(bannerTitle: string, bannerSubtitle: string, font = 'Standard'): void {
    const banner = figlet.textSync(bannerTitle, {
        font: font,
        horizontalLayout: 'default',
        verticalLayout: 'default',
    });

    console.log(chalk.cyan(banner));
    console.log(chalk.bold.bgCyan(`${bannerSubtitle}\n`));
}
