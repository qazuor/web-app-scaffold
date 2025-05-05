import { logger } from '@repo/logger';
import chalk from 'chalk';
import inquirer from 'inquirer';
import type { Package } from '../entity/Package.js';
import {
    AdditionalPackagesPrompt,
    AppNamePrompt,
    AuthorPrompt,
    BugsUrlPrompt,
    DescriptionPrompt,
    FrameworkPrompt,
    HomepagePrompt,
    IconLibraryPrompt,
    KeywordsPrompt,
    LicensePrompt,
    OverwriteAppFolderPrompt,
    PortPrompt,
    RepositoryUrlPrompt,
    SharedPackageDescriptionPrompt,
    SharedPackageInstalationTypePrompt,
    SharedPackageNamePrompt,
    SharedPackageOverwriteFolderPrompt,
    UILibraryPrompt,
    UseAlreadyExistSharedPackagePrompt
} from '../prompts/index.js';
import type { SharedPackagesInfo } from '../types/index.js';
import { getSharedPackageByBasePackage, sharedPackageExists } from '../utils/creation-tracking.js';
import type { ConfigsManager } from './ConfigsManager.js';
import type { FrameworksManager } from './FrameworksManager.js';
import type { PackagesManager } from './PackagesManager.js';

/**
 * Manages user prompts and input validation
 */
export class PromptManager {
    private configsManager: ConfigsManager;
    private frameworksManager: FrameworksManager;
    private packagesManager: PackagesManager;

    private frameworkPrompt!: FrameworkPrompt;
    private appNamePrompt!: AppNamePrompt;
    private portPrompt!: PortPrompt;
    private descriptionPrompt!: DescriptionPrompt;

    private authorPrompt!: AuthorPrompt;
    private licensePrompt!: LicensePrompt;
    private repositoryUrlPrompt!: RepositoryUrlPrompt;
    private bugsUrlPrompt!: BugsUrlPrompt;
    private homepagePrompt!: HomepagePrompt;
    private keywordsPrompt!: KeywordsPrompt;

    private uiLibraryPrompt!: UILibraryPrompt;
    private iconLibraryPrompt!: IconLibraryPrompt;
    private additionalPackagesPrompt!: AdditionalPackagesPrompt;
    private useAlreadyExistSharedPackagePrompt!: UseAlreadyExistSharedPackagePrompt;

    private instalationTypePrompt!: SharedPackageInstalationTypePrompt;
    private sharedPackageNamePrompt!: SharedPackageNamePrompt;
    private sharedPackageDescriptionPrompt!: SharedPackageDescriptionPrompt;

    private overwriteAppFolderPrompt!: OverwriteAppFolderPrompt;
    private sharedPackageOverwriteFolderPrompt!: SharedPackageOverwriteFolderPrompt;

    constructor(
        configsManager: ConfigsManager,
        frameworksManager: FrameworksManager,
        packagesManager: PackagesManager
    ) {
        this.configsManager = configsManager;
        this.frameworksManager = frameworksManager;
        this.packagesManager = packagesManager;
    }

    /**
     * Initializes the prompt manager
     */
    public async initializePrompts(): Promise<void> {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const init = (classRef: any) => {
            return new classRef(this.configsManager, this.frameworksManager, this.packagesManager);
        };
        this.frameworkPrompt = init(FrameworkPrompt);
        this.appNamePrompt = init(AppNamePrompt);
        this.portPrompt = init(PortPrompt);
        this.descriptionPrompt = init(DescriptionPrompt);

        this.authorPrompt = init(AuthorPrompt);
        this.licensePrompt = init(LicensePrompt);
        this.repositoryUrlPrompt = init(RepositoryUrlPrompt);
        this.bugsUrlPrompt = init(BugsUrlPrompt);
        this.homepagePrompt = init(HomepagePrompt);
        this.keywordsPrompt = init(KeywordsPrompt);

        this.uiLibraryPrompt = init(UILibraryPrompt);
        this.iconLibraryPrompt = init(IconLibraryPrompt);
        this.additionalPackagesPrompt = init(AdditionalPackagesPrompt);
        this.useAlreadyExistSharedPackagePrompt = init(UseAlreadyExistSharedPackagePrompt);

        this.instalationTypePrompt = init(SharedPackageInstalationTypePrompt);
        this.sharedPackageNamePrompt = init(SharedPackageNamePrompt);
        this.sharedPackageDescriptionPrompt = init(SharedPackageDescriptionPrompt);

        this.overwriteAppFolderPrompt = init(OverwriteAppFolderPrompt);
        this.sharedPackageOverwriteFolderPrompt = init(SharedPackageOverwriteFolderPrompt);
    }

