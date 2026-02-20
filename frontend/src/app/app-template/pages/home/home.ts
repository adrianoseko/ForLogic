export class Home {
    private title: string;
    private content: string;

    constructor(title: string, content: string) {
        this.title = title;
        this.content = content;
    }

    public render(): string {
        return JSON.stringify({ title: this.title, content: this.content });
    }

    public updateContent(newContent: string): void {
        if (!newContent) {
            throw new Error('Content cannot be empty.');
        }
        this.content = newContent;
    }
}
