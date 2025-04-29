import inquirer from 'inquirer';
import {
    AppNamePrompt,
    AuthorPrompt,
    BugsUrlPrompt,
    DescriptionPrompt,
    FrameworkPrompt,
    HomepagePrompt,
    KeywordsPrompt,
    LicensePrompt,
    PortPrompt,
    RepositoryUrlPrompt
} from '../prompts/index.js';
import type { ConfigsManager } from './ConfigsManager.js';
import type { FrameworksManager } from './FrameworksManager.js';

/**
 * Manages user prompts and input validation
 */
export class PromptManager {
    private configsManager: ConfigsManager;
    private frameworksManager: FrameworksManager;

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

    constructor(configsManager: ConfigsManager, frameworksManager: FrameworksManager) {
        this.configsManager = configsManager;
        this.frameworksManager = frameworksManager;
    }

    /**
     * Initializes the prompt manager
     */
    public async initializePrompts(): Promise<void> {
        this.frameworkPrompt = new FrameworkPrompt(this.configsManager, this.frameworksManager);
        this.appNamePrompt = new AppNamePrompt(this.configsManager, this.frameworksManager);
        this.portPrompt = new PortPrompt(this.configsManager, this.frameworksManager);
        this.descriptionPrompt = new DescriptionPrompt(this.configsManager, this.frameworksManager);

        this.authorPrompt = new AuthorPrompt(this.configsManager, this.frameworksManager);
        this.licensePrompt = new LicensePrompt(this.configsManager, this.frameworksManager);
        this.repositoryUrlPrompt = new RepositoryUrlPrompt(
            this.configsManager,
            this.frameworksManager
        );
        this.bugsUrlPrompt = new BugsUrlPrompt(this.configsManager, this.frameworksManager);
        this.homepagePrompt = new HomepagePrompt(this.configsManager, this.frameworksManager);
        this.keywordsPrompt = new KeywordsPrompt(this.configsManager, this.frameworksManager);
    }

    /**
     * Prompts for framework selection
     * @returns Selected framework
     */
    public async promptForFramework(): Promise<string> {
        if (this.configsManager.getFramework()) {
            await this.frameworkPrompt.validate(this.configsManager.getFramework());
            return this.configsManager.getFramework();
        }

        const { framework } = await inquirer.prompt([this.frameworkPrompt.getPrompt()]);

        return framework;
    }

    /**
     * Prompts for app name
     * @returns Selected name string
     */
    public async promptForAppName(): Promise<string> {
        if (this.configsManager.getName()) {
            await this.appNamePrompt.validate(this.configsManager.getName());
            return this.configsManager.getName();
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
            await this.descriptionPrompt.validate(this.configsManager.getDescription());
            return this.configsManager.getDescription();
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
            await this.portPrompt.validate(`${this.configsManager.getPort()}`);
            return this.configsManager.getPort();
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

    public async gatherConfiguration(): Promise<Record<string, unknown>> {
        const framwork = await this.promptForFramework();
        this.configsManager.setFramework(framwork);

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
}