    /**
     * Prompts for framework selection
     * @returns Selected framework
     */
    public async promptForFramework(): Promise<string> {
        // first check if we have a framework already selected from cli param
        // in this case the framework is only  the name string, not the entire object
        if (this.configsManager.getFrameworkName()) {
            const isValid = await this.frameworkPrompt.validate(
                this.configsManager.getFrameworkName()
            );
            if (typeof isValid === 'string') {
                logger.log(`${chalk.red('>>')} ${isValid}`);
            } else {
                return this.configsManager.getFrameworkName();
            }
        }

        const { framework } = await inquirer.prompt([this.frameworkPrompt.getPrompt()]);

        return framework;
    }

    /**
     * Prompts for app name
     * @returns Selected name string
     */
    public async promptForAppName(force = false): Promise<string> {
        if (!force && this.configsManager.getName()) {
            const isValid = await this.appNamePrompt.validate(this.configsManager.getName());
            if (typeof isValid === 'string') {
                logger.log(`${chalk.red('>>')} ${isValid}`);
            } else {
                return this.configsManager.getName();
            }
        }

        const { appName } = await inquirer.prompt([this.appNamePrompt.getPrompt()]);

        return appName;
    }

    /**
     * Prompts for app description
     * @returns Selected description string
     */
    public async promptForDescription(): Promise<string> {
        if (this.configsManager.getDescription()) {
            const isValid = await this.descriptionPrompt.validate(
                this.configsManager.getDescription()
            );
            if (typeof isValid === 'string') {
                logger.log(`${chalk.red('>>')} ${isValid}`);
            } else {
                return this.configsManager.getDescription();
            }
        }

        const { description } = await inquirer.prompt([this.descriptionPrompt.getPrompt()]);

        return description;
    }

    /**
     * Prompts for app port
     * @returns Selected port number
     */
    public async promptForAppPort(): Promise<number> {
        if (this.configsManager.getPort()) {
            const isValid = await this.portPrompt.validate(`${this.configsManager.getPort()}`);
            if (typeof isValid === 'string') {
                logger.log(`${chalk.red('>>')} ${isValid}`);
            } else {
                return this.configsManager.getPort();
            }
        }

        const { port } = await inquirer.prompt([this.portPrompt.getPrompt()]);

        return Number.parseInt(port, 10);
    }

    /**
     * Prompts for author name
     * @returns Selected author string
     */
    public async promptForAuthor(): Promise<string> {
        const { author } = await inquirer.prompt([this.authorPrompt.getPrompt()]);
        return author;
    }

    /**
     * Prompts for author license
     * @returns Selected license string
     */
    public async promptForLicense(): Promise<string> {
        const { license } = await inquirer.prompt([this.licensePrompt.getPrompt()]);
        return license;
    }

    /**
     * Prompts for repository urls
     * @returns Selected repository urls string
     */
    public async promptForRepositoryUrl(): Promise<string> {
        const { repositoryUrl } = await inquirer.prompt([this.repositoryUrlPrompt.getPrompt()]);
        return repositoryUrl;
    }

    /**
     * Prompts for homepage
     * @returns Selected homepage string
     */
    public async promptForHomepage(): Promise<string> {
        const { homepage } = await inquirer.prompt([this.homepagePrompt.getPrompt()]);
        return homepage;
    }

    /**
     * Prompts for bugs url
     * @returns Selected bugs url string
     */
    public async promptForBugsUrl(): Promise<string> {
        const { bugsUrl } = await inquirer.prompt([this.bugsUrlPrompt.getPrompt()]);
        return bugsUrl;
    }

    /**
     * Prompts for keywords
     * @returns Selected keywords string
     */
    public async promptForKeywords(): Promise<string> {
        const { keywords } = await inquirer.prompt([this.keywordsPrompt.getPrompt()]);
        return keywords;
    }

