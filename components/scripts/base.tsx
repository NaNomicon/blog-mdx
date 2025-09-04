"use client";
import { BundledLanguage, CodeBlock, CodeBlockBody, CodeBlockContent, CodeBlockCopyButton, CodeBlockFilename, CodeBlockFiles, CodeBlockHeader, CodeBlockItem, CodeBlockSelect, CodeBlockSelectContent, CodeBlockSelectItem, CodeBlockSelectTrigger, CodeBlockSelectValue } from "../ui/shadcn-io/code-block";

type BaseScriptProps = {
    command: string;
    flags?: string[];
    options?: Map<string, string | boolean>;
}
export default function BaseScript({ command, flags, options }: BaseScriptProps) {
    

    return (<>
        <CodeBlock data={[{ language: "sh", filename: "tar", code: "" }]} defaultValue={"sh"}>
            <CodeBlockHeader>
                <CodeBlockFiles>
                    {(item) => (
                        <CodeBlockFilename key={item.language} value={item.language}>
                            {item.filename}
                        </CodeBlockFilename>
                    )}
                </CodeBlockFiles>
                <CodeBlockSelect>
                    <CodeBlockSelectTrigger>
                        <CodeBlockSelectValue />
                    </CodeBlockSelectTrigger>
                    <CodeBlockSelectContent>
                        {(item) => (
                            <CodeBlockSelectItem key={item.language} value={item.language}>
                                {item.language}
                            </CodeBlockSelectItem>
                        )}
                    </CodeBlockSelectContent>
                </CodeBlockSelect>
                <CodeBlockCopyButton
                    onCopy={() => console.log('Copied code to clipboard')}
                    onError={() => console.error('Failed to copy code to clipboard')}
                />
            </CodeBlockHeader>
            <CodeBlockBody>
                {(item) => (
                    <CodeBlockItem key={item.language} value={item.language}>
                        <CodeBlockContent language={"sh" as BundledLanguage}>
                            {[
                                `${command}`,
                                ...(flags?.map((flag) => `\t${flag}`) ?? []),
                                ...Array.from(options?.entries() ?? [])
                                    .filter(([_, value]) => value !== undefined && value !== null && !value)
                                    .map(([key, value]) => {
                                        if (typeof value === "boolean")
                                            return `\t--${key}`;
                                        return `\t--${key}=${value}`;
                                    }),
                            ].join(' \\ \n')}
                        </CodeBlockContent>
                    </CodeBlockItem>
                )}
            </CodeBlockBody>
        </CodeBlock>
    </>)
}