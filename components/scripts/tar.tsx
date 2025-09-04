"use client";

import BaseScript from "./base";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useState } from "react";
import { Input } from "../ui/input";

export default function Tar() {
    const [options, setOptions] = useState<Map<string, string | boolean>>(new Map([
        ["extract", true],
        ["verbose", true],
        ["gzip", true],
        ["file", "file.txt"],
    ]));

    return (<>
        <div>
            <div className="flex items-center space-x-2">
                {/* @ts-expect-error - checked is a boolean */}
                <Switch id="extract" defaultChecked={options.get("extract")} onCheckedChange={checked => {
                    setOptions(new Map([...options, ["extract", !checked]]));
                    console.log(options);
                }} />
                <Label htmlFor="extract">Extract</Label>
            </div>
            <div className="flex items-center space-x-2">
                {/* @ts-expect-error - checked is a boolean */}
                <Switch id="verbose" defaultChecked={options.get("verbose")} onCheckedChange={checked => {
                    setOptions(new Map([...options, ["verbose", !checked]]));
                    console.log(options);
                }} />
                <Label htmlFor="verbose">Verbose</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Switch id="gzip" defaultChecked={options.get("gzip") as boolean} onCheckedChange={checked => {
                    setOptions(new Map([...options, ["gzip", !checked]]));
                    console.log(options);
                }} />
                <Label htmlFor="gzip">Gzip</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Label htmlFor="file">File</Label>
                <Input id="file" defaultValue={options.get("file") as string} onChange={e => {
                    setOptions(new Map([...options, ["file", e.target.value]]));
                    console.log(options);
                }} />
            </div>
        </div>
        <BaseScript command="tar" options={options} />
    </>)
}