    /**
     * Prompts for UI Library package
     * @returns Selected ui library package obj
     */
    public async promptForUILibrary(): Promise<Package> {
        const { uiLibraryPkgName } = await inquirer.prompt([this.uiLibraryPrompt.getPrompt()]);
        return this.packagesManager.getPackageByName(uiLibraryPkgName);
    }

    /**
     * Prompts for Icon Library package
     * @returns Selected Icon library package obj
     */
    public async promptForIconLibrary(): Promise<Package> {
        const { iconLibraryPkgName } = await inquirer.prompt([this.iconLibraryPrompt.getPrompt()]);
        return this.packagesManager.getPackageByName(iconLibraryPkgName);
    }

    /**
     * Prompts for additional packages
     * @returns Selected additional packages objs
     */
    public async promptForAdditionalPackages(): Promise<Package[]> {
        const { selectedPackages } = await inquirer.prompt([
            this.additionalPackagesPrompt.getPrompt()
        ]);
        for (const pkgName of selectedPackages) {
            const sharedPackage = await sharedPackageExists(pkgName);
            if (sharedPackage) {
                const pkg = this.packagesManager.getPackageByName(pkgName);
                const { useAlreadyExistSharedPackage } = await inquirer.prompt([
                    this.useAlreadyExistSharedPackagePrompt.getSharedPrompt(pkg)
                ]);

                if (useAlreadyExistSharedPackage === 'installNew') {
                    logger.log(
                        `${chalk.green('>>')} ${pkgName} will be installed as a new package`
                    );
                } else {
                    const sharedPackage = await getSharedPackageByBasePackage(pkgName);
                    if (sharedPackage) {
                        pkg.setUseAlreadyInstalledSharedPackage(sharedPackage.name);
                    }
                    logger.log(
                        `${chalk.green('>>')} ${pkgName} will be used an already created shared package`
                    );
                }
            }
        }
        // markar como que va a usar el ya instalado..
        // podriamos filtrar el p[ackage de la lista, y agregarlo separado despues]
        return selectedPackages.map((pkgName: string) =>
            this.packagesManager.getPackageByName(pkgName)
        );
    }

    /**
     * Prompts for instalation type
     * @param pkg - Package to prompt for
     * @returns Instalation type info
     */
    public async promptForPackageInstalationType(pkg: Package): Promise<string> {
        const { installationType } = await inquirer.prompt([
            this.instalationTypePrompt.getSharedPrompt(pkg)
        ]);
        return installationType;
    }

    /**
     * Prompts for shared package name
     * @param pkg - Package to prompt for
     * @returns Selected shared package name string
     */
    public async promptForSharedPackageName(pkg: Package): Promise<string> {
        const { packageName } = await inquirer.prompt([
            this.sharedPackageNamePrompt.getSharedPrompt(pkg)
        ]);
        return packageName;
    }

    /**
     * Prompts for shared package description
     * @param pkg - Package to prompt for
     * @returns Selected shared package description string
     */
    public async promptForSharedPackageDescription(pkg: Package): Promise<string> {
        const { packageDescription } = await inquirer.prompt([
            this.sharedPackageDescriptionPrompt.getSharedPrompt(pkg)
        ]);
        return packageDescription;
    }

    /**
     * Prompts for overwrite app folder
     * @returns boolean indicating if the folder should be overwritten
     */
    public async promptForOverwriteAppFolder(): Promise<string> {
        const { overwrite } = await inquirer.prompt([this.overwriteAppFolderPrompt.getPrompt()]);
        return overwrite;
    }

    /**
     * Prompts for overwrite shared package folder
     * @param pkg - Package to prompt for
     * @returns boolean indicating if the folder should be overwritten
     */
    public async promptForOverwriteSharedPackageFolder(pkg: Package): Promise<string> {
        const { overwrite } = await inquirer.prompt([
            this.sharedPackageOverwriteFolderPrompt.getSharedPrompt(pkg)
        ]);
        return overwrite;
    }

    public async gatherConfiguration(): Promise<Record<string, unknown>> {
        const framwork = await this.promptForFramework();
        this.configsManager.setFramework(this.frameworksManager.getFrameworkByName(framwork));

        const name = await this.promptForAppName();
        this.configsManager.setName(name);

        const description = await this.promptForDescription();
        this.configsManager.setDescription(description);

        const port = await this.promptForAppPort();
        this.configsManager.setPort(port);

        return { framwork, name, description, port };
    }

    public async gatherMetadata(): Promise<Record<string, unknown>> {
        const homepage = await this.promptForHomepage();
        this.configsManager.setHomepage(homepage);

        const license = await this.promptForLicense();
        this.configsManager.setLicense(license);

        const author = await this.promptForAuthor();
        this.configsManager.setAuthor(author);

        const repositoryUrl = await this.promptForRepositoryUrl();
        this.configsManager.setRepo(repositoryUrl);

        const bugsUrl = await this.promptForBugsUrl();
        this.configsManager.setBugs(bugsUrl);

        const keywords = await this.promptForKeywords();
        this.configsManager.setKeywords(keywords.split(',').map((s) => s.trim()));

        return { author, homepage, repositoryUrl, bugsUrl, license, keywords };
    }

    public async gatherUILibraryPackage(): Promise<Package> {
        const UILibraryPackage = await this.promptForUILibrary();
        await this.configsManager.setUILIbrary(UILibraryPackage);
        return UILibraryPackage;
    }

    public async gatherIconLibraryPackage(): Promise<Package> {
        const iconLibraryPackage = await this.promptForIconLibrary();
        await this.configsManager.setIconLibrary(iconLibraryPackage);
        return iconLibraryPackage;
    }

    public async gatherAdditionalPackages(): Promise<Package[]> {
        const selectedPackages = await this.promptForAdditionalPackages();
        for (const pkg of selectedPackages) {
            await this.configsManager.addSelectedPackage(pkg);
        }
        return selectedPackages;
    }

    public async gatherInstallationInfoForPackages(
        selectedPackages: Package[]
    ): Promise<SharedPackagesInfo[]> {
        const sharedPackagesInfo: SharedPackagesInfo[] = [];
        for (const pkg of selectedPackages) {
            if (pkg.canBeShared()) {
                const instalationType = await this.promptForPackageInstalationType(pkg);
                let sharedName: string | undefined = undefined;
                let sharedDescription: string | undefined = undefined;
                if (instalationType === 'shared') {
                    sharedName = await this.promptForSharedPackageName(pkg);
                    sharedDescription = await this.promptForSharedPackageDescription(pkg);
                }
                const sharedPackageInfo = {
                    isShared: instalationType === 'shared',
                    packageName: sharedName,
                    packageDescription: sharedDescription
                };
                sharedPackagesInfo.push(sharedPackageInfo);
                pkg.setInstalationInfo(sharedPackageInfo);
            }
        }
        return sharedPackagesInfo;
    }

    public async gatherExtraOptionsForPackages(selectedPackages: Package[]): Promise<undefined> {
        for (const pkg of selectedPackages) {
            if (pkg.hasExtraOptons()) {
                const extraOptionsPrompts = pkg.getExtraOptionsPrompts();
                for (const extraOptionsPrompt of extraOptionsPrompts) {
                    const extraOptionsPromptResult = await inquirer.prompt([extraOptionsPrompt]);
                    pkg.setExtraOptionsPromptResult(extraOptionsPromptResult);
                }
            }
        }
    }

    public async allReadyPrompt() {
        const { continueInstalation } = await inquirer.prompt([
            {
                name: 'continueInstalation',
                type: 'confirm',
                message:
                    'All information are Ready. Do you want to continue with the app/shared packages creation?',
                default: true,
                choices: [
                    { name: 'Yes', value: true },
                    { name: 'No', value: false }
                ]
            }
        ]);
        return !!continueInstalation;
    }

    public async execPnpmInstall() {
        const { execPnpmInstall } = await inquirer.prompt([
            {
                name: 'execPnpmInstall',
                type: 'confirm',
                message: '"Run pnpm install to install all dependencies of the new app?',
                default: true,
                choices: [
                    { name: 'Yes', value: true },
                    { name: 'No', value: false }
                ]
            }
        ]);
        return !!execPnpmInstall;
    }
}
